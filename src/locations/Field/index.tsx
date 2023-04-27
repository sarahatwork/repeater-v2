import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import FieldEntry from "./FieldEntry";
import { useCallback, useEffect, useState } from "react";
import { Button, Stack } from "@contentful/f36-components";
import { v4 as uuid } from "uuid";
import { IEntry, IPropertyDefinition } from "../../types";

const propertyDefinitions: IPropertyDefinition[] = [
  {
    label: "Title",
    name: "title",
    type: "text",
  },
  {
    label: "Photo",
    name: "photo",
    type: "media",
  },
];

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [entries, setEntries] = useState<IEntry[]>(sdk.field.getValue() || []);
  // const PropertyTypes = sdk.parameters.instance.PropertyTypes.split(
  //   ","
  // ) as TPropertyTypeValue[];

  const handleUpdate = useCallback(
    (entryIndex: number, propertyIndex: number, value: string) => {
      const property = entries[entryIndex].properties[propertyIndex];
      if (property.value === value) return;

      setEntries((e) => {
        const newEntries = [...e];
        newEntries[entryIndex].properties[propertyIndex].value = value;
        sdk.field.setValue(newEntries);
        return newEntries;
      });
    },
    [entries, sdk.field]
  );

  const handleDelete = useCallback(
    (id: string) => {
      setEntries((e) => {
        const newEntries = e.filter((entry) => entry.id !== id);
        sdk.field.setValue(newEntries);
        return newEntries;
      });
    },
    [sdk.field]
  );

  const handleAddNew = useCallback(() => {
    const newEntry = {
      id: uuid(),
      properties: propertyDefinitions.map((definition) => ({
        ...definition,
        value: "",
      })),
    };
    setEntries((e) => [...e, newEntry]);
  }, []);

  useEffect(() => {
    setTimeout(() => sdk.window.updateHeight(), 0);
  }, [sdk, entries]);

  return (
    <div>
      <Stack flexDirection="column" spacing="spacingS" alignItems="stretch">
        {entries.map((entry, index) => (
          <FieldEntry
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            index={index}
            entry={entry}
            key={entry.id}
          />
        ))}

        <Button variant="primary" onClick={handleAddNew}>
          Add New
        </Button>
      </Stack>
    </div>
  );
};

export default Field;
