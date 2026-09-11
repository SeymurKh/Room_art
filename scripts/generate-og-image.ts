import sharp from "sharp";
import path from "path";

const LOGO_PATH = path.join("public", "assets", "logo.png");
const OUTPUT_PATH = path.join("public", "og-image.png");

const WIDTH = 1200;
const HEIGHT = 630;
const PADDING = 120; // отступы по краям

async function generateOgImage() {
  // 1. Создаём тёмный фон
  const background = sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: { r: 18, g: 18, b: 18, alpha: 1 }, // #121212
    },
  });

  // 2. Читаем логотип и подгоняем по размеру с учётом отступов
  const maxLogoWidth = WIDTH - PADDING * 2;
  const maxLogoHeight = HEIGHT - PADDING * 2;

  const logoBuffer = await sharp(LOGO_PATH)
    .resize(maxLogoWidth, maxLogoHeight, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  const logoMeta = await sharp(logoBuffer).metadata();

  // 3. Центрируем логотип
  const left = Math.round((WIDTH - (logoMeta.width ?? 0)) / 2);
  const top = Math.round((HEIGHT - (logoMeta.height ?? 0)) / 2);

  // 4. Накладываем логотип на фон
  await background
    .composite([
      {
        input: logoBuffer,
        left,
        top,
      },
    ])
    .png()
    .toFile(OUTPUT_PATH);

  console.log(`✅ OG-изображение создано: ${OUTPUT_PATH}`);
  console.log(`   Размер: ${WIDTH}x${HEIGHT}`);
}

generateOgImage().catch((err) => {
  console.error("❌ Ошибка генерации OG-изображения:", err);
  process.exit(1);
});
