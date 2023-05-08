import { useCallback, useState } from "react";
import {
  Badge,
  Box,
  DragHandle,
  EntryCard,
  MenuItem,
  MenuSectionTitle,
  Stack,
  Text,
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

  const [maxWidth, setMaxWidth] = useState(0);

  const handleDelete = useCallback(() => {
    onDelete(block.id);
  }, [onDelete, block.id]);

  const handleEdit = useCallback(() => {
    onEdit(block.id);
  }, [onEdit, block.id]);

  const asset = useEntity("Asset", getBlockThumbnail(block))?.data?.fields
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
      <Stack
        ref={(el: HTMLDivElement) => {
          const newWidth = el?.parentElement?.parentElement?.clientWidth;
          if (newWidth) setMaxWidth(newWidth);
        }}
        alignItems="flex-start"
        style={{
          maxWidth,
        }}
      >
        {asset && (
          <Box style={{ width: 60, flexShrink: 0 }}>
            <img alt="" src={asset} />
          </Box>
        )}
        <Stack
          flexDirection="column"
          alignItems="flex-start"
          style={{ overflow: "hidden" }}
        >
          <Text isTruncated>{getBlockTitle(block, index)}</Text>
          {getIsBlockInvalid(block) && (
            <Badge variant="negative">Invalid</Badge>
          )}
        </Stack>
      </Stack>
    </EntryCard>
  );
};

export default Block;
