import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import FieldEntry from "./FieldEntry";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Note, Stack } from "@contentful/f36-components";
import { v4 as uuid } from "uuid";
import { IEntry } from "../../lib/types";
import {
  getIsFormInvalid,
  parsePropertyDefinitions,
  parseSdkEntries,
  stringifyEntriesForSdk,
} from "../../lib/propertyUtils";
import FieldEntryForm from "./FieldEntryForm";
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
  const [entries, setEntries] = useState<IEntry[]>(initialEntries);
  const [editingEntryId, setEditingEntryId] = useState<string>();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const propertyDefinitions = useMemo(
    () => parsePropertyDefinitions(sdk.parameters.instance.propertyDefinitions),
    [sdk.parameters.instance.propertyDefinitions]
  );

  sdk.window.startAutoResizer();

  const handleUpdate = useCallback(
    (entryIndex: number, propertyIndex: number, value: string) => {
      const property = entries[entryIndex].properties[propertyIndex];
      if (property.value === value) return;

      setEntries((e) => {
        const newEntries = [...e];
        newEntries[entryIndex].properties[propertyIndex].value = value;
        return newEntries;
      });
    },
    [entries]
  );

  const handleDelete = useCallback((id: string) => {
    setEntries((e) => {
      const newEntries = e.filter((entry) => entry.id !== id);
      return newEntries;
    });
  }, []);

  const handleAddNew = useCallback(() => {
    const id = uuid();
    const newEntry = {
      id,
      properties: propertyDefinitions.map((definition) => ({
        ...definition,
        value: "",
      })),
    };
    setEntries((e) => [...e, newEntry]);
    setEditingEntryId(id);
  }, [propertyDefinitions]);

  useEffect(() => {
    const isInvalid = getIsFormInvalid(entries);
    if (!isInvalid) {
      sdk.field.setValue(stringifyEntriesForSdk(entries));
    }
    sdk.field.setInvalid(isInvalid);
  }, [sdk, entries]);

  const handleEdit = useCallback((id: string) => {
    setEditingEntryId(id);
  }, []);

  const handleBack = useCallback(() => {
    setEditingEntryId(undefined);
  }, []);

  const editingEntryIndex = entries.findIndex((e) => e.id === editingEntryId);
  const editingEntry = entries[editingEntryIndex];

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
      {editingEntry && (
        <FieldEntryForm
          onDelete={handleDelete}
          onBack={handleBack}
          onUpdate={handleUpdate}
          index={editingEntryIndex}
          entry={editingEntry}
          key={editingEntryId}
        />
      )}
      <div hidden={!!editingEntry}>
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
                {entries.map((entry, index) => (
                  <FieldEntry
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    index={index}
                    entry={entry}
                    key={entry.id}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </EntityProvider>

          <Button startIcon={<PlusIcon />} onClick={handleAddNew} size="small">
            Add new entry
          </Button>
        </Stack>
      </div>
    </>
  );
};

export default Field;
