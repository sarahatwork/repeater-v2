import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import Block from "./Block";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Heading,
  Menu,
  Note,
  Stack,
} from "@contentful/f36-components";
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
import { PlusIcon, ArrowDownIcon } from "@contentful/f36-icons";
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
import { ErrorBoundary } from "react-error-boundary";

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

  const handleDelete = useCallback(
    (id: string) => {
      sdk.dialogs
        .openConfirm({
          title: "Are you sure?",
          message: "Are you sure you want to delete this block?",
          intent: "negative",
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
        })
        .then((result) => {
          if (result) {
            setBlocks((e) => {
              const newBlocks = e.filter((block) => block.id !== id);
              return newBlocks;
            });
          }
        });
    },
    [sdk.dialogs]
  );

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

  const handleClear = useCallback(() => {
    sdk.dialogs
      .openConfirm({
        title: "Are you sure?",
        message: "Are you sure you want to clear all blocks?",
        intent: "negative",
        confirmLabel: "Clear all",
        cancelLabel: "Cancel",
      })
      .then((result) => {
        if (result) {
          setBlocks([]);
        }
      });
  }, [sdk.dialogs]);

  const handleCopyFromLocale = useCallback(
    (locale: string) => {
      sdk.dialogs
        .openConfirm({
          title: "Are you sure?",
          message: `Are you sure you want to copy content from ${locale} to this locale?`,
          intent: "primary",
          confirmLabel: `Copy from ${locale}`,
          cancelLabel: "Cancel",
        })
        .then((result) => {
          if (result) {
            const valueForOtherLocale =
              sdk.entry.fields[sdk.field.id].getValue(locale);
            setBlocks(parseSdkBlocks(valueForOtherLocale));
          }
        });
    },
    [sdk]
  );

  const availableLocalesForField = sdk.entry.fields[sdk.field.id].locales;

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
      <div hidden={!!editingBlock} style={{ minHeight: 200 }}>
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

          <Stack>
            <Button
              startIcon={<PlusIcon />}
              onClick={handleAddNew}
              size="small"
            >
              Add new block
            </Button>

            <Menu>
              <Menu.Trigger>
                <Button size="small" endIcon={<ArrowDownIcon />}>
                  More Actions
                </Button>
              </Menu.Trigger>
              <Menu.List>
                {/* TODO Add confirm modal */}
                <Menu.Item onClick={handleClear}>Clear all blocks</Menu.Item>
                {availableLocalesForField.length > 1 && (
                  <Menu.Submenu>
                    <Menu.SubmenuTrigger>
                      Copy from locale...
                    </Menu.SubmenuTrigger>
                    <Menu.List>
                      {/* TODO Add confirm modal */}
                      {availableLocalesForField.map((locale) => {
                        if (locale === sdk.field.locale) return null;
                        return (
                          <Menu.Item
                            key={locale}
                            onClick={() => handleCopyFromLocale(locale)}
                          >
                            {sdk.locales.names[locale]} ({locale})
                          </Menu.Item>
                        );
                      })}
                    </Menu.List>
                  </Menu.Submenu>
                )}
              </Menu.List>
            </Menu>
          </Stack>

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
        </Stack>
      </div>
    </>
  );
};

const FieldWrapper: React.FC = () => {
  const sdk = useSDK<FieldAppSDK>();

  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <Card>
          <Stack flexDirection="column">
            <Heading>Something went wrong.</Heading>
            <Button onClick={resetErrorBoundary} size="small">
              Clear data
            </Button>
          </Stack>
        </Card>
      )}
      onReset={() => sdk.field.setValue(undefined)}
    >
      <Field />
    </ErrorBoundary>
  );
};

export default FieldWrapper;
