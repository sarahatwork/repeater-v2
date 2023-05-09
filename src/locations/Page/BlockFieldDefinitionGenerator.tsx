import {
  Button,
  CopyButton,
  SectionHeading,
  Stack,
  Subheading,
  TextInput,
} from "@contentful/f36-components";
import { useCallback, useState } from "react";
import { TBlockFieldDefinition } from "../../lib/types";
import { PlusIcon } from "@contentful/f36-icons";
import BlockFieldDefinitionGeneratorItem from "./BlockFieldDefinitionGeneratorItem";
import { encodeBlockFieldDefinitions } from "../../lib/utils";

const DEFAULT_NEW_FIELD = {
  label: "",
  name: "",
  type: "text",
  isRequired: false,
} as const;

const BlockFieldDefinitionGenerator = () => {
  const [items, setItems] = useState<TBlockFieldDefinition[]>([
    DEFAULT_NEW_FIELD,
  ]);

  const handleAddNew = useCallback(() => {
    setItems((items) => [...items, DEFAULT_NEW_FIELD]);
  }, []);

  const createUpdateHandler = useCallback(
    (index: number) =>
      (func: (item: TBlockFieldDefinition) => TBlockFieldDefinition) => {
        setItems((items) => {
          const newItems = [...items];
          newItems[index] = func(items[index]);
          return newItems;
        });
      },
    []
  );

  return (
    <>
      <Subheading>Block Field Definition Generator</Subheading>

      <Stack flexDirection="column" alignItems="flex-start">
        {items.map((item, index) => (
          <BlockFieldDefinitionGeneratorItem
            key={index}
            item={item}
            onUpdate={createUpdateHandler(index)}
          />
        ))}

        <Button startIcon={<PlusIcon />} onClick={handleAddNew} size="small">
          Add new field
        </Button>
      </Stack>

      <SectionHeading marginTop="spacingXl">
        Generated Definition
      </SectionHeading>

      <TextInput.Group>
        <TextInput
          isDisabled
          isReadOnly
          value={encodeBlockFieldDefinitions(items)}
        />
        <CopyButton
          value={encodeBlockFieldDefinitions(items)}
          tooltipProps={{ placement: "right", usePortal: true }}
        />
      </TextInput.Group>
    </>
  );
};

export default BlockFieldDefinitionGenerator;
