"use client";

import { useEffect, useState } from "react";

/**
 * Единый, линейный расчёт размера картины на экране.
 *
 * Отображаемый размер прямо пропорционален физической длинной стороне картины
 * (из widthCm/heightCm — те же значения, что и строковое поле dimensions):
 *
 *   140 см (длинная сторона) → REFERENCE_VW ширины экрана.
 *
 * Затем применяются:
 *  - нижний порог (MIN_WIDTH_FRACTION), чтобы крошечные работы были видны;
 *  - потолок по ширине экрана (MAX_WIDTH_FRACTION);
 *  - потолок по высоте экрана в РЕАЛЬНЫХ пикселях (MAX_HEIGHT_FRACTION).
 *
 * Пропорции (widthCm : heightCm) сохраняются всегда; порядок строго монотонный:
 * чем больше картина физически, тем больше (или равно) она на экране — инверсия
 * «меньшее выглядит больше, чем большее» исключена.
 */

const REFERENCE_CM = 140;
const REFERENCE_VW = 0.34; // 140 см → 34% ширины экрана
const MIN_WIDTH_FRACTION = 0.1; // нижний порог длинной стороны
const MAX_WIDTH_FRACTION = 0.44; // потолок длинной стороны по ширине
const MAX_HEIGHT_FRACTION = 0.42; // потолок по высоте экрана

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

export type ViewportSize = { width: number; height: number };

export function computeArtworkSize(
  widthCm: number,
  heightCm: number,
  viewport: ViewportSize,
  square = false
): { width: number; height: number } {
  const safeW = widthCm > 0 ? widthCm : 1;
  const safeH = heightCm > 0 ? heightCm : 1;
  const longSide = Math.max(safeW, safeH);

  // Линейный масштаб: 140 см длинной стороны → REFERENCE_VW ширины экрана.
  const pxPerCm = (viewport.width * REFERENCE_VW) / REFERENCE_CM;
  let longPx = longSide * pxPerCm;

  // Ограничиваем длинную сторону в пределах ширины экрана.
  longPx = clamp(
    longPx,
    viewport.width * MIN_WIDTH_FRACTION,
    viewport.width * MAX_WIDTH_FRACTION
  );

  let widthPx: number;
  let heightPx: number;
  if (square) {
    widthPx = longPx;
    heightPx = longPx;
  } else {
    widthPx = longPx * (safeW / longSide);
    heightPx = longPx * (safeH / longSide);
  }

  // Потолок по высоте — в реальных пикселях высоты экрана.
  if (heightPx > viewport.height * MAX_HEIGHT_FRACTION) {
    heightPx = viewport.height * MAX_HEIGHT_FRACTION;
    widthPx = square ? heightPx : heightPx * (safeW / safeH);
  }

  return { width: widthPx, height: heightPx };
}

const DEFAULT_VIEWPORT: ViewportSize = { width: 1440, height: 800 };

/**
 * Возвращает текущий размер вьюпорта. До монтирования возвращает стабильный
 * дефолт, поэтому SSR и первый клиентский рендер совпадают (нет hydration-ошибки).
 */
export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(DEFAULT_VIEWPORT);

  useEffect(() => {
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}