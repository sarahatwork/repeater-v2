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
