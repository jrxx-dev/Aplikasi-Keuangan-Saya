"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Save, RotateCcw, Pencil, X, MoveHorizontal, MoveVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Helper to get col-span class
const getColSpanClass = (span: number) => {
    // Extended to allow 1-12
    const clamped = Math.max(1, Math.min(12, span));
    switch (clamped) {
        case 1: return "md:col-span-1";
        case 2: return "md:col-span-2";
        case 3: return "md:col-span-3";
        case 4: return "md:col-span-4";
        case 5: return "md:col-span-5";
        case 6: return "md:col-span-6";
        case 7: return "md:col-span-7";
        case 8: return "md:col-span-8";
        case 9: return "md:col-span-9";
        case 10: return "md:col-span-10";
        case 11: return "md:col-span-11";
        case 12: return "md:col-span-12";
        default: return "md:col-span-12";
    }
};

// Helper to get row-span class
const getRowSpanClass = (span: number) => {
    // Extended to allow 1-12 rows
    const clamped = Math.max(1, Math.min(12, span));
    switch (clamped) {
        case 1: return "md:row-span-1";
        case 2: return "md:row-span-2";
        case 3: return "md:row-span-3";
        case 4: return "md:row-span-4";
        case 5: return "md:row-span-5";
        case 6: return "md:row-span-6";
        case 7: return "md:row-[span_7]";
        case 8: return "md:row-[span_8]";
        case 9: return "md:row-[span_9]";
        case 10: return "md:row-[span_10]";
        case 11: return "md:row-[span_11]";
        case 12: return "md:row-[span_12]";
        default: return "md:row-span-1";
    }
};

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    colSpan: number;
    rowSpan: number;
    isEditing: boolean;
    index: number;
    onResizeStart: (e: React.PointerEvent, id: string, currentSpan: number, type: 'col' | 'row') => void;
}

function SortableItem({ id, children, colSpan, rowSpan, isEditing, index, onResizeStart }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    // Use motion div for smooth layout transitions
    // DndKit handles the drag transform, Framer Motion handles the layout reflow
    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition, // Use dnd-kit transition for drag
        zIndex: isDragging ? 50 : "auto",
    };

    return (
        <motion.div
            layout
            layoutId={id}
            initial={false}
            ref={setNodeRef}
            style={style}
            animate={{
                scale: isDragging ? 1.02 : 1,
                boxShadow: isDragging ? "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" : "none"
            }}
            transition={{
                layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 },
                scale: { duration: 0.2 }
            }}
            className={cn(
                "relative group h-full overflow-hidden rounded-3xl", // Added overflow-hidden and rounded-3xl for neatness
                "col-span-12", // Mobile always full width
                getColSpanClass(colSpan),
                getRowSpanClass(rowSpan),
                isDragging && "opacity-80 z-50 ring-2 ring-primary" // customized dragging state
            )}
        >
            {isEditing && (
                <>
                    {/* Number ID Overlay */}
                    <div className="absolute top-2 left-2 z-20 w-8 h-8 flex items-center justify-center bg-black text-white dark:bg-white dark:text-black rounded-full font-bold shadow-lg pointer-events-none text-sm">
                        {index + 1}
                    </div>

                    {/* Drag Handle (Top Right) */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="absolute top-2 right-2 z-20 p-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-md cursor-grab active:cursor-grabbing hover:bg-white dark:hover:bg-zinc-700 text-foreground shadow-sm opacity-100 hover:scale-110 transition-all border border-black/5 dark:border-white/10"
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>

                    {/* Width Resize Handle (Right Edge) */}
                    <div
                        className="absolute top-4 right-0 bottom-4 w-4 z-30 cursor-ew-resize group/resize-x flex items-center justify-center hover:bg-primary/10 transition-colors rounded-r-xl"
                        onPointerDown={(e) => onResizeStart(e, id, colSpan, 'col')}
                    >
                        <div className="h-8 w-1 bg-muted-foreground/30 rounded-full group-hover/resize-x:bg-primary/50 transition-colors" />
                    </div>

                    {/* Height Resize Handle (Bottom Edge) */}
                    <div
                        className="absolute bottom-0 left-4 right-4 h-4 z-30 cursor-ns-resize group/resize-y flex items-center justify-center hover:bg-primary/10 transition-colors rounded-b-xl"
                        onPointerDown={(e) => onResizeStart(e, id, rowSpan, 'row')}
                    >
                        <div className="w-8 h-1 bg-muted-foreground/30 rounded-full group-hover/resize-y:bg-primary/50 transition-colors" />
                    </div>

                    <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-xl pointer-events-none bg-primary/5 dark:bg-primary/10" />


                </>
            )}

            <div className={cn("h-full", isEditing && "pointer-events-none opacity-80 blur-[0.5px]")}>
                {children}
            </div>
        </motion.div>
    );
}

