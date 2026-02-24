import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

type SortableHandleContextType = {
  attributes: Record<string, any>;
  listeners: Record<string, any> | undefined;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  registerHandle: () => void;
};

const SortableHandleContext = React.createContext<SortableHandleContextType | null>(null);

export function SortableItem({ id, children, className }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  const [hasHandle, setHasHandle] = React.useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SortableHandleContext.Provider
      value={{
        attributes,
        listeners,
        setActivatorNodeRef,
        registerHandle: () => setHasHandle(true),
      }}
    >
      <div
        ref={setNodeRef}
        style={style}
        className={className}
        {...attributes}
        {...(!hasHandle ? listeners : {})}
      >
        {children}
      </div>
    </SortableHandleContext.Provider>
  );
}

interface SortableHandleProps {
  children: React.ReactNode;
  className?: string;
}

export function SortableHandle({ children, className }: SortableHandleProps) {
  const context = React.useContext(SortableHandleContext);

  if (!context) {
    return <>{children}</>;
  }

  React.useEffect(() => {
    context.registerHandle();
  }, [context]);

  return (
    <button
      type="button"
      ref={context.setActivatorNodeRef as React.Ref<HTMLButtonElement>}
      {...context.listeners}
      {...context.attributes}
      className={cn("inline-flex p-0 bg-transparent border-0 text-inherit touch-action-none cursor-grab active:cursor-grabbing", className)}
      aria-label="Drag to reorder"
    >
      {children}
    </button>
  );
}
