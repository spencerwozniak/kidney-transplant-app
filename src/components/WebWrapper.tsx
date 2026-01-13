import { Platform, View } from 'react-native';
import { ReactNode } from 'react';

/**
 * WebWrapper - Constrains the app to mobile viewport on web
 * 
 * This component wraps the entire app when running on web to ensure
 * it displays in a mobile-constrained viewport (max-width: 428px)
 * while maintaining the mobile experience on actual devices.
 */
export const WebWrapper = ({ children }: { children: ReactNode }) => {
  // Only apply web constraints on web platform
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#f5f5f5',
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 428, // Standard mobile width (iPhone 14 Pro Max)
          minHeight: '100vh',
          backgroundColor: 'transparent',
          // Ensure proper overflow handling
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {children}
      </View>
    </View>
  );
};

