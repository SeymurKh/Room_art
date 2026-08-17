export const isVercel = process.env.VERCEL === "1";

export const isReadOnlyMode = () =>
  isVercel || process.env.READONLY_MODE === "1";