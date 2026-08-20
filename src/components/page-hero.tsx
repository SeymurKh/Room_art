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
    <section className="dark-room relative border-b border-white/10">
      <div className="room-shell flex min-h-[240px] flex-col items-center justify-center px-4 pb-10 pt-28 text-center md:min-h-[280px] md:pb-12 md:pt-32">
        <p className="section-kicker text-white/60">{kicker}</p>
        <h1 className="room-serif mt-3 text-3xl font-medium leading-[0.95] text-[#f4f1ea] md:mt-4 md:text-6xl">
          {title}
        </h1>
        {copy ? (
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/55 md:mt-5">{copy}</p>
        ) : null}
      </div>
    </section>
  );
}
