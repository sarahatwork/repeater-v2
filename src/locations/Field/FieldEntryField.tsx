import {
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from "@contentful/field-editor-test-utils";
import { SingleLineEditor } from "@contentful/field-editor-single-line";
import { useEffect } from "react";
import { SingleMediaEditor } from "@contentful/field-editor-reference";
import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { TFieldTypeValue } from "../../types";

interface IProps {
  type: TFieldTypeValue;
  id: string;
  onUpdate: (id: string, value: string) => void;
  initialValue?: string;
}

const FieldEntryField: React.FC<IProps> = ({
  type,
  id,
  onUpdate,
  initialValue = "",
}) => {
  const [field, mitt] = createFakeFieldAPI((f) => ({
    ...f,
    id,
  }));
  const locales = createFakeLocalesAPI();
  const sdk = useSDK<FieldAppSDK>();

  useEffect(() => {
    field.setValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  mitt.on("setValue", (value) => onUpdate(id, value));

  switch (type) {
    case "text":
      return (
        <SingleLineEditor
          field={field}
          locales={locales}
          isInitiallyDisabled={false}
          withCharValidation={false}
        />
      );
    case "media":
      return (
        <SingleMediaEditor
          // field={field}
          // locales={locales}
          isInitiallyDisabled={false}
          sdk={{ ...sdk, field }}
          viewType="card"
          parameters={{ instance: {} }}
          // withCharValidation={false}
        />
      );
    default:
      return null;
  }
};

export default FieldEntryField;
