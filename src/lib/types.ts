import { z } from "zod";
import { BlockFieldTypes } from "./constants";

export const BlockFieldTypeSchema = z.nativeEnum(BlockFieldTypes);
export type TBlockFieldType = z.infer<typeof BlockFieldTypeSchema>;

export type TBlockFieldDefinition = {
  label: string;
  name: string;
  isRequired: boolean;
} & (
  | {
      type: Exclude<TBlockFieldType, "text">;
    }
  | { type: "text"; options?: string[] }
);

export type TGeneratorDefinition = TBlockFieldDefinition & { id: string };

export interface IBlock {
  id: string;
  fields: TBlockField[];
}

export type TBlockField = TBlockFieldDefinition & {
  value: any;
};

export interface ISdkBlock {
  id: string;
  data__REPEATER: Record<string, TSdkBlockField>;
}

export type TSdkBlockField = TBlockFieldDefinition & {
  data: any;
};

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
