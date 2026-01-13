import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, Dimensions } from 'react-native';

type WheelPickerProps = {
  items: Array<{ label: string; value: string | number }>;
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  style?: any;
};

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING_ITEMS = Math.floor(VISIBLE_ITEMS / 2); // 2 padding items on each side

export const WheelPicker = ({ items, selectedValue, onValueChange, style }: WheelPickerProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const containerRef = useRef<View>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const scrollTopRef = useRef(0);

  // Find the index of the selected value
  const selectedIndex = items.findIndex((item) => item.value === selectedValue);

  // Scroll to selected value on mount or when selectedValue changes
  useEffect(() => {
    if (!isScrolling && scrollViewRef.current) {
      const index = items.findIndex((item) => item.value === selectedValue);
      if (index >= 0) {
        // Scroll to position: index * ITEM_HEIGHT (no padding offset needed since padding is in content)
        scrollViewRef.current.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: false,
        });
      }
    }
  }, [selectedValue, items, isScrolling]);

  const handleScroll = (event: any) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    setIsScrolling(true);

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      snapToNearestItem(event.nativeEvent.contentOffset.y);
    }, 150);
  };

  const snapToNearestItem = (scrollY: number) => {
    // Calculate which item should be selected based on scroll position
    // scrollY is the scroll position, which directly corresponds to item index
    const index = Math.round(scrollY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    const selectedItem = items[clampedIndex];

    if (selectedItem && scrollViewRef.current) {
      // Snap to exact position for this item
      // The scroll position directly maps to item index (padding is in content, not scroll offset)
      const targetY = clampedIndex * ITEM_HEIGHT;
      scrollViewRef.current.scrollTo({
        y: targetY,
        animated: true,
      });
      // Only update if value actually changed to prevent unnecessary re-renders
      if (selectedItem.value !== selectedValue) {
        onValueChange(selectedItem.value);
      }
    }
  };

  const handleScrollEndDrag = (event: any) => {
    snapToNearestItem(event.nativeEvent.contentOffset.y);
  };

  const handleMomentumScrollEnd = (event: any) => {
    snapToNearestItem(event.nativeEvent.contentOffset.y);
  };

  // Add mouse drag support for web
  useEffect(() => {
    if (Platform.OS !== 'web' || !containerRef.current) return;

    const findScrollElement = (): HTMLElement | null => {
      if (!containerRef.current) return null;

      // Get the DOM node
      const containerNode =
        (containerRef.current as any)._node || (containerRef.current as any)._nativeNode;

      if (!containerNode) return null;

      // Recursive function to find scrollable element
      const finder = (el: any, depth = 0): HTMLElement | null => {
        if (!el || depth > 10) return null;

        if (el.tagName === 'DIV' && el.style) {
          const style = window.getComputedStyle(el);
          const overflowY = style.overflowY;

          // Check if it's vertically scrollable
          if (
            (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden') &&
            el.scrollHeight > el.clientHeight
          ) {
            return el;
          }
        }

        // Check children
        if (el.children && el.children.length > 0) {
          for (let i = 0; i < el.children.length; i++) {
            const found = finder(el.children[i], depth + 1);
            if (found) return found;
          }
        }

        // Check childNodes
        if (el.childNodes && el.childNodes.length > 0) {
          for (let i = 0; i < el.childNodes.length; i++) {
            const child = el.childNodes[i];
            if (child && child.nodeType === 1) {
              const found = finder(child, depth + 1);
              if (found) return found;
            }
          }
        }

        return null;
      };

      return finder(containerNode);
    };

    const setupMouseDrag = () => {
      const scrollElement = findScrollElement();
      if (!scrollElement) {
        // Retry after a short delay
        setTimeout(setupMouseDrag, 200);
        return;
      }

      // Skip if already processed
      if ((scrollElement as any).__wheelPickerMouseDragEnabled) return;
      (scrollElement as any).__wheelPickerMouseDragEnabled = true;

      const handleMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return; // Only left mouse button
        isDraggingRef.current = true;
        const rect = scrollElement.getBoundingClientRect();
        startYRef.current = e.clientY - rect.top;
        scrollTopRef.current = scrollElement.scrollTop;
        scrollElement.style.cursor = 'grabbing';
        scrollElement.style.userSelect = 'none';
        e.preventDefault();
        e.stopPropagation();
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        const rect = scrollElement.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const walkY = (y - startYRef.current) * 1.5; // Multiplier for smoother dragging
        scrollElement.scrollTop = scrollTopRef.current - walkY;
      };

      const handleMouseUp = () => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          scrollElement.style.cursor = 'grab';
          scrollElement.style.userSelect = '';
          // Snap to nearest item after drag ends
          if (scrollViewRef.current) {
            const scrollY = scrollElement.scrollTop;
            snapToNearestItem(scrollY);
          }
        }
      };

      const handleMouseLeave = () => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          scrollElement.style.cursor = 'grab';
          scrollElement.style.userSelect = '';
        }
      };

      // Handle wheel events to control scroll sensitivity
      // This ensures one wheel tick = one item movement
      let wheelTimeout: NodeJS.Timeout | null = null;
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Clear any pending wheel timeout
        if (wheelTimeout) {
          clearTimeout(wheelTimeout);
        }

        // Calculate scroll direction
        const deltaY = e.deltaY;
        const scrollDirection = deltaY > 0 ? 1 : -1; // positive = down, negative = up

        // Get current scroll position and calculate current item index
        const currentScrollTop = scrollElement.scrollTop;
        const currentIndex = Math.round(currentScrollTop / ITEM_HEIGHT);

        // Calculate target index (one item at a time)
        const targetIndex = Math.max(0, Math.min(items.length - 1, currentIndex + scrollDirection));

        // Only proceed if index actually changed
        if (targetIndex === currentIndex) return;

        // Calculate target scroll position
        const targetScrollTop = targetIndex * ITEM_HEIGHT;

        // Update scroll position immediately (no smooth scroll to prevent lag)
        scrollElement.scrollTop = targetScrollTop;

        // Update selected value immediately for responsive feel
        const selectedItem = items[targetIndex];
        if (selectedItem && selectedItem.value !== selectedValue) {
          onValueChange(selectedItem.value);
        }
      };

      scrollElement.style.cursor = 'grab';
      scrollElement.addEventListener('mousedown', handleMouseDown, { passive: false });
      scrollElement.addEventListener('mouseleave', handleMouseLeave);
      scrollElement.addEventListener('wheel', handleWheel, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove, { passive: false });

      return () => {
        if (wheelTimeout) {
          clearTimeout(wheelTimeout);
        }
        scrollElement.removeEventListener('mousedown', handleMouseDown);
        scrollElement.removeEventListener('mouseleave', handleMouseLeave);
        scrollElement.removeEventListener('wheel', handleWheel);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMove);
      };
    };

    const timeoutId = setTimeout(setupMouseDrag, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <View ref={containerRef} style={[styles.container, style]}>
      {/* Selection indicator overlay */}
      <View style={styles.selectionIndicator} pointerEvents="none" />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start">
        {items.map((item, index) => {
          const isSelected = item.value === selectedValue;

          return (
            <View key={`item-${index}-${item.value}`} style={styles.item}>
              <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CONTAINER_HEIGHT,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      WebkitOverflowScrolling: 'touch',
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: ITEM_HEIGHT * PADDING_ITEMS, // Top padding to center first item
    paddingBottom: ITEM_HEIGHT * PADDING_ITEMS, // Bottom padding to center last item
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }),
  },
  itemText: {
    fontSize: 20,
    color: '#9ca3af',
    textAlign: 'center',
    ...(Platform.OS === 'web' && {
      transition: 'color 0.2s, font-weight 0.2s',
    }),
  },
  selectedItemText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
  },
  hiddenItemText: {
    opacity: 0,
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * PADDING_ITEMS, // Match padding to align with selected item
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    pointerEvents: 'none',
    zIndex: 1,
  },
});
