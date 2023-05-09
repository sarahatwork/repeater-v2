import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import Block from "./Block";
import { useCallback, useState } from "react";
import { Button, Card, Heading, Note, Stack } from "@contentful/f36-components";
import { getIsFormInvalid } from "../../lib/utils";
import BlockForm from "./BlockForm";
import { EntityProvider } from "@contentful/field-editor-reference";

import { ErrorBoundary } from "react-error-boundary";
import useBlocks from "./useBlocks";
import MenuBar from "./MenuBar";
import DragAndDrop from "../../components/DragAndDrop";

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const { blocks, handleUpdate, handleDelete, setBlocks } = useBlocks();
  const [editingBlockId, setEditingBlockId] = useState<string>();

  sdk.window.startAutoResizer();

  const handleEdit = useCallback((id: string) => {
    setEditingBlockId(id);
  }, []);

  const handleBack = useCallback(() => {
    setEditingBlockId(undefined);
  }, []);

  const editingBlockIndex = blocks.findIndex((e) => e.id === editingBlockId);
  const editingBlock = blocks[editingBlockIndex];

  return (
    <>
      {editingBlock && (
        <BlockForm
          onDelete={handleDelete}
          onBack={handleBack}
          onUpdate={handleUpdate}
          index={editingBlockIndex}
          block={editingBlock}
          key={editingBlockId}
        />
      )}
      <div hidden={!!editingBlock} style={{ minHeight: 200 }}>
        <Stack
          flexDirection="column"
          spacing="spacingS"
          alignItems="flex-start"
        >
          {getIsFormInvalid(blocks) && (
            <Note variant="negative">
              One or more blocks is currently invalid. Until all fields are
              valid, no changes will be saved.
            </Note>
          )}

          {blocks.length > 3 && (
            <MenuBar setBlocks={setBlocks} onAddNew={handleEdit} />
          )}

          <EntityProvider sdk={sdk}>
            <DragAndDrop items={blocks} setItems={setBlocks}>
              {blocks.map((block, index) => (
                <Block
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  index={index}
                  block={block}
                  key={block.id}
                />
              ))}
            </DragAndDrop>
          </EntityProvider>

          <MenuBar setBlocks={setBlocks} onAddNew={handleEdit} />
        </Stack>
      </div>
    </>
  );
};

const FieldWrapper: React.FC = () => {
  const sdk = useSDK<FieldAppSDK>();

  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <Card>
          <Stack flexDirection="column">
            <Heading>Something went wrong.</Heading>
            <Button onClick={resetErrorBoundary} size="small">
              Clear data
            </Button>
          </Stack>
        </Card>
      )}
      onReset={() => sdk.field.setValue(undefined)}
    >
      <Field />
    </ErrorBoundary>
  );
};

export default FieldWrapper;
