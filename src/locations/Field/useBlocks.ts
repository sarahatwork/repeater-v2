// This hook should only be used in the top Field component to avoid creating multiple state instances

import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import {
  getIsFormInvalid,
  parseSdkBlocks,
  stringifyBlocksForSdk,
} from "../../lib/utils";
import { IBlock } from "../../lib/types";
import { useCallback, useEffect, useState } from "react";

export type UseBlocks = ReturnType<typeof useBlocks>;

const useBlocks = () => {
  const sdk = useSDK<FieldAppSDK>();
  const initialBlocks = parseSdkBlocks(sdk.field.getValue());
  const [blocks, setBlocks] = useState<IBlock[]>(initialBlocks);

  const handleUpdate = useCallback(
    (blockIndex: number, blockFieldIndex: number, value: string) => {
      const blockField = blocks[blockIndex].fields[blockFieldIndex];
      if (blockField.value === value) return;

      setBlocks((e) => {
        const newBlocks = [...e];
        newBlocks[blockIndex].fields[blockFieldIndex].value = value;
        return newBlocks;
      });
    },
    [blocks]
  );

  const handleDelete = useCallback(
    (id: string) => {
      sdk.dialogs
        .openConfirm({
          title: "Are you sure?",
          message: "Are you sure you want to delete this block?",
          intent: "negative",
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
        })
        .then((result) => {
          if (result) {
            setBlocks((e) => {
              const newBlocks = e.filter((block) => block.id !== id);
              return newBlocks;
            });
          }
        });
    },
    [sdk.dialogs]
  );

  // Keep SDK up to date with local changes
  useEffect(() => {
    const isInvalid = getIsFormInvalid(blocks);
    if (!isInvalid) {
      sdk.field.setValue(stringifyBlocksForSdk(blocks));
    }
    sdk.field.setInvalid(isInvalid);
  }, [sdk, blocks]);

  return {
    blocks,
    handleUpdate,
    handleDelete,
    setBlocks,
  };
};

export default useBlocks;
