import { TFieldTypeValue } from "../../constants";
import {
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from "@contentful/field-editor-test-utils";
import { SingleLineEditor } from "@contentful/field-editor-single-line";
import { useEffect } from "react";

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
    default:
      return null;
  }
};

export default FieldEntryField;
