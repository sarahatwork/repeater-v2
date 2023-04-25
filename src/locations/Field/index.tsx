import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import Item from "./Item";
import { useCallback, useState } from "react";
import { Button, Form, FormControl } from "@contentful/f36-components";

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const initialValue = sdk.field.getValue();
  const initialData = initialValue?.[0] || {};
  const [data, setData] = useState<{ field1: string }>({
    field1: "",
    ...initialData,
  });

  // Should this be done on autosave instead??
  const handleSubmit = useCallback(async () => {
    await sdk.field.setValue([data]);
  }, [sdk, data]);

  const handleUpdate = useCallback((id: string, value: string) => {
    setData((d) => ({ ...d, [id]: value }));
  }, []);

  return (
    <Form onSubmit={handleSubmit}>
      <FormControl>
        <Item
          type={sdk.parameters.instance.field1Type}
          id="field1"
          onUpdate={handleUpdate}
          initialValue={initialData.field1}
        />
      </FormControl>
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};

export default Field;
