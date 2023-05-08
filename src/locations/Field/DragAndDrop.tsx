import {
  DndContext,
  DragEndEvent,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Dispatch, ReactNode, SetStateAction, useCallback } from "react";

interface IProps<T> {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  children: ReactNode;
}

const DropAndDrop = <T extends { id: string }>({
  items,
  setItems,
  children,
}: IProps<T>) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over?.id && active.id !== over.id) {
        setItems((items) => {
          const oldIndex = items.findIndex((e) => e.id === active.id);
          const newIndex = items.findIndex((e) => e.id === over.id);

          return arrayMove(items, oldIndex, newIndex);
        });
      }
    },
    [setItems]
  );

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      sensors={sensors}
      collisionDetection={closestCenter}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
};

export default DropAndDrop;
