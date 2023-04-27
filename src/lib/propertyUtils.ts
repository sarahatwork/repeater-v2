import { IPropertyDefinition, PropertyTypeSchema } from "./types";
import camelCase from "lodash/camelCase";

const PROPERTY_DEF_REGEX = /([\w\s]+):(\w+)(!?)/;

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
