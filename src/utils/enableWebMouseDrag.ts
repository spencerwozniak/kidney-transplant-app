import { Platform } from 'react-native';

/**
 * Global utility to enable mouse drag scrolling for all scrollable elements on web
 * 
 * This should be called once when the app initializes on web.
 * It automatically finds and enables mouse drag scrolling for:
 * - Horizontal FlatList components
 * - Horizontal ScrollView components
 * - Any element with horizontal scrolling
 */
export const enableWebMouseDrag = () => {
  if (Platform.OS !== 'web') return;

  const setupMouseDragForElement = (element: HTMLElement) => {
    // Skip if already processed
    if ((element as any).__mouseDragEnabled) return;
    (element as any).__mouseDragEnabled = true;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e: MouseEvent) => {
      // Only handle left mouse button
      if (e.button !== 0) return;
      
      // Check if element is horizontally scrollable
      if (element.scrollWidth <= element.clientWidth) return;

      isDragging = true;
      const rect = element.getBoundingClientRect();
      startX = e.clientX - rect.left;
      scrollLeft = element.scrollLeft;
      element.style.cursor = 'grabbing';
      element.style.userSelect = 'none';
      e.preventDefault();
      e.stopPropagation();
    };

    const handleMouseLeave = () => {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = '';
        element.style.userSelect = '';
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = '';
        element.style.userSelect = '';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      element.scrollLeft = scrollLeft - walk;
    };

    // Set initial cursor style for horizontal scrollable elements
    if (element.scrollWidth > element.clientWidth) {
      element.style.cursor = 'grab';
    }

    element.addEventListener('mousedown', handleMouseDown, { passive: false });
    element.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
  };

  // Find all scrollable elements
  const findScrollableElements = (): HTMLElement[] => {
    const elements: HTMLElement[] = [];
    
    // Find all divs that might be scrollable
    const allDivs = document.querySelectorAll('div');
    
    allDivs.forEach((div) => {
      if (div instanceof HTMLElement) {
        const style = window.getComputedStyle(div);
        const overflowX = style.overflowX;
        const overflowY = style.overflowY;
        
        // Check if it's horizontally scrollable
        if (
          (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden') &&
          div.scrollWidth > div.clientWidth
        ) {
          elements.push(div);
        }
      }
    });
    
    return elements;
  };

  // Setup mouse drag for existing elements
  const setupExistingElements = () => {
    const elements = findScrollableElements();
    elements.forEach(setupMouseDragForElement);
  };

  // Use MutationObserver to watch for new scrollable elements
  const observer = new MutationObserver(() => {
    setupExistingElements();
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  });

  // Setup existing elements immediately
  // Wait a bit for React Native Web to render
  setTimeout(setupExistingElements, 500);
  setTimeout(setupExistingElements, 1000);
  setTimeout(setupExistingElements, 2000);

  // Return cleanup function
  return () => {
    observer.disconnect();
  };
};

