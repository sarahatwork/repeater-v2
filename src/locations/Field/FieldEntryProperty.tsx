import {
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from "@contentful/field-editor-test-utils";
import { SingleLineEditor } from "@contentful/field-editor-single-line";
import { useEffect, useMemo } from "react";
import { SingleMediaEditor } from "@contentful/field-editor-reference";
import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { IEntryProperty } from "../../types";
import { FormControl } from "@contentful/f36-components";

interface IProps {
  property: IEntryProperty;
  index: number;
  onUpdate: (index: number, value: string) => void;
}

const FieldEntryProperty: React.FC<IProps> = ({
  index,
  property,
  onUpdate,
}) => {
  const [field, mitt] = createFakeFieldAPI();
  const locales = createFakeLocalesAPI();
  const sdk = useSDK<FieldAppSDK>();

  useEffect(() => {
    field.setValue(property.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  mitt.on("setValue", (value) => onUpdate(index, value));

  const body = useMemo(() => {
    switch (property.type) {
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
  }, [field, locales, sdk, property.type]);

  return (
    <FormControl>
      <FormControl.Label>{property.label}</FormControl.Label>
      {body}
    </FormControl>
  );
};

export default FieldEntryProperty;
