import { FieldAppSDK } from "@contentful/app-sdk";
import { Button, Menu, Stack } from "@contentful/f36-components";
import { PlusIcon, ArrowDownIcon } from "@contentful/f36-icons";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useCallback, useMemo } from "react";
import { v4 as uuid } from "uuid";
import { parseBlockFieldDefinitions, parseSdkBlocks } from "../../lib/utils";
import { UseBlocks } from "./useBlocks";

interface IProps {
  setBlocks: UseBlocks["setBlocks"];
  onAddNew: (id: string) => void;
}

const MenuBar = ({ setBlocks, onAddNew }: IProps) => {
  const sdk = useSDK<FieldAppSDK>();
  const blockFieldDefinitions = useMemo(
    () =>
      parseBlockFieldDefinitions(sdk.parameters.instance.blockFieldDefinitions),
    [sdk.parameters.instance.blockFieldDefinitions]
  );
  const availableLocalesForField = sdk.entry.fields[sdk.field.id].locales;

  const handleAddNew = useCallback(() => {
    const id = uuid();
    const newBlock = {
      id,
      fields: blockFieldDefinitions.map((definition) => ({
        ...definition,
        value: null,
      })),
    };
    setBlocks((e) => [...e, newBlock]);
    onAddNew(id);
  }, [setBlocks, blockFieldDefinitions, onAddNew]);

  const handleClear = useCallback(() => {
    sdk.dialogs
      .openConfirm({
        title: "Are you sure?",
        message: "Are you sure you want to clear all blocks?",
        intent: "negative",
        confirmLabel: "Clear all",
        cancelLabel: "Cancel",
      })
      .then((result) => {
        if (result) {
          setBlocks([]);
        }
      });
  }, [sdk.dialogs, setBlocks]);

  const handleCopyFromLocale = useCallback(
    (locale: string) => {
      sdk.dialogs
        .openConfirm({
          title: "Are you sure?",
          message: `Are you sure you want to copy content from ${locale} to this locale?`,
          intent: "primary",
          confirmLabel: `Copy from ${locale}`,
          cancelLabel: "Cancel",
        })
        .then((result) => {
          if (result) {
            const valueForOtherLocale =
              sdk.entry.fields[sdk.field.id].getValue(locale);
            setBlocks(parseSdkBlocks(valueForOtherLocale));
          }
        });
    },
    [sdk, setBlocks]
  );

  return (
    <Stack>
      <Button startIcon={<PlusIcon />} onClick={handleAddNew} size="small">
        Add new block
      </Button>

      <Menu>
        <Menu.Trigger>
          <Button size="small" endIcon={<ArrowDownIcon />}>
            More Actions
          </Button>
        </Menu.Trigger>
        <Menu.List>
          <Menu.Item onClick={handleClear}>Clear all blocks</Menu.Item>
          {availableLocalesForField.length > 1 && (
            <Menu.Submenu>
              <Menu.SubmenuTrigger>Copy from locale...</Menu.SubmenuTrigger>
              <Menu.List>
                {availableLocalesForField.map((locale) => {
                  if (locale === sdk.field.locale) return null;
                  return (
                    <Menu.Item
                      key={locale}
                      onClick={() => handleCopyFromLocale(locale)}
                    >
                      {sdk.locales.names[locale]} ({locale})
                    </Menu.Item>
                  );
                })}
              </Menu.List>
            </Menu.Submenu>
          )}
        </Menu.List>
      </Menu>
    </Stack>
  );
};

export default MenuBar;
