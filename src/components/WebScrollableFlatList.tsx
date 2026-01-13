import React, { useRef, useEffect, useState } from 'react';
import { FlatList, Platform, FlatListProps, View, StyleSheet } from 'react-native';

/**
 * WebScrollableFlatList - Enhanced FlatList with mouse drag support for web
 * 
 * On web, this component adds mouse drag scrolling support to FlatList.
 * On native, it behaves exactly like a regular FlatList.
 */
export const WebScrollableFlatList = <T,>(props: FlatListProps<T>) => {
  const flatListRef = useRef<FlatList>(null);
  const containerRef = useRef<View>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const scrollElementRef = useRef<HTMLElement | null>(null);
  const [isWeb] = useState(Platform.OS === 'web');

  // Merge refs
  useEffect(() => {
    if (props.ref) {
      if (typeof props.ref === 'function') {
        props.ref(flatListRef.current);
      } else {
        (props.ref as React.MutableRefObject<FlatList | null>).current = flatListRef.current;
      }
    }
  }, [props.ref]);

  // Find the scrollable element
  const findScrollElement = (): HTMLElement | null => {
    if (!containerRef.current) return null;

    // Get the DOM node - try multiple ways React Native Web might store it
    const containerNode = (containerRef.current as any)._node || 
                         (containerRef.current as any)._nativeNode ||
                         (containerRef.current as any);
    
    if (!containerNode) return null;

    // Recursive function to find scrollable element
    const finder = (el: any, depth = 0): HTMLElement | null => {
      if (!el || depth > 10) return null; // Prevent infinite recursion
      
      // Check if this element is scrollable
      if (el.tagName === 'DIV' && el.style) {
        const style = window.getComputedStyle(el);
        const overflowX = style.overflowX;
        const overflowY = style.overflowY;
        
        // Check if it has horizontal scrolling capability
        if ((overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden') &&
            el.scrollWidth > el.clientWidth) {
          return el;
        }
      }
      
      // Check children first (more likely to be the scroll container)
      if (el.children && el.children.length > 0) {
        for (let i = 0; i < el.children.length; i++) {
          const found = finder(el.children[i], depth + 1);
          if (found) return found;
        }
      }
      
      // Check childNodes as fallback
      if (el.childNodes && el.childNodes.length > 0) {
        for (let i = 0; i < el.childNodes.length; i++) {
          const child = el.childNodes[i];
          if (child && child.nodeType === 1) { // Element node
            const found = finder(child, depth + 1);
            if (found) return found;
          }
        }
      }
      
      return null;
    };

    return finder(containerNode);
  };

  // Add mouse drag handlers for web
  useEffect(() => {
    if (!isWeb) return;

    const setupMouseDrag = () => {
      const scrollElement = findScrollElement();
      
      if (!scrollElement) {
        // Retry after a short delay
        setTimeout(setupMouseDrag, 200);
        return;
      }

      scrollElementRef.current = scrollElement;

      const handleMouseDown = (e: MouseEvent) => {
        // Only handle left mouse button
        if (e.button !== 0) return;
        
        isDraggingRef.current = true;
        const rect = scrollElement.getBoundingClientRect();
        startXRef.current = e.clientX - rect.left;
        scrollLeftRef.current = scrollElement.scrollLeft;
        scrollElement.style.cursor = 'grabbing';
        scrollElement.style.userSelect = 'none';
        e.preventDefault();
        e.stopPropagation();
      };

      const handleMouseLeave = () => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          scrollElement.style.cursor = 'grab';
          scrollElement.style.userSelect = '';
        }
      };

      const handleMouseUp = () => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          scrollElement.style.cursor = 'grab';
          scrollElement.style.userSelect = '';
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        const rect = scrollElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const walk = (x - startXRef.current) * 2; // Scroll speed multiplier
        scrollElement.scrollLeft = scrollLeftRef.current - walk;
      };

      // Set initial styles
      scrollElement.style.cursor = 'grab';
      scrollElement.style.overflowX = 'auto';
      scrollElement.style.overflowY = 'hidden';
      scrollElement.style.WebkitOverflowScrolling = 'touch';

      scrollElement.addEventListener('mousedown', handleMouseDown, { passive: false });
      scrollElement.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove, { passive: false });

      return () => {
        scrollElement.removeEventListener('mousedown', handleMouseDown);
        scrollElement.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMove);
      };
    };

    // Wait a bit for the component to render
    const timeoutId = setTimeout(setupMouseDrag, 300);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isWeb, props.data]);

  // On web, wrap in a container to enable mouse drag
  if (isWeb) {
    return (
      <View ref={containerRef} style={styles.container}>
        <FlatList {...props} ref={flatListRef} />
      </View>
    );
  }

  return <FlatList {...props} ref={flatListRef} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

