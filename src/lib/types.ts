import { z } from "zod";
import { BlockFieldTypes } from "./constants";

export const BlockFieldTypeSchema = z.nativeEnum(BlockFieldTypes);
export type TBlockFieldType = z.infer<typeof BlockFieldTypeSchema>;

export interface IBlockFieldDefinition {
  label: string;
  name: string;
  type: TBlockFieldType;
  isRequired: boolean;
  options?: string[];
}

export interface IBlock {
  id: string;
  fields: IBlockField[];
}

export interface IBlockField extends IBlockFieldDefinition {
  value: any;
}

export interface ISdkBlock {
  id: string;
  blockFields: Record<string, ISdkBlockField>;
}

export interface ISdkBlockField extends IBlockFieldDefinition {
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
