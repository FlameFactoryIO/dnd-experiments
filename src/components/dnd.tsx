/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useState, useMemo, useRef, type MouseEvent } from "react";
import { AnimatePresence, motion } from 'framer-motion';

// TODO cancel drag on Escape key

export const Dnd = () => {
  const [lists, setLists] = useState([
    { id: '1', items: ['1', '2', '3', '4', '5'] },
    { id: '2', items: ['A', 'B', 'C', 'D', 'E'] },
    { id: '3', items: ['I', 'II', 'III', 'IV', 'V'] },
  ]);
  const asideList = useMemo(() => lists.find(l => l.id === '3')!, [lists])

  const [draggedElement, setDraggedElement] = useState<{ listId: string; index: number }>();
  const draggedOverElement = useRef<{ listId: string; index?: number }>();

  // todo replace with framer motion drag
  const [draggedElementPosition, setDraggedElementPosition] = useState<{ top: number; left: number }>();

  const handleMouseMoveContainer = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    draggedOverElement.current = undefined;

    setDraggedElementPosition({
      top: e.clientY,
      left: e.clientX,
    });
  }

  const handleMouseMoveItem = (listId: string, index: number) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    draggedOverElement.current = { listId, index };

    setDraggedElementPosition({
      top: e.clientY,
      left: e.clientX,
    });
  }

  const handleMouseMoveList = (listId: string) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    draggedOverElement.current = { listId };

    setDraggedElementPosition({
      top: e.clientY,
      left: e.clientX,
    });
  }

  const handleMouseDown = (listId: string, index: number) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setDraggedElement({ listId, index });
  };

  const handleMouseUpContainer = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setDraggedElement(undefined);
    setDraggedElementPosition(undefined);
  }

  const handleMouseUp = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();

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
    <div className="min-h-screen flex" onMouseMove={handleMouseMoveContainer} onMouseUp={handleMouseUpContainer}>


      <ul className="flex-1 flex gap-[20px]">
        {lists.filter(l => l.id === '1' || l.id === '2').map((list) => (
          <motion.li
            key={list.id}
            className="bg-emerald-500 w-[300px] flex flex-col"
            onMouseMove={handleMouseMoveList(list.id)}
            onMouseUp={handleMouseUp}
            layout layoutId={list.id}
          >
            <ul>
              {list.items.map((item, itemIndex) => (
                <motion.li
                  layout
                  key={`${list.id}:${item}`}
                  onMouseMove={handleMouseMoveItem(list.id, itemIndex)}
                  onMouseDown={handleMouseDown(list.id, itemIndex)}
                  onMouseUp={handleMouseUp}
                  className={`p-[5px] bg-transparent select-none`}
                >
                  <div className={`text-center rounded cursor-pointer pointer-events-none ${draggedElement?.listId === list.id && draggedElement?.index === itemIndex ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    {item}
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.li>
        ))}
      </ul>


      <div className="border-l border-1 w-[400px] flex flex-col">
        <ul
          className="bg-emerald-500 flex-1 w-full flex flex-col"
          onDragOver={handleMouseMoveList(asideList.id)}
          onMouseMove={handleMouseMoveList(asideList.id)}
          onMouseUp={handleMouseUp}
        >
          <AnimatePresence>
            {asideList.items.map((item, itemIndex) => (
              <motion.li
                layout
                key={`${asideList.id}:${item}`}
                onMouseMove={handleMouseMoveItem(asideList.id, itemIndex)}
                onMouseDown={handleMouseDown(asideList.id, itemIndex)}
                onMouseUp={handleMouseUp}
                className={`p-[10px] bg-transparent select-none`}
              >
                <div className={`text-center rounded cursor-pointer pointer-events-none ${draggedElement?.listId === asideList.id && draggedElement?.index === itemIndex ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {item}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>


      {draggedElement && (
        <motion.div
          className="absolute bg-red-500 text-white p-[10px] rounded pointer-events-none"
          style={{ top: draggedElementPosition?.top, left: draggedElementPosition?.left }}
        >
          listId: {draggedElement.listId}<br />
          index: {draggedElement.index}
        </motion.div>
      )}
    </div>
  )
};
