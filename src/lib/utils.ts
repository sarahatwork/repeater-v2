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
  /(?<label>[^:]+):(?<type>\w+)(?:-(?<options>[^!]+))?(?<required>!?)/;

export const parseSdkBlocks = (sdkBlocks?: ISdkBlock[]): IBlock[] =>
  sdkBlocks?.map(({ repeaterFields, ...block }) => ({
    ...block,
    fields: repeaterFields.map(({ data, ...blockField }) => ({
      ...blockField,
      value: JSON.parse(data),
    })),
  })) || [];

export const stringifyBlocksForSdk = (blocks: IBlock[]): ISdkBlock[] =>
  blocks.map(({ fields, ...block }) => ({
    ...block,
    repeaterFields: fields.map(({ value, ...blockField }) => ({
      ...blockField,
      data: JSON.stringify(value),
    })),
  }));

export const parseBlockFieldDefinitions = (
  input?: string
): IBlockFieldDefinition[] => {
  if (!input) throw new Error("Block Field Definitions input is undefined");

  return input.split(",").map((blockFieldDefString) => {
    const matches = blockFieldDefString.match(BLOCKFIELD_DEF_REGEX);
    if (!matches?.groups) {
      throw new Error(
        `Invalid Block Field Definitions: ${blockFieldDefString}`
      );
    }
    const { label, type, options, required } = matches.groups;
    const parsedType = BlockFieldTypeSchema.parse(type);
    const parsedOptions = options?.split("-");

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

export const getIsFormInvalid = (blocks: IBlock[]) => {
  return blocks.some(getIsBlockInvalid);
};

export const getIsBlockInvalid = (block: IBlock) =>
  block.fields.some((blockField) => getValidationMessage(blockField));

export const getBlockTitle = (block: IBlock, index: number) =>
  block.fields.find((p) => p.type === "text")?.value || `Block ${index + 1}`;

export const getBlockThumbnail = (block: IBlock) =>
  block.fields.find((p) => p.type === "media" && !!p.value)?.value.sys.id;

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
