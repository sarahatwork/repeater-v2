import {
  Box,
  Card,
  Checkbox,
  FormControl,
  Grid,
  Pill,
  PillProps,
  Select,
  Stack,
  TextInput,
} from "@contentful/f36-components";
import { DragIcon } from "@contentful/f36-icons";

import { CSS } from "@dnd-kit/utilities";
import { BlockFieldLabels, BlockFieldTypes } from "../../lib/constants";
import { TBlockFieldDefinition } from "../../lib/types";
import { useCallback, useMemo } from "react";
import { camelCase } from "lodash";
import DragAndDrop from "../../components/DragAndDrop";
import { rectSortingStrategy, useSortable } from "@dnd-kit/sortable";

interface IProps {
  item: TBlockFieldDefinition;
  onUpdate: (
    func: (item: TBlockFieldDefinition) => TBlockFieldDefinition
  ) => void;
}

interface IOption {
  value: string;
  id: string;
}
const BlockFieldDefinitionGeneratorItem: React.FC<IProps> = ({
  item,
  onUpdate,
}) => {
  const createChangeHandler = useCallback(
    (propName: string) => (event: any) => {
      const value =
        propName === "isRequired" ? event.target.checked : event.target.value;

      onUpdate((item) => ({
        ...item,
        [propName]: value,
        ...(propName === "label" ? { name: camelCase(value) } : {}),
      }));
    },
    [onUpdate]
  );

  const handleKeyDown = useCallback(
    (event: any) => {
      if (event.key !== "Enter") return;

      onUpdate((item) => {
        if (item.type !== "text" || item.options?.includes(event.target.value))
          return item;
        return {
          ...item,
          options: [...(item.options || []), event.target.value],
        };
      });

      event.target.value = "";
    },
    [onUpdate]
  );

  const handleRemoveOption = useCallback(
    (option: string) => {
      onUpdate((item) => {
        if (item.type !== "text" || !item.options) return item;
        return {
          ...item,
          options: item.options.filter((o) => o !== option),
        };
      });
    },
    [onUpdate]
  );

  const handleSetOptions = useCallback(
    (func: (input: IOption[]) => IOption[]) => {
      onUpdate((item) => {
        if (item.type !== "text" || !item.options) return item;
        return {
          ...item,
          options: func(item.options.map((o) => ({ id: o, value: o }))).map(
            (o) => o.value
          ),
        };
      });
    },
    [onUpdate]
  );

  const dragAndDropOptions = useMemo(
    () => "options" in item && item.options?.map((o) => ({ id: o, value: o })),
    [item]
  );

  return (
    <Card>
      <Grid columns="1fr 1fr" rowGap="spacingS" columnGap="spacingM">
        <FormControl isRequired marginBottom="none">
          <FormControl.Label>Label</FormControl.Label>
          <TextInput
            value={item.label}
            onChange={createChangeHandler("label")}
            size="small"
          />
        </FormControl>
        <FormControl isRequired marginBottom="none">
          <FormControl.Label>Name</FormControl.Label>
          <TextInput value={item.name} isDisabled size="small" />
        </FormControl>

        <FormControl isRequired marginBottom="none">
          <FormControl.Label>Type</FormControl.Label>
          <Select
            value={item.type}
            onChange={createChangeHandler("type")}
            size="small"
          >
            {Object.values(BlockFieldTypes).map((type) => (
              <Select.Option key={type} value={type}>
                {BlockFieldLabels[type]}
              </Select.Option>
            ))}
          </Select>
          <Box marginTop="spacingS">
            <Checkbox
              name="isRequired"
              isChecked={item.isRequired}
              onChange={createChangeHandler("isRequired")}
            >
              Field is Required
            </Checkbox>
          </Box>
        </FormControl>
        <FormControl marginBottom="none">
          {item.type === "text" ? (
            <>
              <FormControl.Label>Options</FormControl.Label>
              <TextInput size="small" onKeyDown={handleKeyDown} />
              <Stack marginTop="spacingS" spacing="spacingXs" flexWrap="wrap">
                {item.options && dragAndDropOptions && (
                  <DragAndDrop
                    items={dragAndDropOptions}
                    setItems={handleSetOptions}
                    strategy={rectSortingStrategy}
                  >
                    {item.options.map((option) => (
                      <OptionPill
                        key={option}
                        label={option}
                        onDrag={() => {}}
                        onClose={() => handleRemoveOption(option)}
                      />
                    ))}
                  </DragAndDrop>
                )}
              </Stack>
            </>
          ) : null}
        </FormControl>
      </Grid>
    </Card>
  );
};

const OptionPill: React.FC<PillProps> = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.label });

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

  return (
    <span style={style}>
      <Pill
        dragHandleComponent={
          <DragIcon
            variant="muted"
            style={{ cursor: "move" }}
            label="Drag"
            {...listeners}
          />
        }
        ref={setNodeRef}
        {...props}
        {...attributes}
      />
    </span>
  );
};

export default BlockFieldDefinitionGeneratorItem;
