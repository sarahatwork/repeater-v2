import { FieldTypes } from "./constants";

export type TFieldTypeValue = (typeof FieldTypes)[keyof typeof FieldTypes];
