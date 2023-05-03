import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import FieldEntry from "./FieldEntry";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Stack } from "@contentful/f36-components";
import { v4 as uuid } from "uuid";
import { IEntry } from "../../lib/types";
import {
  getIsFormInvalid,
  parsePropertyDefinitions,
  parseSdkEntries,
  stringifyEntriesForSdk,
} from "../../lib/propertyUtils";

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [entries, setEntries] = useState<IEntry[]>(
    parseSdkEntries(sdk.field.getValue())
  );

  const propertyDefinitions = useMemo(
    () => parsePropertyDefinitions(sdk.parameters.instance.propertyDefinitions),
    [sdk.parameters.instance.propertyDefinitions]
  );

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
    const newEntry = {
      id: uuid(),
      properties: propertyDefinitions.map((definition) => ({
        ...definition,
        value: "",
      })),
    };
    setEntries((e) => [...e, newEntry]);
  }, [propertyDefinitions]);

  useEffect(() => {
    setTimeout(() => sdk.window.updateHeight(), 0);
    const isInvalid = getIsFormInvalid(entries);
    if (!isInvalid) {
      sdk.field.setValue(stringifyEntriesForSdk(entries));
    }
    sdk.field.setInvalid(isInvalid);
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
