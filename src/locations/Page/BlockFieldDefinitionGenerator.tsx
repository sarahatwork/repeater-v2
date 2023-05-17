import {
  Button,
  CopyButton,
  FormControl,
  SectionHeading,
  Stack,
  Subheading,
  TextInput,
} from "@contentful/f36-components";
import { useCallback, useState } from "react";
import { TGeneratorDefinition } from "../../lib/types";
import { PlusIcon } from "@contentful/f36-icons";
import BlockFieldDefinitionGeneratorItem from "./BlockFieldDefinitionGeneratorItem";
import { encodeBlockFieldDefinitions } from "../../lib/utils";
import DragAndDrop from "../../components/DragAndDrop";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { v4 as uuid } from "uuid";

const createNewField = () =>
  ({
    id: uuid(),
    label: "Field Label",
    name: "fieldLabel",
    type: "text",
    isRequired: false,
  } as const);

const BlockFieldDefinitionGenerator = () => {
  const [items, setItems] = useState<TGeneratorDefinition[]>([
    createNewField(),
  ]);

  const handleAddNew = useCallback(() => {
    setItems((items) => [...items, createNewField()]);
  }, []);

  const createUpdateHandler = useCallback(
    (index: number) =>
      (func: (item: TGeneratorDefinition) => TGeneratorDefinition) => {
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
        <DragAndDrop
          items={items}
          setItems={setItems}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, index) => (
            <BlockFieldDefinitionGeneratorItem
              key={index}
              item={item}
              onUpdate={createUpdateHandler(index)}
            />
          ))}
        </DragAndDrop>

        <Button startIcon={<PlusIcon />} onClick={handleAddNew} size="small">
          Add new field
        </Button>
      </Stack>

      <SectionHeading marginTop="spacingXl">
        Generated Definition
      </SectionHeading>

      <FormControl>
        <TextInput.Group>
          <TextInput
            // isDisabled
            isReadOnly
            value={encodeBlockFieldDefinitions(items)}
            maxLength={255}
          />
          <CopyButton
            value={encodeBlockFieldDefinitions(items)}
            tooltipProps={{ placement: "right", usePortal: true }}
          />
        </TextInput.Group>
        <FormControl.Counter />
      </FormControl>
    </>
  );
};

export default BlockFieldDefinitionGenerator;
