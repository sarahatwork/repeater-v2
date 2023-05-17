import {
  IBlock,
  TBlockField,
  TBlockFieldDefinition,
  ISdkBlock,
  BlockFieldTypeSchema,
  TReference,
  TRichTextNode,
  TRichTextNodeWithReferences,
  TSdkBlockField,
} from "./types";
import camelCase from "lodash/camelCase";
import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";

const BLOCKFIELD_DEF_REGEX =
  /(?<label>[^:]+):(?<type>\w+)(?:-(?<options>[^!]+))?(?<required>!?)/;

export const parseSdkBlocks = (sdkBlocks?: ISdkBlock[]): IBlock[] =>
  sdkBlocks?.map(({ data__REPEATER, ...block }) => ({
    ...block,
    fields: Object.values(data__REPEATER).map(({ data, ...blockField }) => ({
      ...blockField,
      value: data,
    })),
  })) || [];

export const stringifyBlocksForSdk = (blocks: IBlock[]): ISdkBlock[] =>
  blocks.map(({ fields, ...block }) => ({
    ...block,
    // "fields" is a protected property name in Gatsby
    // data__REPEATER will also help Gatsby identify repeater app data and handle it properly
    data__REPEATER: fields.reduce((acc, { value, ...blockField }) => {
      acc[blockField.name] = {
        ...blockField,
        data: value,
      };
      return acc;
    }, {} as Record<string, TSdkBlockField>),
  }));

export const parseBlockFieldDefinitions = (
  input?: string
): TBlockFieldDefinition[] => {
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

export const encodeBlockFieldDefinitions = (
  definitions: TBlockFieldDefinition[]
): string[] => {
  const matches = definitions
    .map(({ type, label, isRequired, ...props }) =>
      [
        label,
        ":",
        type,
        "options" in props && props.options
          ? `-${props.options.join("-")}`
          : "",
        isRequired ? "!" : "",
      ].join("")
    )
    .join()
    .match(/.{1,255}/g) as string[];

  return matches;
};

export const getValidationMessage = (
  blockField: TBlockField
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

export const getBlockTitle = (block: IBlock, index: number) => {
  const firstTextField = block.fields.find((p) =>
    ["text", "richText"].includes(p.type)
  );
  let out = "";
  if (firstTextField?.type === "text") {
    out = firstTextField.value;
  } else if (firstTextField?.type === "richText") {
    out = documentToPlainTextString(firstTextField.value);
  }

  out = out || `Block ${index + 1}`;

  return out;
};

export const getBlockThumbnail = (block: IBlock) => {
  const firstMediaField = block.fields.find(
    (p) =>
      ["mediaSingle", "mediaMultiple"].includes(p.type) &&
      p.value &&
      !(Array.isArray(p.value) && p.value.length === 0)
  );

  if (!firstMediaField) return;

  if (firstMediaField?.type === "mediaSingle") {
    return firstMediaField.value?.sys.id;
  }

  return firstMediaField.value?.[0]?.sys.id;
};

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
