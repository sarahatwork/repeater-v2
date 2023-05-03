import { z } from "zod";
import { PropertyTypes } from "./constants";

export const PropertyTypeSchema = z.nativeEnum(PropertyTypes);
export type TPropertyType = z.infer<typeof PropertyTypeSchema>;

export interface IPropertyDefinition {
  label: string;
  name: string;
  type: TPropertyType;
  isRequired: boolean;
}

export interface IEntry {
  id: string;
  properties: IEntryProperty[];
}

export interface IEntryProperty extends IPropertyDefinition {
  value: any;
}

export interface ISdkEntry {
  id: string;
  repeaterProperties: ISdkEntryProperty[];
}

export interface ISdkEntryProperty extends IPropertyDefinition {
  data: string;
}

export type TReference = { contentful_id: string; type: string };

export type TRichTextNode = {
  nodeType: string;
  data:
    | {}
    | { target: { sys: { id: string; type: "Link"; linkType: string } } };
} & ({ content: TRichTextNode[] } | { value: string });

export type TRichTextNodeWithReferences = TRichTextNode & {
  references: TReference[];
};
