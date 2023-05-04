import { useCallback } from "react";
import FieldEntryProperty from "./FieldEntryProperty";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  MenuSectionTitle,
} from "@contentful/f36-components";
import { IEntry } from "../../lib/types";
import { getEntryTitle } from "../../lib/propertyUtils";
import { WorkbenchHeader } from "@contentful/f36-workbench";

interface IProps {
  onDelete: (id: string) => void;
  onBack: () => void;
  onUpdate: (entryIndex: number, propertyIndex: number, value: string) => void;
  entry: IEntry;
  index: number;
}

const FieldEntryForm: React.FC<IProps> = ({
  index,
  entry,
  onBack,
  onUpdate,
  onDelete,
}) => {
  const handleUpdate = useCallback(
    (propertyIndex: number, value: string) => {
      onUpdate(index, propertyIndex, value);
    },
    [onUpdate, index]
  );

  const handleDelete = useCallback(() => {
    onDelete(entry.id);
  }, [onDelete, entry.id]);

  return (
    <>
      <Box marginTop="spacingM" marginBottom="spacingL">
        <WorkbenchHeader
          onBack={onBack}
          title={getEntryTitle(entry, index)}
          actions={
            <Button size="small" onClick={handleDelete}>
              Delete
            </Button>
          }
        />
      </Box>

      {entry.properties.map((property, i) => {
        return (
          <FieldEntryProperty
            property={property}
            onUpdate={handleUpdate}
            key={property.name}
            index={i}
          />
        );
      })}
    </>
  );
};

export default FieldEntryForm;
