import { useCallback } from "react";
import BlockFormField from "./BlockFormField";
import { Box, Button } from "@contentful/f36-components";
import { IBlock } from "../../lib/types";
import { getBlockTitle } from "../../lib/utils";
import { WorkbenchHeader } from "@contentful/f36-workbench";

interface IProps {
  onDelete: (id: string) => void;
  onBack: () => void;
  onUpdate: (
    blockIndex: number,
    blockFieldIndex: number,
    value: string
  ) => void;
  block: IBlock;
  index: number;
}

const BlockForm: React.FC<IProps> = ({
  index,
  block,
  onBack,
  onUpdate,
  onDelete,
}) => {
  const handleUpdate = useCallback(
    (blockFieldIndex: number, value: string) => {
      onUpdate(index, blockFieldIndex, value);
    },
    [onUpdate, index]
  );

  const handleDelete = useCallback(() => {
    onDelete(block.id);
  }, [onDelete, block.id]);

  return (
    <>
      <Box marginTop="spacingM" marginBottom="spacingL">
        <WorkbenchHeader
          onBack={onBack}
          title={getBlockTitle(block, index)}
          actions={
            <Button size="small" onClick={handleDelete}>
              Delete
            </Button>
          }
        />
      </Box>

      {block.fields.map((blockField, i) => {
        return (
          <BlockFormField
            blockField={blockField}
            onUpdate={handleUpdate}
            key={blockField.name}
            index={i}
          />
        );
      })}
    </>
  );
};

export default BlockForm;
