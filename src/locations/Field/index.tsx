import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import FieldEntry from "./FieldEntry";
import { useCallback, useState } from "react";
import { Button, Form, FormControl } from "@contentful/f36-components";

const createNewItem = () => ({
  field1: "",
});

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const initialValue = sdk.field.getValue();
  const [data, setData] = useState<any[]>(initialValue);

  // Should this be done on autosave instead??
  const handleSubmit = useCallback(async () => {
    await sdk.field.setValue(data);
  }, [sdk, data]);

  const handleUpdate = useCallback(
    (index: number, id: string, value: string) => {
      setData((d) => {
        const newData = [...d];
        newData[index][id] = value;
        return newData;
      });
    },
    []
  );

  const handleAddNew = useCallback(() => {
    setData((d) => [...d, createNewItem()]);
  }, []);

  return (
    <Form onSubmit={handleSubmit}>
      {data.map((entry, i) => (
        <FormControl key={i}>
          <FieldEntry onUpdate={handleUpdate} initialValue={entry} index={i} />
        </FormControl>
      ))}

      <Button onClick={handleAddNew}>Add New</Button>
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};

export default Field;
