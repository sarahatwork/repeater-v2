import {
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from "@contentful/field-editor-test-utils";
import { SingleLineEditor } from "@contentful/field-editor-single-line";
import { useCallback, useMemo, useState } from "react";
import {
  MultipleEntryReferenceEditor,
  MultipleMediaEditor,
  SingleEntryReferenceEditor,
  SingleMediaEditor,
} from "@contentful/field-editor-reference";
import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { IBlockField, TRichTextNode } from "../../lib/types";
import { FormControl } from "@contentful/f36-components";
import {
  addReferencesNodeToRichTextValue,
  getValidationMessage,
} from "../../lib/utils";
import { RichTextEditor } from "@contentful/field-editor-rich-text";
import { BooleanEditor } from "@contentful/field-editor-boolean";
import { DropdownEditor } from "@contentful/field-editor-dropdown";

interface IProps {
  blockField: IBlockField;
  index: number;
  onUpdate: (index: number, value: any) => void;
}

const BlockFormField: React.FC<IProps> = ({ index, blockField, onUpdate }) => {
  const [field, mitt] = createFakeFieldAPI((f) => ({
    ...f,
    getValue: () => blockField.value,
    validations: blockField.options
      ? [{ in: blockField.options }]
      : f.validations,
  }));
  const locales = createFakeLocalesAPI();
  const sdk = useSDK<FieldAppSDK>();
  const validationMessage = getValidationMessage(blockField);
  const [isDirty, setIsDirty] = useState(false);

  const handleUpdate = useCallback(
    (_value: any) => {
      setIsDirty(true);

      if (blockField.type === "richText") {
        onUpdate(
          index,
          addReferencesNodeToRichTextValue(_value as TRichTextNode)
        );
        return;
      }

      onUpdate(index, _value);
    },
    [onUpdate, index, blockField.type]
  );

  mitt.on("setValue", (value) => handleUpdate(value));
  mitt.on("removeValue", () => handleUpdate(null));

  const body = useMemo(() => {
    switch (blockField.type) {
      case "boolean":
        return <BooleanEditor field={field} isInitiallyDisabled={false} />;
      case "text":
        if (blockField.options) {
          return (
            <DropdownEditor
              field={field}
              locales={locales}
              isInitiallyDisabled={false}
            />
          );
        }

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
      case "mediaSingle":
        return (
          // Extra div for full-width style
          <div>
            <SingleMediaEditor
              isInitiallyDisabled={false}
              sdk={{ ...sdk, field }}
              viewType="card"
              parameters={{ instance: {} }}
            />
          </div>
        );
      case "mediaMultiple":
        return (
          <MultipleMediaEditor
            isInitiallyDisabled={false}
            sdk={{ ...sdk, field }}
            viewType="card"
            parameters={{ instance: {} }}
          />
        );
      case "referenceSingle":
        return (
          <SingleEntryReferenceEditor
            isInitiallyDisabled={false}
            sdk={{ ...sdk, field }}
            viewType="card"
            parameters={{ instance: {} }}
            hasCardEditActions={true}
          />
        );
      case "referenceMultiple":
        return (
          <MultipleEntryReferenceEditor
            isInitiallyDisabled={false}
            sdk={{ ...sdk, field }}
            viewType="card"
            parameters={{ instance: {} }}
            hasCardEditActions={true}
          />
        );
      default:
        return null;
    }
  }, [field, locales, sdk, blockField.type, blockField.options]);

  return (
    <FormControl>
      <FormControl.Label>{blockField.label}</FormControl.Label>
      {body}
      {blockField.isRequired && (
        <FormControl.HelpText>Required</FormControl.HelpText>
      )}
      {isDirty && validationMessage && (
        <FormControl.ValidationMessage>
          {validationMessage}
        </FormControl.ValidationMessage>
      )}
    </FormControl>
  );
};

export default BlockFormField;
