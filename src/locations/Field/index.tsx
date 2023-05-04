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
  parseSdkBlocks,
  stringifyBlocksForSdk,
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
  const initialBlocks = parseSdkBlocks(sdk.field.getValue());
  const [blocks, setBlocks] = useState<IBlock[]>(initialBlocks);
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
      const blockField = blocks[blockIndex].fields[blockFieldIndex];
      if (blockField.value === value) return;

      setBlocks((e) => {
        const newBlocks = [...e];
        newBlocks[blockIndex].fields[blockFieldIndex].value = value;
        return newBlocks;
      });
    },
    [blocks]
  );

  const handleDelete = useCallback((id: string) => {
    setBlocks((e) => {
      const newBlocks = e.filter((block) => block.id !== id);
      return newBlocks;
    });
  }, []);

  const handleAddNew = useCallback(() => {
    const id = uuid();
    const newBlock = {
      id,
      fields: blockFieldDefinitions.map((definition) => ({
        ...definition,
        value: null,
      })),
    };
    setBlocks((e) => [...e, newBlock]);
    setEditingBlockId(id);
  }, [blockFieldDefinitions]);

  useEffect(() => {
    const isInvalid = getIsFormInvalid(blocks);
    if (!isInvalid) {
      sdk.field.setValue(stringifyBlocksForSdk(blocks));
    }
    sdk.field.setInvalid(isInvalid);
  }, [sdk, blocks]);

  const handleEdit = useCallback((id: string) => {
    setEditingBlockId(id);
  }, []);

  const handleBack = useCallback(() => {
    setEditingBlockId(undefined);
  }, []);

  const editingBlockIndex = blocks.findIndex((e) => e.id === editingBlockId);
  const editingBlock = blocks[editingBlockIndex];

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over?.id && active.id !== over.id) {
      setBlocks((blocks) => {
        const oldIndex = blocks.findIndex((e) => e.id === active.id);
        const newIndex = blocks.findIndex((e) => e.id === over.id);

        return arrayMove(blocks, oldIndex, newIndex);
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
          {getIsFormInvalid(blocks) && (
            <Note variant="negative">
              One or more blocks is currently invalid. Until all fields are
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
                items={blocks}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block, index) => (
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
