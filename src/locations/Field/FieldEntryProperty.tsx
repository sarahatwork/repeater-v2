import {
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from "@contentful/field-editor-test-utils";
import { SingleLineEditor } from "@contentful/field-editor-single-line";
import { useCallback, useMemo } from "react";
import { SingleMediaEditor } from "@contentful/field-editor-reference";
import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { IEntryProperty, TRichTextNode } from "../../lib/types";
import { FormControl } from "@contentful/f36-components";
import {
  addReferencesNodeToRichTextValue,
  getValidationMessage,
} from "../../lib/propertyUtils";
import { RichTextEditor } from "@contentful/field-editor-rich-text";

interface IProps {
  property: IEntryProperty;
  index: number;
  onUpdate: (index: number, value: any) => void;
}

const FieldEntryProperty: React.FC<IProps> = ({
  index,
  property,
  onUpdate,
}) => {
  const [field, mitt] = createFakeFieldAPI((f) => ({
    ...f,
    getValue: () => property.value,
  }));
  const locales = createFakeLocalesAPI();
  const sdk = useSDK<FieldAppSDK>();
  const validationMessage = getValidationMessage(property);

  const handleUpdate = useCallback(
    (_value: any) => {
      if (property.type === "richText") {
        onUpdate(
          index,
          addReferencesNodeToRichTextValue(_value as TRichTextNode)
        );
        return;
      }

      onUpdate(index, _value);
    },
    [onUpdate, index, property.type]
  );

  mitt.on("setValue", (value) => handleUpdate(value));
  mitt.on("removeValue", () => handleUpdate(""));

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
      case "richText":
        return (
          <RichTextEditor sdk={{ ...sdk, field }} isInitiallyDisabled={false} />
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
