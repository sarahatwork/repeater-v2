export const BlockFieldTypes = {
  TEXT: "text",
  MEDIA_SINGLE: "mediaSingle",
  MEDIA_MULTIPLE: "mediaMultiple",
  RICH_TEXT: "richText",
  BOOLEAN: "boolean",
  REFERENCE_SINGLE: "referenceSingle",
  REFERENCE_MULTIPLE: "referenceMultiple",
} as const;

type BlockFieldType = (typeof BlockFieldTypes)[keyof typeof BlockFieldTypes];

export const BlockFieldLabels: Record<BlockFieldType, String> = {
  [BlockFieldTypes.TEXT]: "Text",
  [BlockFieldTypes.MEDIA_SINGLE]: "Asset - Single",
  [BlockFieldTypes.MEDIA_MULTIPLE]: "Asset - Multiple",
  [BlockFieldTypes.RICH_TEXT]: "Rich Text",
  [BlockFieldTypes.BOOLEAN]: "Boolean",
  [BlockFieldTypes.REFERENCE_SINGLE]: "Entry Reference - Single",
  [BlockFieldTypes.REFERENCE_MULTIPLE]: "Entry Reference - Multiple",
};
