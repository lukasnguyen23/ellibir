import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card, TronCard } from '@/engine/types';
import { PlayingCard } from './PlayingCard';

interface HandProps {
  cards: Card[];
  tron: TronCard;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}

function SortableCard({
  card,
  tron,
  selected,
  onToggle,
}: {
  card: Card;
  tron: TronCard;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
      }}
      className="shrink-0"
    >
      <PlayingCard
        card={card}
        tron={tron}
        selected={selected}
        onClick={() => onToggle(card.id)}
        draggableProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export function Hand({ cards, tron, selectedIds, onToggle, onReorder }: HandProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = cards.findIndex((c) => c.id === active.id);
    const newIndex = cards.findIndex((c) => c.id === over.id);
    onReorder(arrayMove(cards, oldIndex, newIndex).map((c) => c.id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={cards.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
        <div className="flex items-end gap-2 px-4 pt-6 pb-2 overflow-x-auto flex-nowrap min-w-0">
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              tron={tron}
              selected={selectedIds.includes(card.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
