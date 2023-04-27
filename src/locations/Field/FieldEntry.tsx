import { useCallback } from "react";
import FieldEntryProperty from "./FieldEntryProperty";
import { Heading, IconButton, Stack } from "@contentful/f36-components";
import { DeleteIcon } from "@contentful/f36-icons";
import { IEntry } from "../../lib/types";

interface IProps {
  onDelete: (id: string) => void;
  onUpdate: (entryIndex: number, propertyIndex: number, value: string) => void;
  entry: IEntry;
  index: number;
}

const FieldEntry: React.FC<IProps> = ({ index, entry, onUpdate, onDelete }) => {
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
      <Stack justifyContent="space-between">
        <Heading>Entry {index + 1}</Heading>
        <IconButton
          aria-label="Delete"
          onClick={handleDelete}
          icon={<DeleteIcon />}
        />
      </Stack>
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

export default FieldEntry;
