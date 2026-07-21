export function SectionHeading({
  kicker,
  title,
  copy,
  light = false,
}: {
  kicker: string;
  title: string;
  copy?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className={`section-kicker ${light ? "text-white/54" : "text-[#6f6a61]"}`}>{kicker}</p>
      <h2 className={`room-serif mt-3 text-5xl font-medium leading-[0.94] md:text-7xl ${light ? "text-[#f4f1ea]" : ""}`}>
        {title}
      </h2>
      {copy ? <p className={`mt-5 max-w-xl text-sm leading-7 ${light ? "text-white/62" : "text-[#6f6a61]"}`}>{copy}</p> : null}
    </div>
  );
}
