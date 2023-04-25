export const FieldTypes = {
  NONE: "none",
  TEXT: "text",
  SLUG: "slug",
} as const;

export type TFieldTypeValue = (typeof FieldTypes)[keyof typeof FieldTypes];
