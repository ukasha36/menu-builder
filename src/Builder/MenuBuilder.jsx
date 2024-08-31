import "./builder.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  MeasuringStrategy,

} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeItem,
  removeChildrenOf,
  setProperty,
  getChildrens,
} from "./utilities";

import { sortableTreeKeyboardCoordinates } from "./keyboardCoordinates.jsx";
import { SortableTreeItem } from "./components";
import { CSS } from "@dnd-kit/utilities";

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimationConfig = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0.5,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: "ease-out",
  sideEffects({ active }) {
    active.node.animate([{ opacity: 1 }, { opacity: 0.5 }], {
      duration: 150,
      easing: "ease-out",
    });
  },
};

export function MenuBuilder({
  style = "bordered",
  items,
  setItems,
}) {
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(null);

  function updateItem(id, data, items) {
    const newItems = [];

    for (const item of items) {
      if (item.id === id) {
        item.id = data.id;
        item.name = data.name;
        item.href = data.href;
      }

      if (item?.children?.length) {
        item.children = updateItem(id, data, item.children);
      }

      newItems.push(item);
    }

    return newItems;
  }

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce((acc, { children, collapsed, id }) =>
      collapsed && children.length ? [...acc, id] : acc, []);

    return removeChildrenOf(flattenedTree, activeId ? [activeId, ...collapsedItems] : []);
  }, [activeId, items]);

  const projected = useMemo(() => (
    activeId && overId
      ? getProjection(flattenedItems, activeId, overId, offsetLeft, 50)
      : null
  ), [activeId, overId, flattenedItems, offsetLeft]);

  const sensorContext = useRef({
    items,
    offset: 0,
  });

  const coordinateGetter = useMemo(() => (
    sortableTreeKeyboardCoordinates(sensorContext, style === "bordered", 50)
  ), [sensorContext, style]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems]
  );

  const activeItem = useMemo(
    () => activeId ? flattenedItems.find(({ id }) => id === activeId) : null,
    [activeId, flattenedItems]
  );

  useEffect(() => {
    sensorContext.current = {
      items,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const announcements = {
    onDragStart({ active }) {
      return `Picked up ${active.id}.`;
    },
    onDragMove({ active, over }) {
      return getMovementAnnouncement("onDragMove", active.id, over?.id);
    },
    onDragOver({ active, over }) {
      return getMovementAnnouncement("onDragOver", active.id, over?.id);
    },
    onDragEnd({ active, over }) {
      return getMovementAnnouncement("onDragEnd", active.id, over?.id);
    },
    onDragCancel({ active }) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`;
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <DndContext
        accessibility={{ announcements }}
        sensors={sensors}
        collisionDetection={closestCenter}
        measuring={measuring}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
          {flattenedItems.map(({ id, children, collapsed, depth, ...otherFields }) => (
            <SortableTreeItem
              key={id}
              id={id}
              updateitem={(id, data) => setItems((items) => updateItem(id, data, items))}
              value={id}
              otherfields={otherFields}
              depth={id === activeId && projected ? projected.depth : depth}
              indentationWidth={50}
              indicator={style === "bordered"}
              collapsed={Boolean(collapsed && children.length)}
              onCollapse={handleCollapse}
              childCount={getChildCount(items, activeId) + 1}
              onRemove={() => handleRemove(id)}
            />
          ))}
          {createPortal(
            <DragOverlay dropAnimation={dropAnimationConfig} modifiers={style === "bordered" ? [adjustTranslate] : undefined}>
              {activeId && activeItem ? (
                <SortableTreeItem
                  id={activeId}
                  depth={activeItem.depth}
                  clone
                  childCount={getChildCount(items, activeId) + 1}
                  value={activeId.toString()}
                  otherfields={activeItem}
                  indentationWidth={50}
                  childs={getChildrens(items, activeId)}
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </SortableContext>
      </DndContext>
    </div>
  );

  function handleDragStart({ active: { id } }) {
    setActiveId(id);
    setOverId(id);

    const activeItem = flattenedItems.find(({ id }) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: id,
      });
    }

    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta }) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }) {
    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems = JSON.parse(JSON.stringify(flattenTree(items)));
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setItems(newItems);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty("cursor", "");
  }

  function handleRemove(id) {
    setItems((items) => removeItem(items, id));
  }

  function handleCollapse(id) {
    setItems((items) =>
      setProperty(items, id, "collapsed", (value) => !value)
    );
  }

  function getMovementAnnouncement(eventName, activeId, overId) {
    if (overId && projected) {
      if (eventName !== "onDragEnd") {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId: overId,
          });
        }
      }

      const clonedItems = JSON.parse(JSON.stringify(flattenTree(items)));
      const overIndex = clonedItems.findIndex(({ id }) => id === overId);
      const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const previousItem = sortedItems[overIndex - 1];

      let announcement;
      const movedVerb = eventName === "onDragEnd" ? "dropped" : "moved";
      const nestedVerb = eventName === "onDragEnd" ? "dropped" : "nested";

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
        } else {
          let previousSibling = previousItem;
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId = previousSibling.parentId;
            previousSibling = sortedItems.find(({ id }) => id === parentId);
          }

          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
          }
        }
      }

      return announcement;
    }

    return;
  }
}

const adjustTranslate = ({ transform }) => {
  return {
    ...transform,
  };
};

const generateItemChildren = (items) => {
  return items.map((item) => {
    return {
      ...item,
      children: item.children ? generateItemChildren(item.children) : undefined,
    };
  });
};
