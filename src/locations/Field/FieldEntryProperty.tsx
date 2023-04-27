import {
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from "@contentful/field-editor-test-utils";
import { SingleLineEditor } from "@contentful/field-editor-single-line";
import { useEffect, useMemo } from "react";
import { SingleMediaEditor } from "@contentful/field-editor-reference";
import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { IEntryProperty } from "../../lib/types";
import { FormControl } from "@contentful/f36-components";
import { getValidationMessage } from "../../lib/propertyUtils";

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
  const validationMessage = getValidationMessage(property);

  useEffect(() => {
    field.setValue(property.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  mitt.on("setValue", (value) => onUpdate(index, value));
  mitt.on("removeValue", () => onUpdate(index, ""));

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
            isInitiallyDisabled={false}
            sdk={{ ...sdk, field }}
            viewType="card"
            parameters={{ instance: {} }}
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
      {property.isRequired && (
        <FormControl.HelpText>Required</FormControl.HelpText>
      )}
      {validationMessage && (
        <FormControl.ValidationMessage>
          {validationMessage}
        </FormControl.ValidationMessage>
      )}
    </FormControl>
  );
};

export default FieldEntryProperty;
