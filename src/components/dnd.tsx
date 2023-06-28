/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useState, useRef } from "react";
import { PanInfo, motion, useAnimationControls, useDragControls } from 'framer-motion';

// TODO cancel drag on Escape key

export const Dnd = () => {
  const [lists, setLists] = useState([
    { id: '1', items: ['1', '2', '3', '4', '5'] },
    { id: '2', items: ['A', 'B', 'C', 'D', 'E'] },
    { id: '3', items: ['I', 'II', 'III', 'IV', 'V'] },
  ]);

  const [draggedElement, setDraggedElement] = useState<{ listId: string; index: number }>();
  const draggedOverElement = useRef<{ listId: string; index?: number }>();

  // const dragControls = useDragControls();
  const animationControls = useAnimationControls();

  const handleMouseMove = (listId: string, index?: number) => (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    console.debug('handleMouseMove', listId, index);

    draggedOverElement.current = { listId, index };
  }

  const handleDragStart = (listId: string, index: number) => (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    console.debug('handleDragStart', listId, index);

    setDraggedElement({ listId, index });
  };

  const handleDragEnd = (e: MouseEvent, info: PanInfo) => {
    console.debug('handleDragEnd', info);

    animationControls.set({ x: 0, y: 0 })

    if (!draggedElement || !draggedOverElement.current) {
      setDraggedElement(undefined);
      return;
    }

    const sourceListId = draggedElement.listId;
    const sourceIndex = draggedElement.index;
    const targetListId = draggedOverElement.current.listId;
    const targetIndex = draggedOverElement.current.index;

    if (sourceListId === targetListId && sourceIndex === targetIndex) {
      setDraggedElement(undefined);
      return;
    }

    const sourceItem = lists.find(l => l.id === sourceListId)!.items[sourceIndex]!;
    const targetItem = targetIndex ? lists.find(l => l.id === targetListId)!.items[targetIndex] : undefined;

    // if source and target are the same
    if (sourceListId === targetListId) {

      setLists(lists.map(l => {
        if (l.id !== sourceListId) return l;

        console.debug({ sourceIndex, targetIndex })

        if (!targetIndex && targetIndex !== 0) {
          // mandar al final
          return {
            ...l,
            items: l.items.filter((item, itemIndex) => itemIndex !== sourceIndex).concat(sourceItem),
          };
        }

        const correctedTargetIndex = sourceIndex < targetIndex ? targetIndex : targetIndex;
        console.debug({ sourceIndex, targetIndex, correctedTargetIndex })

        const newItems = l.items.filter((_, itemIndex) => itemIndex !== sourceIndex);
        newItems.splice(correctedTargetIndex, 0, sourceItem);

        return {
          ...l,
          items: newItems,
        };
      }));
      setDraggedElement(undefined);
      return;
    }

    console.debug({ sourceListId, sourceIndex, targetListId, targetIndex })
    // remove from source and insert into target
    const newLists = [...lists];
    const sourceList = newLists.find(l => l.id === sourceListId)!;
    const targetList = newLists.find(l => l.id === targetListId)!;
    sourceList.items.splice(sourceIndex, 1);
    if (!targetIndex && targetIndex !== 0) {
      targetList.items.push(sourceItem);
    } else {
      targetList.items.splice(targetIndex, 0, sourceItem);
    }
    setLists(newLists);
    setDraggedElement(undefined);
  }

  return (
    <div className="min-h-screen flex">
      <ul className="flex-1 flex gap-[20px]">
        {lists.filter(l => l.id === '1' || l.id === '2').map((list) => (
          <motion.li
            key={list.id}
            className="bg-emerald-500 w-[300px] flex flex-col"
            onMouseMove={handleMouseMove(list.id)}
            onDragEnd={handleDragEnd}
          >
            <ul>
              {list.items.map((item, itemIndex) => {
                const isDragging = draggedElement?.listId === list.id && draggedElement?.index === itemIndex;
                return (
                  <motion.li
                    animate={animationControls}
                    layout
                    drag
                    dragMomentum={false}
                    key={item}
                    onDragStart={handleDragStart(list.id, itemIndex)}
                    onDragEnd={handleDragEnd}
                    onMouseMove={handleMouseMove(list.id, itemIndex)}
                    className={`p-[5px] bg-transparent select-none`}
                    style={{ pointerEvents: isDragging ? 'none' : undefined }}
                  >
                    <div className={`text-center rounded cursor-pointer pointer-events-none ${isDragging ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      {item}
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </motion.li>
        ))}
      </ul>
    </div>
  )
};
