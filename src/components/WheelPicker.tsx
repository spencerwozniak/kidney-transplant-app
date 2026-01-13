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
  const isTouchingRef = useRef(false);
  const startYRef = useRef(0);
  const scrollTopRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchScrollTopRef = useRef(0);

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

  const snapToNearestItem = React.useCallback((scrollY: number) => {
    // Calculate which item should be selected based on scroll position
    // scrollY is the scroll position, which directly corresponds to item index
    // Account for padding in the calculation
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
  }, [items, selectedValue, onValueChange]);

  const handleScrollEndDrag = (event: any) => {
    snapToNearestItem(event.nativeEvent.contentOffset.y);
  };

  const handleMomentumScrollEnd = (event: any) => {
    snapToNearestItem(event.nativeEvent.contentOffset.y);
  };

  // Add mouse drag support for web
  useEffect(() => {
    console.log('WheelPicker: useEffect running, Platform.OS:', Platform.OS, 'containerRef.current:', !!containerRef.current);
    if (Platform.OS !== 'web' || !containerRef.current) {
      console.log('WheelPicker: Skipping setup - not web or no containerRef');
      return;
    }

    // Find the scrollable element - use exact same logic as WebScrollableScrollView
    const findScrollElement = (): HTMLElement | null => {
      if (!containerRef.current) {
        console.log('WheelPicker: containerRef.current is null');
        return null;
      }

      // Get the DOM node - try multiple ways React Native Web might store it
      let containerNode = (containerRef.current as any)._node || 
                         (containerRef.current as any)._nativeNode;
      
      // If not found, try accessing the ref directly (sometimes it IS the DOM node)
      if (!containerNode && containerRef.current) {
        // Check if the ref itself is a DOM element
        if (containerRef.current instanceof HTMLElement) {
          containerNode = containerRef.current;
        } else {
          // Try other possible properties
          containerNode = (containerRef.current as any).current || 
                         (containerRef.current as any).__domNode ||
                         (containerRef.current as any).domNode;
        }
      }

      console.log('WheelPicker: containerNode:', containerNode, 'containerRef.current:', containerRef.current);
      
      if (!containerNode) {
        console.log('WheelPicker: containerNode is null, cannot find scroll element');
        return null;
      }

      // Recursive function to find scrollable element
      // React Native Web uses classes like r-overflowY-* and r-WebkitOverflowScrolling-*
      const finder = (el: any, depth = 0): HTMLElement | null => {
        if (!el || depth > 10) return null;

        if (el.tagName === 'DIV') {
          // Check for React Native Web's scrollable class pattern first
          // The scrollable div has both r-overflowY-* and r-WebkitOverflowScrolling-* classes
          if (el.className && typeof el.className === 'string') {
            const hasOverflowY = el.className.includes('r-overflowY-') || el.className.includes('r-overflow-');
            const hasWebkitOverflow = el.className.includes('r-WebkitOverflowScrolling-');
            
            if (hasOverflowY && hasWebkitOverflow) {
              // This is likely a React Native Web ScrollView
              const style = window.getComputedStyle(el);
              const overflowY = style.overflowY;
              // Check if it's actually scrollable (has scrollable content)
              if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden') &&
                  el.scrollHeight > el.clientHeight) {
                return el;
              }
            }
          }

          // Fall back to checking computed styles
          const style = window.getComputedStyle(el);
          const overflowX = style.overflowX;
          const overflowY = style.overflowY;

          // Check if it's scrollable (horizontal or vertical)
          if (
            ((overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden') &&
              el.scrollWidth > el.clientWidth) ||
            ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden') &&
              el.scrollHeight > el.clientHeight)
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

    let retryCount = 0;
    const maxRetries = 20; // More retries for Modal content
    
    const setupMouseDrag = () => {
      console.log('WheelPicker: setupMouseDrag called, retry:', retryCount);
      
      // Use exact same setup pattern as WebScrollableScrollView
      let scrollElement = findScrollElement();
      
      console.log('WheelPicker: findScrollElement returned:', !!scrollElement);
      
      // If not found, try alternative method: look for React Native Web's scrollable class pattern
      // Use querySelector to find elements with BOTH required classes
      if (!scrollElement && containerRef.current) {
        // Try multiple ways to get the DOM node
        let containerNode = (containerRef.current as any)._node || 
                           (containerRef.current as any)._nativeNode;
        if (!containerNode && containerRef.current instanceof HTMLElement) {
          containerNode = containerRef.current;
        }
        if (!containerNode) {
          containerNode = (containerRef.current as any).current || 
                         (containerRef.current as any).__domNode ||
                         (containerRef.current as any).domNode;
        }
        if (containerNode) {
          // Look for divs with React Native Web's scrollable classes
          // The scrollable div MUST have BOTH r-overflowY-* AND r-WebkitOverflowScrolling-*
          // Use querySelector with attribute selectors to find elements with both classes
          const allDivs = containerNode.querySelectorAll('div');
          for (let i = 0; i < allDivs.length; i++) {
            const candidate = allDivs[i] as HTMLElement;
            if (candidate.className && typeof candidate.className === 'string') {
              const hasOverflowY = candidate.className.includes('r-overflowY-');
              const hasWebkitOverflow = candidate.className.includes('r-WebkitOverflowScrolling-');
              
              // Must have BOTH classes
              if (hasOverflowY && hasWebkitOverflow) {
                const style = window.getComputedStyle(candidate);
                const overflowY = style.overflowY;
                if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden') &&
                    candidate.scrollHeight > candidate.clientHeight) {
                  scrollElement = candidate;
                  break;
                }
              }
            }
          }
        }
      }
      
      // Also try getting it from the ScrollView ref directly
      if (!scrollElement && scrollViewRef.current) {
        const scrollViewNode = (scrollViewRef.current as any)._node || 
                              (scrollViewRef.current as any)._nativeNode ||
                              (scrollViewRef.current as any).getNode?.();
        if (scrollViewNode) {
          // Look for the scrollable div inside the ScrollView
          // Must have BOTH r-overflowY-* AND r-WebkitOverflowScrolling-*
          const allDivs = scrollViewNode.querySelectorAll('div');
          for (let i = 0; i < allDivs.length; i++) {
            const candidate = allDivs[i] as HTMLElement;
            if (candidate.className && typeof candidate.className === 'string') {
              const hasOverflowY = candidate.className.includes('r-overflowY-');
              const hasWebkitOverflow = candidate.className.includes('r-WebkitOverflowScrolling-');
              
              // Must have BOTH classes
              if (hasOverflowY && hasWebkitOverflow) {
                const style = window.getComputedStyle(candidate);
                const overflowY = style.overflowY;
                if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden') &&
                    candidate.scrollHeight > candidate.clientHeight) {
                  scrollElement = candidate;
                  break;
                }
              }
            }
          }
        }
      }

      // Final fallback: search within the container's parent tree for scrollable elements
      // This ensures we find the element specific to THIS WheelPicker instance
      if (!scrollElement && containerRef.current) {
        // Try multiple ways to get the DOM node
        let containerNode = (containerRef.current as any)._node || 
                           (containerRef.current as any)._nativeNode;
        if (!containerNode && containerRef.current instanceof HTMLElement) {
          containerNode = containerRef.current;
        }
        if (!containerNode) {
          containerNode = (containerRef.current as any).current || 
                         (containerRef.current as any).__domNode ||
                         (containerRef.current as any).domNode;
        }
        if (containerNode) {
          // Try searching from the container node itself, going up the tree
          let searchNode = containerNode;
          let depth = 0;
          while (searchNode && depth < 10) {
            // Search for scrollable elements within this node
            const candidates = searchNode.querySelectorAll('div[class*="r-overflowY-"][class*="r-WebkitOverflowScrolling-"]');
            for (let i = 0; i < candidates.length; i++) {
              const candidate = candidates[i] as HTMLElement;
              // Make sure this candidate is a descendant of our container (not a sibling)
              if (containerNode.contains(candidate)) {
                const style = window.getComputedStyle(candidate);
                const overflowY = style.overflowY;
                if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden') &&
                    candidate.scrollHeight > candidate.clientHeight) {
                  scrollElement = candidate;
                  break;
                }
              }
            }
            if (scrollElement) break;
            // Move up to parent
            searchNode = searchNode.parentElement;
            depth++;
          }
        }
      }

      if (!scrollElement) {
        retryCount++;
        if (retryCount < maxRetries) {
          // Increase delay for Modal content
          setTimeout(setupMouseDrag, 100);
        }
        return;
      }

      // Reset retry count on success
      retryCount = 0;

      // Each WheelPicker instance should set up handlers on its own element
      // Allow multiple WheelPickers to coexist - each will set up its own handlers
      // Track handler ID for cleanup
      const handlerId = `handler_${Date.now()}_${Math.random()}`;
      if (!(scrollElement as any).__wheelPickerHandlers) {
        (scrollElement as any).__wheelPickerHandlers = new Set();
      }
      (scrollElement as any).__wheelPickerHandlers.add(handlerId);
      
      // Always log for debugging (can be removed later)
      console.log('WheelPicker: Found scroll element:', scrollElement);
      console.log('WheelPicker: Element classes:', scrollElement.className);
      console.log('WheelPicker: ScrollHeight:', scrollElement.scrollHeight, 'ClientHeight:', scrollElement.clientHeight);
      
      // Determine scroll direction - same as WebScrollableScrollView
      const isVertical = scrollElement.scrollHeight > scrollElement.clientHeight;

      const handleMouseDown = (e: MouseEvent) => {
        // Only handle left mouse button - same as WebScrollableScrollView
        if (e.button !== 0) return;

        // Check if clicking on the scrollable area
        const rect = scrollElement.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const clickX = e.clientX - rect.left;
        
        // Only start drag if clicking within bounds
        if (clickY < 0 || clickY > rect.height || clickX < 0 || clickX > rect.width) {
          return;
        }

        isDraggingRef.current = true;
        startYRef.current = e.clientY - rect.top;
        scrollTopRef.current = scrollElement.scrollTop;
        scrollElement.style.cursor = 'grabbing';
        scrollElement.style.userSelect = 'none';
        scrollElement.style.webkitUserSelect = 'none';
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      };

      const handleMouseLeave = () => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          scrollElement.style.cursor = isVertical ? 'grab' : '';
          scrollElement.style.userSelect = '';
        }
      };

      const handleMouseUp = () => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          scrollElement.style.cursor = isVertical ? 'grab' : '';
          scrollElement.style.userSelect = '';
          
          // Snap to nearest item after drag ends
          if (scrollViewRef.current) {
            const scrollY = scrollElement.scrollTop;
            snapToNearestItem(scrollY);
          }
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const rect = scrollElement.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const walkY = (y - startYRef.current) * 2; // Scroll speed multiplier - same as WebScrollableScrollView
        
        // For vertical scrolling - same pattern as WebScrollableScrollView
        if (isVertical) {
          const newScrollTop = scrollTopRef.current - walkY;
          // Clamp to valid scroll range
          const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
          const clampedScrollTop = Math.max(0, Math.min(maxScroll, newScrollTop));
          scrollElement.scrollTop = clampedScrollTop;
          console.log('WheelPicker: Scrolling to', clampedScrollTop, 'of', maxScroll);
        }
      };

      // Handle wheel events to control scroll sensitivity
      // This ensures one wheel tick = one item movement
      let lastWheelTime = 0;
      let wheelThrottle = 100; // Minimum time between wheel events (ms)
      let lastWheelIndex = -1;
      
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const now = Date.now();
        
        // Throttle wheel events to prevent double-firing
        if (now - lastWheelTime < wheelThrottle) {
          return;
        }
        lastWheelTime = now;

        // Calculate scroll direction (only process if significant movement)
        const deltaY = e.deltaY;
        if (Math.abs(deltaY) < 10) return; // Ignore tiny movements
        
        const scrollDirection = deltaY > 0 ? 1 : -1; // positive = down, negative = up

        // Get current scroll position and calculate current item index
        const currentScrollTop = scrollElement.scrollTop;
        const currentIndex = Math.round(currentScrollTop / ITEM_HEIGHT);

        // Calculate target index (one item at a time)
        const targetIndex = Math.max(0, Math.min(items.length - 1, currentIndex + scrollDirection));

        // Only proceed if index actually changed and is different from last processed index
        if (targetIndex === currentIndex || targetIndex === lastWheelIndex) {
          return;
        }
        lastWheelIndex = targetIndex;

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

      // Set initial cursor - same as WebScrollableScrollView
      if (isVertical) {
        scrollElement.style.cursor = 'grab';
      }
      
      // Ensure the element can receive pointer events
      scrollElement.style.pointerEvents = 'auto';
      scrollElement.style.touchAction = 'pan-y'; // Allow vertical touch scrolling
      
      // Touch event handlers for mobile/touchscreen support
      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) return; // Only handle single touch
        
        const touch = e.touches[0];
        const rect = scrollElement.getBoundingClientRect();
        const touchY = touch.clientY - rect.top;
        const touchX = touch.clientX - rect.left;
        
        // Only start touch if within bounds
        if (touchY < 0 || touchY > rect.height || touchX < 0 || touchX > rect.width) {
          return;
        }

        isTouchingRef.current = true;
        touchStartYRef.current = touch.clientY - rect.top;
        touchScrollTopRef.current = scrollElement.scrollTop;
        e.preventDefault();
        e.stopPropagation();
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!isTouchingRef.current || e.touches.length !== 1) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const touch = e.touches[0];
        const rect = scrollElement.getBoundingClientRect();
        const y = touch.clientY - rect.top;
        const walkY = (y - touchStartYRef.current) * 2; // Scroll speed multiplier
        
        // For vertical scrolling
        if (isVertical) {
          const newScrollTop = touchScrollTopRef.current - walkY;
          // Clamp to valid scroll range
          const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
          const clampedScrollTop = Math.max(0, Math.min(maxScroll, newScrollTop));
          scrollElement.scrollTop = clampedScrollTop;
        }
      };

      const handleTouchEnd = (e: TouchEvent) => {
        if (isTouchingRef.current) {
          isTouchingRef.current = false;
          
          // Snap to nearest item after touch ends
          if (scrollViewRef.current) {
            const scrollY = scrollElement.scrollTop;
            snapToNearestItem(scrollY);
          }
        }
      };

      // Add event listeners - EXACT same pattern as WebScrollableScrollView (no capture phase)
      scrollElement.addEventListener('mousedown', handleMouseDown, { passive: false });
      scrollElement.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      
      // Add touch event listeners for mobile/touchscreen support
      scrollElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      scrollElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      scrollElement.addEventListener('touchend', handleTouchEnd, { passive: false });
      scrollElement.addEventListener('touchcancel', handleTouchEnd, { passive: false });
      
      // Add wheel handler to control scroll sensitivity (WheelPicker-specific)
      scrollElement.addEventListener('wheel', handleWheel, { passive: false });
      
      // Log that handlers were attached
      console.log('WheelPicker: Handlers attached successfully to element:', scrollElement);
      console.log('WheelPicker: Element offsetParent:', scrollElement.offsetParent);
      console.log('WheelPicker: Element display:', window.getComputedStyle(scrollElement).display);
      console.log('WheelPicker: Element pointerEvents:', window.getComputedStyle(scrollElement).pointerEvents);
      
      // Test if element is actually in the DOM and visible
      if (scrollElement.offsetParent === null && scrollElement.style.display !== 'none') {
        console.warn('WheelPicker: Element may not be visible in DOM');
      }
      
      // Check for any elements that might be blocking pointer events
      const rect = scrollElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const elementAtPoint = document.elementFromPoint(centerX, centerY);
      console.log('WheelPicker: Element at center point:', elementAtPoint);
      if (elementAtPoint !== scrollElement && !scrollElement.contains(elementAtPoint)) {
        console.warn('WheelPicker: Another element is on top:', elementAtPoint);
        console.warn('WheelPicker: Overlaying element classes:', (elementAtPoint as HTMLElement)?.className);
      }

      return () => {
        scrollElement.removeEventListener('mousedown', handleMouseDown);
        scrollElement.removeEventListener('mouseleave', handleMouseLeave);
        scrollElement.removeEventListener('wheel', handleWheel);
        scrollElement.removeEventListener('touchstart', handleTouchStart);
        scrollElement.removeEventListener('touchmove', handleTouchMove);
        scrollElement.removeEventListener('touchend', handleTouchEnd);
        scrollElement.removeEventListener('touchcancel', handleTouchEnd);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMove);
        // Clean up handler tracking
        if ((scrollElement as any).__wheelPickerHandlers) {
          (scrollElement as any).__wheelPickerHandlers.delete(handlerId);
        }
      };
    };

    // Start setup immediately and also after delays (for Modal content)
    console.log('WheelPicker: Setting up timeouts for mouse drag setup');
    const timeoutId1 = setTimeout(() => {
      console.log('WheelPicker: Timeout 1 (100ms) - calling setupMouseDrag');
      setupMouseDrag();
    }, 100);
    const timeoutId2 = setTimeout(() => {
      console.log('WheelPicker: Timeout 2 (500ms) - calling setupMouseDrag');
      setupMouseDrag();
    }, 500); // Extra delay for Modal
    const timeoutId3 = setTimeout(() => {
      console.log('WheelPicker: Timeout 3 (1000ms) - calling setupMouseDrag');
      setupMouseDrag();
    }, 1000); // Even more delay for Modal
    
    // Use MutationObserver to detect when Modal content is added to DOM
    // Also observe document body to catch when Modal content is added
    let observer: MutationObserver | null = null;
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Try to get container node, but also observe document body for Modal content
      let containerNode = null;
      if (containerRef.current) {
        containerNode = (containerRef.current as any)._node || 
                       (containerRef.current as any)._nativeNode;
        if (!containerNode && containerRef.current instanceof HTMLElement) {
          containerNode = containerRef.current;
        }
        if (!containerNode) {
          containerNode = (containerRef.current as any).current || 
                         (containerRef.current as any).__domNode ||
                         (containerRef.current as any).domNode;
        }
      }
      
      // Observe document body to catch when Modal renders (Modals render to body)
      const observeTarget = containerNode || document.body;
      console.log('WheelPicker: Setting up MutationObserver on:', observeTarget === document.body ? 'document.body' : 'containerNode');
      
      observer = new MutationObserver(() => {
        // When DOM changes, try to set up mouse drag again
        console.log('WheelPicker: MutationObserver detected change - calling setupMouseDrag');
        setupMouseDrag();
      });
      
      // Observe the container (if found) or document body for Modal content
      observer.observe(observeTarget, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    } else {
      console.warn('WheelPicker: window or document is undefined');
    }
    
    return () => {
      console.log('WheelPicker: Cleaning up timeouts and observer');
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [items, onValueChange, selectedValue, snapToNearestItem]);

  return (
    <View 
      ref={containerRef} 
      style={[styles.container, style]}
      {...(Platform.OS === 'web' && {
        // Enable pointer events on web for mouse dragging
        pointerEvents: 'auto',
      })}>
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
        snapToInterval={Platform.OS === 'web' ? undefined : ITEM_HEIGHT}
        snapToAlignment="start"
        scrollEnabled={true}
        {...(Platform.OS === 'web' && {
          // On web, we handle scrolling manually with mouse drag and touch handlers
          // Native scrolling is still enabled for fallback and wheel events
        })}>
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
