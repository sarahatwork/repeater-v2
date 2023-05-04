import {
  IBlock,
  IBlockField,
  IBlockFieldDefinition,
  ISdkBlock,
  BlockFieldTypeSchema,
  TReference,
  TRichTextNode,
  TRichTextNodeWithReferences,
} from "./types";
import camelCase from "lodash/camelCase";

const BLOCKFIELD_DEF_REGEX =
  /(?<label>[\w\s]+):(?<type>\w+)(?:-(?<options>[\w\s-]+))?(?<required>!?)/;

export const parseSdkEntries = (sdkEntries?: ISdkBlock[]): IBlock[] =>
  sdkEntries?.map(({ repeaterProperties, ...block }) => ({
    ...block,
    properties: repeaterProperties.map(({ data, ...blockField }) => ({
      ...blockField,
      value: JSON.parse(data),
    })),
  })) || [];

export const stringifyEntriesForSdk = (entries: IBlock[]): ISdkBlock[] =>
  entries.map(({ properties, ...block }) => ({
    ...block,
    repeaterProperties: properties.map(({ value, ...blockField }) => ({
      ...blockField,
      data: JSON.stringify(value),
    })),
  }));

export const parseBlockFieldDefinitions = (
  input?: string
): IBlockFieldDefinition[] => {
  if (!input) throw new Error("BlockField definition input is undefined");

  return input.split(",").map((blockFieldDefString) => {
    const matches = blockFieldDefString.match(BLOCKFIELD_DEF_REGEX);
    if (!matches?.groups) {
      throw new Error(`Invalid blockField definition: ${blockFieldDefString}`);
    }
    const { label, type, options, required } = matches.groups;
    const parsedType = BlockFieldTypeSchema.parse(type);
    const parsedOptions = options?.split("-");
    if (parsedType === "dropdown" && !parsedOptions?.length) {
      throw new Error(
        `Missing options for dropdown definition: ${blockFieldDefString}`
      );
    }

    return {
      label,
      type: parsedType,
      isRequired: !!required,
      options: parsedOptions,
      name: camelCase(label),
    };
  });
};

export const getValidationMessage = (
  blockField: IBlockField
): string | null => {
  if (
    blockField.isRequired &&
    (blockField.value === null ||
      blockField.value === undefined ||
      blockField.value === "")
  ) {
    return "Field is required";
  }

  return null;
};

export const getIsFormInvalid = (entries: IBlock[]) => {
  return entries.some(getIsBlockInvalid);
};

export const getIsBlockInvalid = (block: IBlock) =>
  block.properties.some((blockField) => getValidationMessage(blockField));

export const getBlockTitle = (block: IBlock, index: number) =>
  block.properties.find((p) => p.type === "text")?.value ||
  `Block ${index + 1}`;

export const getBlockThumbnail = (block: IBlock) =>
  block.properties.find((p) => p.type === "media" && !!p.value)?.value.sys.id;

const getReferences = (node: TRichTextNode): TReference[] => {
  const references: TReference[] = [];

  if ("target" in node.data && node.data.target.sys.type === "Link") {
    references.push({
      contentful_id: node.data.target.sys.id,
      type: node.data.target.sys.linkType,
    });
  }

  if ("content" in node) {
    node.content.forEach((childNode) => {
      references.push(...getReferences(childNode));
    });
  }

  return references;
};

export const addReferencesNodeToRichTextValue = (
  value?: TRichTextNode
): TRichTextNodeWithReferences | undefined => {
  if (!value) return undefined;

  return {
    ...value,
    references: getReferences(value),
  };
};
