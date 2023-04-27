import { PropertyTypes } from "./constants";

type TPropertyType = (typeof PropertyTypes)[keyof typeof PropertyTypes];

export interface IPropertyDefinition {
  label: string;
  name: string;
  type: TPropertyType;
}

export interface IEntry {
  id: string;
  properties: IEntryProperty[];
}

export interface IEntryProperty extends IPropertyDefinition {
  value: any;
}
