import React, { useRef, useEffect } from 'react';
import { ScrollView, Platform, ScrollViewProps, View, StyleSheet } from 'react-native';

/**
 * WebScrollableScrollView - Enhanced ScrollView with mouse drag support for web
 *
 * On web, this component adds mouse drag scrolling support to ScrollView.
 * On native, it behaves exactly like a regular ScrollView.
 */
export const WebScrollableScrollView = (props: ScrollViewProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const containerRef = useRef<View>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const scrollTopRef = useRef(0);
  const scrollElementRef = useRef<HTMLElement | null>(null);
  const isWeb = Platform.OS === 'web';

  // Merge refs
  useEffect(() => {
    if (props.ref) {
      if (typeof props.ref === 'function') {
        props.ref(scrollViewRef.current);
      } else {
        (props.ref as React.MutableRefObject<ScrollView | null>).current = scrollViewRef.current;
      }
    }
  }, [props.ref]);

  // Find the scrollable element
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

  // Add mouse drag handlers for web
  useEffect(() => {
    if (!isWeb) return;

    const setupMouseDrag = () => {
      const scrollElement = findScrollElement();

      if (!scrollElement) {
        setTimeout(setupMouseDrag, 200);
        return;
      }

      scrollElementRef.current = scrollElement;
      const isHorizontal = scrollElement.scrollWidth > scrollElement.clientWidth;
      const isVertical = scrollElement.scrollHeight > scrollElement.clientHeight;

      const handleMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return;

        isDraggingRef.current = true;
        const rect = scrollElement.getBoundingClientRect();
        startXRef.current = e.clientX - rect.left;
        startYRef.current = e.clientY - rect.top;
        scrollLeftRef.current = scrollElement.scrollLeft;
        scrollTopRef.current = scrollElement.scrollTop;
        scrollElement.style.cursor = 'grabbing';
        scrollElement.style.userSelect = 'none';
        e.preventDefault();
        e.stopPropagation();
      };

      const handleMouseLeave = () => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          scrollElement.style.cursor = isHorizontal || isVertical ? 'grab' : '';
          scrollElement.style.userSelect = '';
        }
      };

      const handleMouseUp = () => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          scrollElement.style.cursor = isHorizontal || isVertical ? 'grab' : '';
          scrollElement.style.userSelect = '';
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        const rect = scrollElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const walkX = (x - startXRef.current) * 2;
        const walkY = (y - startYRef.current) * 2;

        if (isHorizontal) {
          scrollElement.scrollLeft = scrollLeftRef.current - walkX;
        }
        if (isVertical) {
          scrollElement.scrollTop = scrollTopRef.current - walkY;
        }
      };

      // Set initial cursor
      if (isHorizontal || isVertical) {
        scrollElement.style.cursor = 'grab';
      }

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

    const timeoutId = setTimeout(setupMouseDrag, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isWeb, props.children]);

  // On web, wrap in a container
  if (isWeb) {
    return (
      <View ref={containerRef} style={styles.container}>
        <ScrollView {...props} ref={scrollViewRef} />
      </View>
    );
  }

  return <ScrollView {...props} ref={scrollViewRef} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
