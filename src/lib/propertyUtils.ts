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

const PROPERTY_DEF_REGEX = /([\w\s]+):(\w+)(!?)/;

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
    if (!matches) {
      throw new Error(`Invalid property definition: ${propertyDefString}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, label, type, requiredSymbol] = matches;
    const parsedType = PropertyTypeSchema.parse(type);

    return {
      label,
      type: parsedType,
      isRequired: !!requiredSymbol,
      name: camelCase(label),
    };
  });
};

export const getValidationMessage = (
  property: IEntryProperty
): string | null => {
  if (property.isRequired && !property.value) {
    return "Field is required";
  }

  return null;
};

export const getIsFormInvalid = (entries: IEntry[]) => {
  return entries.some((entry) =>
    entry.properties.some((property) => getValidationMessage(property))
  );
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
