import {
  IEntry,
  IEntryProperty,
  IPropertyDefinition,
  ISdkEntry,
  PropertyTypeSchema,
  TReference,
  TRichTextNode,
  TRichTextNodeWithReferences,
} from "./types";
import camelCase from "lodash/camelCase";

const PROPERTY_DEF_REGEX =
  /(?<label>[\w\s]+):(?<type>\w+)(?:-(?<options>[\w\s-]+))?(?<required>!?)/;

export const parseSdkEntries = (sdkEntries?: ISdkEntry[]): IEntry[] =>
  sdkEntries?.map(({ repeaterProperties, ...entry }) => ({
    ...entry,
    properties: repeaterProperties.map(({ data, ...property }) => ({
      ...property,
      value: JSON.parse(data),
    })),
  })) || [];

export const stringifyEntriesForSdk = (entries: IEntry[]): ISdkEntry[] =>
  entries.map(({ properties, ...entry }) => ({
    ...entry,
    repeaterProperties: properties.map(({ value, ...property }) => ({
      ...property,
      data: JSON.stringify(value),
    })),
  }));

export const parsePropertyDefinitions = (
  input?: string
): IPropertyDefinition[] => {
  if (!input) throw new Error("Property definition input is undefined");

  return input.split(",").map((propertyDefString) => {
    const matches = propertyDefString.match(PROPERTY_DEF_REGEX);
    if (!matches?.groups) {
      throw new Error(`Invalid property definition: ${propertyDefString}`);
    }
    const { label, type, options, required } = matches.groups;
    const parsedType = PropertyTypeSchema.parse(type);
    const parsedOptions = options?.split("-");
    if (parsedType === "dropdown" && !parsedOptions?.length) {
      throw new Error(
        `Missing options for dropdown definition: ${propertyDefString}`
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
  property: IEntryProperty
): string | null => {
  if (
    property.isRequired &&
    (property.value === null ||
      property.value === undefined ||
      property.value === "")
  ) {
    return "Field is required";
  }

  return null;
};

export const getIsFormInvalid = (entries: IEntry[]) => {
  return entries.some(getIsEntryInvalid);
};

export const getIsEntryInvalid = (entry: IEntry) =>
  entry.properties.some((property) => getValidationMessage(property));

export const getEntryTitle = (entry: IEntry, index: number) =>
  entry.properties.find((p) => p.type === "text")?.value ||
  `Entry ${index + 1}`;

export const getEntryThumbnail = (entry: IEntry) =>
  entry.properties.find((p) => p.type === "media" && !!p.value)?.value.sys.id;

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