interface DashboardItem {
    id: string;
    component: React.ReactNode;
    defaultColSpan: number; // 1-12
    defaultRowSpan?: number; // 1-12
}

interface DashboardGridProps {
    items: DashboardItem[];
    isEditing: boolean;
    onSave: () => void;
    onCancel: () => void;
    onReset: () => void;
}

export function DashboardGrid({ items: initialItems, isEditing, onSave, onCancel, onReset }: DashboardGridProps) {
    const [items, setItems] = useState(initialItems);

    // Track both logical column sizes and row sizes
    const [colSizes, setColSizes] = useState<Record<string, number>>(() => {
        return initialItems.reduce((acc, item) => ({ ...acc, [item.id]: item.defaultColSpan }), {});
    });

    const [rowSizes, setRowSizes] = useState<Record<string, number>>(() => {
        return initialItems.reduce((acc, item) => ({ ...acc, [item.id]: item.defaultRowSpan || 1 }), {});
    });

    const [mounted, setMounted] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    const gridRef = useRef<HTMLDivElement>(null);

    // Update ref to store type of resize
    const resizingRef = useRef<{
        id: string;
        startX: number;
        startY: number;
        startSpan: number;
        gridWidth: number;
        type: 'col' | 'row'
    } | null>(null);

    // Load saved layout from localStorage
    // Load saved layout from localStorage or sync with new initialItems
    useEffect(() => {
        setMounted(true);
        const savedLayout = localStorage.getItem("dashboard-layout-v8");

        if (savedLayout) {
            try {
                const parsed = JSON.parse(savedLayout);
                if (parsed.order && Array.isArray(parsed.order)) {
                    // Create a map for quick lookup
                    const itemMap = new Map(initialItems.map(i => [i.id, i]));

                    // Reconstruct items based on saved order
                    // Filter out any IDs that might not exist in current initialItems (e.g. removed widgets)
                    const sortedItems = parsed.order
                        .map((id: string) => itemMap.get(id))
                        .filter((item: DashboardItem | undefined): item is DashboardItem => item !== undefined);

                    // Add any new items that weren't in the saved order at the end
                    const textIds = new Set(parsed.order);
                    const newItems = initialItems.filter(i => !textIds.has(i.id));

                    setItems([...sortedItems, ...newItems]);
                } else {
                    // Fallback if structure is invalid
                    setItems(initialItems);
                }

                if (parsed.colSizes) {
                    setColSizes(prev => ({ ...prev, ...parsed.colSizes }));
                }
                if (parsed.rowSizes) {
                    setRowSizes(prev => ({ ...prev, ...parsed.rowSizes }));
                }
            } catch (e) {
                console.error("Failed to parse dashboard layout", e);
                setItems(initialItems);
            }
        } else {
            // No saved layout, just sync with new props
            setItems(initialItems);
        }
    }, [initialItems]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Prevent accidental clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    // Resize Handlers
    const handleResizeStart = (e: React.PointerEvent, id: string, startSpan: number, type: 'col' | 'row') => {
        e.preventDefault();
        e.stopPropagation();

        if (!gridRef.current) return;
        const gridWidth = gridRef.current.offsetWidth;

        resizingRef.current = {
            id,
            startX: e.clientX,
            startY: e.clientY,
            startSpan,
            gridWidth,
            type
        };

        // Add global listeners
        window.addEventListener('pointermove', handleResizeMove);
        window.addEventListener('pointerup', handleResizeEnd);
        // Disable text selection during resize
        document.body.style.userSelect = 'none';
        document.body.style.cursor = type === 'col' ? 'ew-resize' : 'ns-resize';
    };

    const handleResizeMove = useCallback((e: PointerEvent) => {
        if (!resizingRef.current) return;

        const { id, startX, startY, startSpan, gridWidth, type } = resizingRef.current;

        if (type === 'col') {
            const colWidth = gridWidth / 12; // Width of one grid column
            const deltaX = e.clientX - startX;
            const deltaCols = Math.round(deltaX / colWidth);
            let newSpan = startSpan + deltaCols;
            newSpan = Math.max(1, Math.min(12, newSpan)); // Expanded to 1-12

            setColSizes(prev => {
                if (prev[id] === newSpan) return prev;
                return { ...prev, [id]: newSpan };
            });
        } else {
            // Row resize
            const ROW_HEIGHT_THRESHOLD = 50; // Reduced threshold for finer row control (was 100)
            const deltaY = e.clientY - startY;
            const deltaRows = Math.round(deltaY / ROW_HEIGHT_THRESHOLD);
            let newSpan = startSpan + deltaRows;
            newSpan = Math.max(1, Math.min(12, newSpan)); // Expanded to 1-12

            setRowSizes(prev => {
                if (prev[id] === newSpan) return prev;
                return { ...prev, [id]: newSpan };
            });
        }
    }, []);

    const handleResizeEnd = useCallback(() => {
        resizingRef.current = null;
        window.removeEventListener('pointermove', handleResizeMove);
        window.removeEventListener('pointerup', handleResizeEnd);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
    }, [handleResizeMove]);


    const handleSave = () => {
        const layout = {
            order: items.map((item) => item.id),
            colSizes: colSizes,
            rowSizes: rowSizes
        };
        localStorage.setItem("dashboard-layout-v8", JSON.stringify(layout));
        onSave();
    };

    const handleReset = () => {
        setItems(initialItems);
        setColSizes(initialItems.reduce((acc, item) => ({ ...acc, [item.id]: item.defaultColSpan }), {}));
        setRowSizes(initialItems.reduce((acc, item) => ({ ...acc, [item.id]: item.defaultRowSpan || 1 }), {}));
        localStorage.removeItem("dashboard-layout-v8");
        onReset();
    };

    // Helper to find item by id for overlay
    const activeItem = useMemo(() => items.find((item) => item.id === activeId), [activeId, items]);

    if (!mounted) return null;

    return (
        <div className="space-y-4">
            {isEditing && (
                <div className="flex items-center justify-between mb-4 animate-in fade-in slide-in-from-top-4 bg-white/50 dark:bg-zinc-800/50 p-4 rounded-xl border border-black/5 dark:border-white/5 backdrop-blur-md sticky top-4 z-40 shadow-lg">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <GripVertical className="w-4 h-4" />
                        <span>Geser posisi • Tarik titik (resize)</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
                            <X className="h-4 w-4" />
                            Batal
                        </Button>
                        <Button variant="default" size="sm" onClick={handleSave} className="gap-2">
                            <Save className="h-4 w-4" />
                            Simpan Perubahan
                        </Button>
                    </div>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-20 auto-rows-[minmax(120px,auto)]">
                        {items.map((item, index) => (
                            <SortableItem
                                key={item.id}
                                id={item.id}
                                colSpan={colSizes[item.id] || item.defaultColSpan}
                                rowSpan={rowSizes[item.id] || item.defaultRowSpan || 1}
                                isEditing={isEditing}
                                index={index}
                                onResizeStart={handleResizeStart}
                            >
                                {/* If dragging, show placeholder/opacity on the grid item */}
                                {activeId === item.id ? (
                                    <div className="w-full h-full rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 dark:bg-white/5 flex items-center justify-center">
                                        <span className="text-muted-foreground text-sm font-medium">Drop here</span>
                                    </div>
                                ) : (
                                    item.component
                                )}
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay adjustScale={true}>
                    {activeId && activeItem ? (
                        <div
                            className={cn(
                                "w-full h-full cursor-grabbing shadow-2xl rounded-xl overflow-hidden ring-2 ring-primary bg-background/80 backdrop-blur-sm z-50",
                            )}
                        >
                            <div className="pointer-events-none w-full h-full opacity-90">
                                {activeItem.component}
                            </div>

                            <div className="absolute top-2 left-2 z-20 w-8 h-8 flex items-center justify-center bg-black text-white dark:bg-white dark:text-black rounded-full font-bold shadow-lg text-sm">
                                {items.findIndex(i => i.id === activeId) + 1}
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
