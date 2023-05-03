import { useCallback } from "react";
import FieldEntryProperty from "./FieldEntryProperty";
import { Card, IconButton } from "@contentful/f36-components";
import { DeleteIcon } from "@contentful/f36-icons";
import { IEntry } from "../../lib/types";
import { getEntryTitle } from "../../lib/propertyUtils";

interface IProps {
  onDelete: (id: string) => void;
  onUpdate: (entryIndex: number, propertyIndex: number, value: string) => void;
  entry: IEntry;
  index: number;
}

const FieldEntryForm: React.FC<IProps> = ({
  index,
  entry,
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
    <Card
      title={getEntryTitle(entry, index)}
      icon={
        <IconButton
          variant="secondary"
          aria-label="Delete"
          onClick={handleDelete}
          icon={<DeleteIcon />}
          size="small"
        />
      }
    >
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
    </Card>
  );
};

export default FieldEntryForm;
