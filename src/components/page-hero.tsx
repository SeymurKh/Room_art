export function PageHero({
  kicker,
  title,
  copy,
}: {
  kicker: string;
  title: string;
  copy?: string;
}) {
  return (
    <section className="dark-room relative">
      <div className="room-shell flex min-h-[240px] flex-col items-center justify-center px-4 pb-10 pt-28 text-center md:min-h-[280px] md:pb-12 md:pt-32">
        <p className="section-kicker text-white/60">{kicker}</p>
        <h1 className="room-serif mt-3 text-3xl font-medium leading-[0.95] text-[#f4f1ea] md:mt-4 md:text-6xl">
          {title}
        </h1>
        {copy ? (
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/55 md:mt-5">{copy}</p>
        ) : null}
      </div>
      {/* Gradient fade — absolute, doesn't push content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 h-48 md:h-64"
        style={{
          top: "100%",
          background: "linear-gradient(to bottom, #0c0c0b, rgba(12,12,11,0.7) 30%, rgba(12,12,11,0.3) 60%, transparent)",
        }}
      />
    </section>
  );
}
