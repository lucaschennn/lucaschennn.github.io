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
import { FLAT_GROUP, newEntry, thumbUrl } from "@/lib/registry";

// Only animate sorting within the dragged item's own group. Across groups,
// both grids stay still and the target group is highlighted instead.
const sameGroupStrategy = (args) =>
  args.activeIndex === -1 || args.overIndex === -1 ? null : rectSortingStrategy(args);

// Droppable ids for groups are prefixed so they never collide with item ids.
const groupId = (key) => `group:${key}`;

// All groups of one registry file. Items can be reordered and moved between
// groups of the same file. `onChange` receives the new groups object, or an
// updater function of the current groups. `picker` is from useMediaLibrary(), or null to hide Add (visitors).
export default function FileBoard({ fileKey, groups, onChange, picker }) {
  const [activeId, setActiveId] = useState(null);
  const [overGroup, setOverGroup] = useState(null);
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

  // Data only changes on drop. Moving items between groups during the drag shifts
  // the layout under the pointer, which can make dnd-kit loop (max update depth).
  function handleDragOver({ over }) {
    const to = over ? findGroup(over.id) : null;
    setOverGroup((prev) => (prev === to ? prev : to));
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    setOverGroup(null);
    if (!over) return;
    const from = findGroup(active.id);
    const to = findGroup(over.id);
    if (!from || !to) return;

    if (from === to) {
      const oldIndex = groups[from].findIndex((e) => e.id === active.id);
      const newIndex = groups[from].findIndex((e) => e.id === over.id);
      if (newIndex === -1 || oldIndex === newIndex) return;
      onChange({ ...groups, [from]: arrayMove(groups[from], oldIndex, newIndex) });
      return;
    }

    // Into another group: next to the item dropped on (after it if dropped past its
    // centre), or at the end if dropped on the group itself.
    const entry = groups[from].find((e) => e.id === active.id);
    const overIndex = groups[to].findIndex((e) => e.id === over.id);
    const dropped = active.rect.current.translated;
    const pastCentre = dropped && dropped.left + dropped.width / 2 > over.rect.left + over.rect.width / 2;
    const insertAt = overIndex === -1 ? groups[to].length : overIndex + (pastCentre ? 1 : 0);
    onChange({
      ...groups,
      [from]: groups[from].filter((e) => e.id !== active.id),
      [to]: [...groups[to].slice(0, insertAt), entry, ...groups[to].slice(insertAt)],
    });
  }

  const updateItem = (group, id, patch) =>
    onChange({
      ...groups,
      [group]: groups[group].map((e) => (e.id === id ? { ...e, item: { ...e.item, ...patch } } : e)),
    });

  const removeItem = (group, id) =>
    onChange({ ...groups, [group]: groups[group].filter((e) => e.id !== id) });

  // Appends to the group, skipping photos already in it. Uses an updater because
  // the widget calls back after the user has picked, possibly after other edits.
  const addItems = (group, publicIds) =>
    onChange((current) => {
      const present = new Set(current[group].map((e) => e.item.url));
      const added = [...new Set(publicIds)].filter((id) => !present.has(id)).map(newEntry);
      return { ...current, [group]: [...current[group], ...added] };
    });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => { setActiveId(null); setOverGroup(null); }}
    >
      {Object.entries(groups).map(([key, entries]) => (
        <Group
          key={key}
          groupKey={key}
          title={key === FLAT_GROUP ? fileKey : key}
          entries={entries}
          highlight={activeId !== null && overGroup === key && findGroup(activeId) !== key}
          onUpdate={(id, patch) => updateItem(key, id, patch)}
          onRemove={(id) => removeItem(key, id)}
          addable={!!picker}
          onAdd={picker?.ready ? () => picker.open((ids) => addItems(key, ids)) : null}
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

function Group({ groupKey, title, entries, highlight, onUpdate, onRemove, addable, onAdd }) {
  const { setNodeRef } = useDroppable({ id: groupId(groupKey) });
  // Project entries need a title, link and description, which skyview can't edit yet.
  const canAdd = addable && !entries.some((e) => "title" in e.item);
  return (
    <section className="group">
      <h3>
        {title} <span className="count">{entries.length}</span>
        {canAdd && (
          <button type="button" className="add" onClick={onAdd} disabled={!onAdd}>
            + Add photos
          </button>
        )}
      </h3>
      <SortableContext items={entries.map((e) => e.id)} strategy={sameGroupStrategy}>
        <div ref={setNodeRef} className={`grid${highlight ? " drop-target" : ""}`}>
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
