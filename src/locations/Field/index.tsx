import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import Block from "./Block";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Note, Stack } from "@contentful/f36-components";
import { v4 as uuid } from "uuid";
import { IBlock } from "../../lib/types";
import {
  getIsFormInvalid,
  parseBlockFieldDefinitions,
  parseSdkEntries,
  stringifyEntriesForSdk,
} from "../../lib/utils";
import BlockForm from "./BlockForm";
import { EntityProvider } from "@contentful/field-editor-reference";
import { PlusIcon } from "@contentful/f36-icons";
import {
  DndContext,
  DragEndEvent,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const initialEntries = parseSdkEntries(sdk.field.getValue());
  const [entries, setEntries] = useState<IBlock[]>(initialEntries);
  const [editingBlockId, setEditingBlockId] = useState<string>();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const blockFieldDefinitions = useMemo(
    () =>
      parseBlockFieldDefinitions(sdk.parameters.instance.blockFieldDefinitions),
    [sdk.parameters.instance.blockFieldDefinitions]
  );

  sdk.window.startAutoResizer();

  const handleUpdate = useCallback(
    (blockIndex: number, blockFieldIndex: number, value: string) => {
      const blockField = entries[blockIndex].properties[blockFieldIndex];
      if (blockField.value === value) return;

      setEntries((e) => {
        const newEntries = [...e];
        newEntries[blockIndex].properties[blockFieldIndex].value = value;
        return newEntries;
      });
    },
    [entries]
  );

  const handleDelete = useCallback((id: string) => {
    setEntries((e) => {
      const newEntries = e.filter((block) => block.id !== id);
      return newEntries;
    });
  }, []);

  const handleAddNew = useCallback(() => {
    const id = uuid();
    const newBlock = {
      id,
      properties: blockFieldDefinitions.map((definition) => ({
        ...definition,
        value: null,
      })),
    };
    setEntries((e) => [...e, newBlock]);
    setEditingBlockId(id);
  }, [blockFieldDefinitions]);

  useEffect(() => {
    const isInvalid = getIsFormInvalid(entries);
    if (!isInvalid) {
      sdk.field.setValue(stringifyEntriesForSdk(entries));
    }
    sdk.field.setInvalid(isInvalid);
  }, [sdk, entries]);

  const handleEdit = useCallback((id: string) => {
    setEditingBlockId(id);
  }, []);

  const handleBack = useCallback(() => {
    setEditingBlockId(undefined);
  }, []);

  const editingBlockIndex = entries.findIndex((e) => e.id === editingBlockId);
  const editingBlock = entries[editingBlockIndex];

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over?.id && active.id !== over.id) {
      setEntries((entries) => {
        const oldIndex = entries.findIndex((e) => e.id === active.id);
        const newIndex = entries.findIndex((e) => e.id === over.id);

        return arrayMove(entries, oldIndex, newIndex);
      });
    }
  }, []);

  return (
    <>
      {editingBlock && (
        <BlockForm
          onDelete={handleDelete}
          onBack={handleBack}
          onUpdate={handleUpdate}
          index={editingBlockIndex}
          block={editingBlock}
          key={editingBlockId}
        />
      )}
      <div hidden={!!editingBlock}>
        <Stack
          flexDirection="column"
          spacing="spacingS"
          alignItems="flex-start"
        >
          {getIsFormInvalid(entries) && (
            <Note variant="negative">
              One or more entries is currently invalid. Until all fields are
              valid, no changes will be saved.
            </Note>
          )}

          <EntityProvider sdk={sdk}>
            <DndContext
              onDragEnd={handleDragEnd}
              sensors={sensors}
              collisionDetection={closestCenter}
            >
              <SortableContext
                items={entries}
                strategy={verticalListSortingStrategy}
              >
                {entries.map((block, index) => (
                  <Block
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    index={index}
                    block={block}
                    key={block.id}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </EntityProvider>

          <Button startIcon={<PlusIcon />} onClick={handleAddNew} size="small">
            Add new block
          </Button>
        </Stack>
      </div>
    </>
  );
};

export default Field;
