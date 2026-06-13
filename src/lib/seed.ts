/**
 * Seeds a starter set of per-user data when an account is created, so the
 * dashboard is populated on first login. Everything created here is owned by
 * the user (scoped by userId) and is fully editable from the UI.
 */
import { getStore } from "./db";

export async function seedUserData(userId: string): Promise<void> {
  const db = await getStore();

  const projects = [
    { name: "Design tools", desc: "Constantly growing. We're constantly making mistakes from which we learn and improve.", participants: 10, due: "2024-09-02", tag: "Design" },
    { name: "Premium Support", desc: "Pink is obviously a better color. Everyone born confident and everything taken away.", participants: 23, due: "2024-08-07", tag: "Support" },
    { name: "Developer First", desc: "For standing out. But the time is now to be okay to be the greatest you.", participants: 30, due: "2024-08-20", tag: "Dev" },
  ];

  const products = [
    { name: "BKLGO Hoodie", category: "Clothing", quantity: 12, sku: "243598234", price: 170750, status: "In Stock" },
    { name: "MacBook Pro", category: "Electronics", quantity: 63, sku: "877712", price: 433060, status: "Out of Stock" },
    { name: "Metro Bar Stool", category: "Furniture", quantity: 86, sku: "0134729", price: 320800, status: "In Stock" },
    { name: "Alchimia Chair", category: "Furniture", quantity: 22, sku: "113213", price: 170750, status: "In Stock" },
  ];

  const orders = [
    { customer: "David", email: "david@gmail.com", product: "BKLGO Hoodie", orderId: "#10421", status: "Paid", date: "2024-01-12" },
    { customer: "Warner", email: "warner@gmail.com", product: "MacBook Pro", orderId: "#10422", status: "Canceled", date: "2024-01-13" },
    { customer: "Smith", email: "smith@gmail.com", product: "Metro Bar Stool", orderId: "#10423", status: "Refunded", date: "2024-01-14" },
  ];

  const team = [
    { name: "Oliva Rhye", email: "oliva@gmail.com", role: "Admin" },
    { name: "Phoenix Baker", email: "phoenix@gmail.com", role: "Admin" },
    { name: "Lana Steiner", email: "lana@gmail.com", role: "Admin" },
  ];

  const now = new Date().toISOString();
  await Promise.all([
    ...projects.map((p) => db.collection("projects").insertOne({ userId, createdAt: now, ...p })),
    ...products.map((p) => db.collection("products").insertOne({ userId, createdAt: now, ...p })),
    ...orders.map((o) => db.collection("orders").insertOne({ userId, createdAt: now, ...o })),
    ...team.map((t) => db.collection("team").insertOne({ userId, createdAt: now, ...t })),
  ]);
}
