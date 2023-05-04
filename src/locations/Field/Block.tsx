import { useCallback } from "react";
import {
  Badge,
  DragHandle,
  EntryCard,
  MenuItem,
  MenuSectionTitle,
  Stack,
} from "@contentful/f36-components";
import { IBlock } from "../../lib/types";
import {
  getBlockThumbnail,
  getBlockTitle,
  getIsBlockInvalid,
} from "../../lib/utils";
import { useEntity } from "@contentful/field-editor-reference";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface IProps {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  block: IBlock;
  index: number;
}

const Block: React.FC<IProps> = ({ index, block, onDelete, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id });
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
    onDelete(block.id);
  }, [onDelete, block.id]);

  const handleEdit = useCallback(() => {
    onEdit(block.id);
  }, [onEdit, block.id]);

  const asset = useEntity("Asset", getBlockThumbnail(block)).data?.fields
    ?.file?.["en-US"]?.url;

  return (
    <EntryCard
      ref={setNodeRef}
      contentType={"Block"}
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
          <b>{getBlockTitle(block, index)}</b>
          {getIsBlockInvalid(block) && (
            <Badge variant="negative">Invalid</Badge>
          )}
        </Stack>
      </Stack>
    </EntryCard>
  );
};

export default Block;
