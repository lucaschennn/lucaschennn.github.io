"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FLAT_GROUP, thumbUrl } from "@/lib/registry";

// Droppable ids for groups are prefixed so they never collide with item ids.
const groupId = (key) => `group:${key}`;

// All groups of one registry file. Items can be reordered and moved between
// groups of the same file. `onChange(groups)` receives the new groups object.
export default function FileBoard({ fileKey, groups, onChange }) {
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    // A small distance keeps clicks on buttons and inputs from starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findGroup = (id) => {
    if (typeof id === "string" && id.startsWith("group:")) return id.slice(6);
    return Object.keys(groups).find((key) => groups[key].some((e) => e.id === id));
  };

  const activeEntry = activeId
    ? Object.values(groups).flat().find((e) => e.id === activeId)
    : null;

  // Moving into another group happens while dragging, so the item shows up there live.
  function handleDragOver({ active, over }) {
    if (!over) return;
    const from = findGroup(active.id);
    const to = findGroup(over.id);
    if (!from || !to || from === to) return;

    const entry = groups[from].find((e) => e.id === active.id);
    const overIndex = groups[to].findIndex((e) => e.id === over.id);
    const insertAt = overIndex === -1 ? groups[to].length : overIndex;
    onChange({
      ...groups,
      [from]: groups[from].filter((e) => e.id !== active.id),
      [to]: [...groups[to].slice(0, insertAt), entry, ...groups[to].slice(insertAt)],
    });
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over) return;
    const from = findGroup(active.id);
    const to = findGroup(over.id);
    if (!from || from !== to) return;
    const oldIndex = groups[from].findIndex((e) => e.id === active.id);
    const newIndex = groups[from].findIndex((e) => e.id === over.id);
    if (newIndex === -1 || oldIndex === newIndex) return;
    onChange({ ...groups, [from]: arrayMove(groups[from], oldIndex, newIndex) });
  }

  const updateItem = (group, id, patch) =>
    onChange({
      ...groups,
      [group]: groups[group].map((e) => (e.id === id ? { ...e, item: { ...e.item, ...patch } } : e)),
    });

  const removeItem = (group, id) =>
    onChange({ ...groups, [group]: groups[group].filter((e) => e.id !== id) });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      {Object.entries(groups).map(([key, entries]) => (
        <Group
          key={key}
          groupKey={key}
          title={key === FLAT_GROUP ? fileKey : key}
          entries={entries}
          onUpdate={(id, patch) => updateItem(key, id, patch)}
          onRemove={(id) => removeItem(key, id)}
        />
      ))}
      <DragOverlay>
        {activeEntry && (
          <img className="thumb overlay" src={thumbUrl(activeEntry.item.url)} alt="" />
        )}
      </DragOverlay>
    </DndContext>
  );
}

function Group({ groupKey, title, entries, onUpdate, onRemove }) {
  const { setNodeRef } = useDroppable({ id: groupId(groupKey) });
  return (
    <section className="group">
      <h3>
        {title} <span className="count">{entries.length}</span>
      </h3>
      <SortableContext items={entries.map((e) => e.id)} strategy={rectSortingStrategy}>
        <div ref={setNodeRef} className="grid">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              entry={entry}
              onUpdate={(patch) => onUpdate(entry.id, patch)}
              onRemove={() => onRemove(entry.id)}
            />
          ))}
          {entries.length === 0 && <div className="empty">Drop photos here</div>}
        </div>
      </SortableContext>
    </section>
  );
}

function Card({ entry, onUpdate, onRemove }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.id });
  const { item } = entry;
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={`card${isDragging ? " dragging" : ""}`}>
      {/* Only the image is the drag handle, so the input and button behave normally. */}
      <img
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="thumb"
        src={thumbUrl(item.url)}
        alt={item.url}
        title={item.url}
        loading="lazy"
      />
      <button type="button" className="remove" onClick={onRemove} title="Remove from site (stays in Cloudinary)">
        ×
      </button>
      {"title" in item ? (
        // Project entries (published.json) have their own fields; shown read-only for now.
        <div className="meta" title={item.ref}>{item.title}</div>
      ) : (
        <input
          className="source"
          placeholder="source"
          value={item.source ?? ""}
          onChange={(e) => onUpdate({ source: e.target.value })}
        />
      )}
    </div>
  );
}
