export const flags = {
  ocr: process.env["NEXT_PUBLIC_ENABLE_OCR"] === "true",
  reconciliation: process.env["NEXT_PUBLIC_ENABLE_RECONCILIATION"] === "true",
  multiCountry: process.env["NEXT_PUBLIC_ENABLE_MULTI_COUNTRY"] === "true",
} as const;

export type FeatureFlag = keyof typeof flags;
