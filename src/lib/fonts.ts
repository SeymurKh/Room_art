import localFont from "next/font/local";

/**
 * Общий шрифт для обоих root-layout-деревьев (публичное и админка).
 * Вынесен отдельно: с несколькими root layouts модуль шрифта
 * должен быть один, чтобы не грузить его дважды.
 */
export const inter = localFont({
  src: "../../public/fonts/Inter-VariableFont.ttf",
  variable: "--font-inter",
  display: "swap",
});