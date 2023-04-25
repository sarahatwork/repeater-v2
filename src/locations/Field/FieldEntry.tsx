import { useCallback } from "react";
import FieldEntryField from "./FieldEntryField";
import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { TFieldTypeValue } from "../../constants";
import {
  FormControl,
  Heading,
  IconButton,
  Stack,
} from "@contentful/f36-components";
import { DeleteIcon } from "@contentful/f36-icons";

interface IProps {
  onDelete: (id: string) => void;
  onUpdate: (index: number, id: string, value: string) => void;
  initialValue: { id: string; fields: Record<string, any> };
  index: number;
  id: string;
}

const FieldEntry: React.FC<IProps> = ({
  index,
  id,
  initialValue,
  onUpdate,
  onDelete,
}) => {
  const sdk = useSDK<FieldAppSDK>();
  const handleUpdate = useCallback(
    (id: string, value: string) => {
      onUpdate(index, id, value);
    },
    [onUpdate, index]
  );

  const handleDelete = useCallback(() => {
    onDelete(id);
  }, [id]);

  return (
    <>
      <Stack justifyContent="space-between">
        <Heading>Entry {index + 1}</Heading>
        <IconButton
          aria-label="Delete"
          onClick={handleDelete}
          icon={<DeleteIcon />}
        />
      </Stack>
      {Object.entries(initialValue.fields).map(([fieldId, value], i) => {
        return (
          <FormControl key={fieldId}>
            <FormControl.Label>Field {i + 1}</FormControl.Label>
            <FieldEntryField
              id={fieldId}
              onUpdate={handleUpdate}
              type={
                sdk.parameters.instance[`${fieldId}Type`] as TFieldTypeValue
              }
              initialValue={value}
            />
          </FormControl>
        );
      })}
    </>
  );
};

export default FieldEntry;
