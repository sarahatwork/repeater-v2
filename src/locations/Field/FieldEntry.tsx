import { useCallback } from "react";
import FieldEntryField from "./FieldEntryField";
import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { TFieldTypeValue } from "../../constants";

interface IProps {
  onUpdate: (index: number, id: string, value: string) => void;
  initialValue: Record<string, any>;
  index: number;
}

const FieldEntry: React.FC<IProps> = ({ index, initialValue, onUpdate }) => {
  const sdk = useSDK<FieldAppSDK>();
  const handleUpdate = useCallback(
    (id: string, value: string) => {
      onUpdate(index, id, value);
    },
    [onUpdate, index]
  );
  return (
    <>
      {Object.entries(initialValue).map(([fieldId, value], i) => {
        const id = `field${i + 1}`;
        return (
          <FieldEntryField
            id={id}
            onUpdate={handleUpdate}
            type={sdk.parameters.instance[`${id}Type`] as TFieldTypeValue}
            initialValue={initialValue[id]}
          />
        );
      })}
    </>
  );
};

export default FieldEntry;
