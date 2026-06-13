/**
 * Storage abstraction with two interchangeable backends:
 *   1. MongoDB (via the official driver) when MONGODB_URI is reachable.
 *   2. A local JSON-file store as a zero-setup fallback so the app runs
 *      out of the box even without a database installed.
 *
 * Both backends expose the same minimal collection API used across the app.
 * Swapping between them requires no changes to calling code.
 */
import { MongoClient, Db } from "mongodb";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type Doc = Record<string, unknown> & { _id: string };
type Query = Record<string, unknown>;

export interface Collection {
  findOne(query: Query): Promise<Doc | null>;
  find(query?: Query, opts?: { sort?: Record<string, 1 | -1>; limit?: number }): Promise<Doc[]>;
  insertOne(doc: Omit<Doc, "_id"> & { _id?: string }): Promise<Doc>;
  updateOne(query: Query, patch: Record<string, unknown>): Promise<Doc | null>;
  deleteOne(query: Query): Promise<boolean>;
  count(query?: Query): Promise<number>;
}

export interface Store {
  collection(name: string): Collection;
}

export function newId(): string {
  return crypto.randomBytes(12).toString("hex");
}

/* ------------------------------------------------------------------ */
/* Shared query matching (used by the file store)                      */
/* ------------------------------------------------------------------ */

function matches(doc: Doc, query: Query): boolean {
  return Object.entries(query).every(([key, val]) => {
    const actual = (doc as Record<string, unknown>)[key];
    if (val && typeof val === "object" && "$in" in (val as object)) {
      const arr = (val as { $in: unknown[] }).$in;
      return arr.includes(actual);
    }
    return actual === val;
  });
}

function sortDocs(docs: Doc[], sort?: Record<string, 1 | -1>): Doc[] {
  if (!sort) return docs;
  const entries = Object.entries(sort);
  return [...docs].sort((a, b) => {
    for (const [key, dir] of entries) {
      const av = (a as Record<string, unknown>)[key] as never;
      const bv = (b as Record<string, unknown>)[key] as never;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
    }
    return 0;
  });
}

/* ------------------------------------------------------------------ */
/* File-backed store                                                   */
/* ------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

type FileData = Record<string, Doc[]>;

class FileStore implements Store {
  private cache: FileData | null = null;
  private writing: Promise<void> = Promise.resolve();

  private async load(): Promise<FileData> {
    if (this.cache) return this.cache;
    try {
      const raw = await fs.readFile(DATA_FILE, "utf8");
      this.cache = JSON.parse(raw) as FileData;
    } catch {
      this.cache = {};
    }
    return this.cache;
  }

  private async persist(): Promise<void> {
    // Serialize writes to avoid interleaved file corruption.
    this.writing = this.writing.then(async () => {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(this.cache ?? {}, null, 2));
    });
    return this.writing;
  }

  collection(name: string): Collection {
    const self = this;
    return {
      async findOne(query) {
        const data = await self.load();
        return (data[name] ?? []).find((d) => matches(d, query)) ?? null;
      },
      async find(query = {}, opts = {}) {
        const data = await self.load();
        let docs = (data[name] ?? []).filter((d) => matches(d, query));
        docs = sortDocs(docs, opts.sort);
        if (opts.limit) docs = docs.slice(0, opts.limit);
        return docs.map((d) => ({ ...d }));
      },
      async insertOne(doc) {
        const data = await self.load();
        if (!data[name]) data[name] = [];
        const full: Doc = { _id: doc._id ?? newId(), ...doc } as Doc;
        data[name].push(full);
        await self.persist();
        return { ...full };
      },
      async updateOne(query, patch) {
        const data = await self.load();
        const list = data[name] ?? [];
        const target = list.find((d) => matches(d, query));
        if (!target) return null;
        Object.assign(target, patch);
        await self.persist();
        return { ...target };
      },
      async deleteOne(query) {
        const data = await self.load();
        const list = data[name] ?? [];
        const idx = list.findIndex((d) => matches(d, query));
        if (idx === -1) return false;
        list.splice(idx, 1);
        await self.persist();
        return true;
      },
      async count(query = {}) {
        const data = await self.load();
        return (data[name] ?? []).filter((d) => matches(d, query)).length;
      },
    };
  }
}

/* ------------------------------------------------------------------ */
/* MongoDB store                                                       */
/* ------------------------------------------------------------------ */

class MongoStore implements Store {
  constructor(private db: Db) {}

  collection(name: string): Collection {
    const coll = this.db.collection(name);
    return {
      async findOne(query) {
        return (await coll.findOne(query)) as Doc | null;
      },
      async find(query = {}, opts = {}) {
        let cursor = coll.find(query);
        if (opts.sort) cursor = cursor.sort(opts.sort);
        if (opts.limit) cursor = cursor.limit(opts.limit);
        return (await cursor.toArray()) as unknown as Doc[];
      },
      async insertOne(doc) {
        const full = { _id: doc._id ?? newId(), ...doc } as Doc;
        await coll.insertOne(full as never);
        return full;
      },
      async updateOne(query, patch) {
        await coll.updateOne(query, { $set: patch });
        return (await coll.findOne(query)) as Doc | null;
      },
      async deleteOne(query) {
        const res = await coll.deleteOne(query);
        return res.deletedCount > 0;
      },
      async count(query = {}) {
        return coll.countDocuments(query);
      },
    };
  }
}

/* ------------------------------------------------------------------ */
/* Backend selection (cached across hot reloads / invocations)         */
/* ------------------------------------------------------------------ */

declare global {
  // eslint-disable-next-line no-var
  var __storePromise: Promise<Store> | undefined;
}

async function selectStore(): Promise<Store> {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
      await client.connect();
      await client.db().command({ ping: 1 });
      console.log("[db] Using MongoDB backend");
      return new MongoStore(client.db());
    } catch {
      console.warn(
        "[db] MongoDB unreachable — falling back to local file store (.data/db.json)"
      );
    }
  } else {
    console.warn("[db] No MONGODB_URI set — using local file store (.data/db.json)");
  }
  return new FileStore();
}

export function getStore(): Promise<Store> {
  if (!global.__storePromise) {
    global.__storePromise = selectStore();
  }
  return global.__storePromise;
}
