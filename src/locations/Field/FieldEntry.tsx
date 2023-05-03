import { useCallback } from "react";
import {
  Badge,
  DragHandle,
  EntryCard,
  MenuItem,
  MenuSectionTitle,
  Stack,
} from "@contentful/f36-components";
import { IEntry } from "../../lib/types";
import {
  getEntryThumbnail,
  getEntryTitle,
  getIsEntryInvalid,
} from "../../lib/propertyUtils";
import { useEntity } from "@contentful/field-editor-reference";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface IProps {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  entry: IEntry;
  index: number;
}

const FieldEntry: React.FC<IProps> = ({ index, entry, onDelete, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: entry.id });
  const style = transform
    ? {
        transform: CSS.Transform.toString({
          x: transform.x,
          y: transform.y,
          scaleX: 1,
          scaleY: 1,
        }),
        transition,
        zIndex: 100,
      }
    : undefined;
  const handleDelete = useCallback(() => {
    onDelete(entry.id);
  }, [onDelete, entry.id]);

  const handleEdit = useCallback(() => {
    onEdit(entry.id);
  }, [onEdit, entry.id]);

  const asset = useEntity("Asset", getEntryThumbnail(entry)).data?.fields
    ?.file?.["en-US"]?.url;

  return (
    <EntryCard
      ref={setNodeRef}
      contentType={"Entry"}
      dragHandleRender={() => <DragHandle label="Drag" {...listeners} />}
      {...attributes}
      style={style}
      withDragHandle
      onClick={handleEdit}
      actions={[
        <MenuSectionTitle key="title">Actions</MenuSectionTitle>,
        <MenuItem key="edit" onClick={handleEdit}>
          Edit
        </MenuItem>,
        <MenuItem key="delete" onClick={handleDelete}>
          Delete
        </MenuItem>,
      ]}
    >
      <Stack alignItems="flex-start">
        {asset && <img alt="" src={asset} width={80} />}
        <Stack flexDirection="column" alignItems="flex-start">
          <b>{getEntryTitle(entry, index)}</b>
          {getIsEntryInvalid(entry) && (
            <Badge variant="negative">Invalid</Badge>
          )}
        </Stack>
      </Stack>
    </EntryCard>
  );
};

export default FieldEntry;
