import { AUTH_HERO } from "@/lib/assets";

export function AuthPanel() {
  return (
    <div className="relative hidden min-h-[480px] overflow-hidden rounded-3xl lg:block">
      {/* Full purple background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7b3ff2] to-[#6326c9]" />

      {/* Heading anchored top-left */}
      <div className="relative z-20 px-10 pt-12">
        <h2 className="text-3xl font-bold leading-snug text-white">
          Very good works are
          <br />
          waiting for you
          <br />
          Sign up Now
        </h2>
        <div className="mt-8 h-28 w-px bg-white/40" />
      </div>

      {/* Person anchored bottom-right; left/top edges fade into the purple */}
      <div
        className="absolute bottom-0 right-0 z-10 h-[78%] w-[72%]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to left, #000 70%, transparent 100%), linear-gradient(to top, #000 80%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={AUTH_HERO} alt="Welcome" className="h-full w-full object-cover object-bottom" />
      </div>

      <div className="absolute bottom-10 left-10 z-20 h-1 w-12 rounded bg-white/70" />
    </div>
  );
}
