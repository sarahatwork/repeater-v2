import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import FieldEntry from "./FieldEntry";
import { useCallback, useEffect, useState } from "react";
import { Button, Stack } from "@contentful/f36-components";
import { v4 as uuid } from "uuid";

const createNewItem = () => ({
  id: uuid(),
  fieldItems: {
    field1: "",
  },
});

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [data, setData] = useState<
    { id: string; fieldItems: Record<string, any> }[]
  >(sdk.field.getValue() || []);

  const handleUpdate = useCallback(
    (index: number, id: string, value: string) => {
      if (data[index].fieldItems[id] === value) return;

      setData((d) => {
        const newData = [...d];
        newData[index].fieldItems[id] = value;
        sdk.field.setValue(newData);
        return newData;
      });
    },
    [data, sdk.field]
  );

  const handleDelete = useCallback(
    (id: string) => {
      setData((d) => {
        const newData = d.filter((entry) => entry.id !== id);
        sdk.field.setValue(newData);
        return newData;
      });
    },
    [sdk.field]
  );

  const handleAddNew = useCallback(() => {
    setData((d) => [...d, createNewItem()]);
  }, []);

  useEffect(() => {
    sdk.window.updateHeight();
  }, [sdk, data]);

  console.log("====data", data);

  return (
    <div>
      <Stack flexDirection="column" spacing="spacingS" alignItems="stretch">
        {data.map((entry, i) => (
          <FieldEntry
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            initialValue={entry}
            index={i}
            key={entry.id}
            id={entry.id}
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
