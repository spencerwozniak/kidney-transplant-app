import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

type PathwayBackgroundProps = {
  opacity?: number;
  onAnimationComplete?: () => void;
  animate?: boolean;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PathwayBackground = ({
  opacity = 0.15,
  onAnimationComplete,
  animate = true,
}: PathwayBackgroundProps) => {
  // Create animated values for each path
  // Start with 0.01 instead of 0 on web to ensure paths are in DOM
  const initialOpacity = Platform.OS === 'web' && animate ? 0.01 : (animate ? 0 : 1);
  const pathAnimations = useRef(Array.from({ length: 44 }, () => new Animated.Value(initialOpacity))).current;
  const [pathOpacities, setPathOpacities] = useState<number[]>(
    animate ? Array(44).fill(initialOpacity) : Array(44).fill(1)
  );

  // Exact SVG paths from path-longer.svg
  // Original viewBox: 0 0 588.000000 921.000000
  // Transform: translate(0.000000,921.000000) scale(0.100000,-0.100000)
  //
  // IMPORTANT: Paths will animate in the order they appear in this array.
  // Reorder the paths below to control the animation sequence.
  // Animation starts from index 0 and proceeds sequentially.

  // Paths ordered according to manually corrected HTML order
  // Animation sequence follows this order
  const paths = [
    // Circle
    `M760 1444 c-198 -42 -368 -198 -437 -399 -24 -69 -28 -95 -27 -190 0
-93 5 -122 27 -188 83 -240 281 -394 528 -413 186 -14 340 43 469 174 93 95
119 141 174 307 40 118 42 133 30 156 -7 15 -22 59 -33 98 -54 194 -169 337
-335 415 -115 54 -261 69 -396 40z m333 -172 c85 -39 180 -132 222 -217 29
-58 30 -65 30 -195 0 -133 -1 -137 -33 -203 -47 -95 -122 -168 -219 -215 -77
-36 -80 -37 -198 -37 -116 0 -123 1 -187 33 -170 84 -268 238 -268 422 1 126
41 227 124 314 100 103 192 137 356 133 94 -2 112 -6 173 -35z`,
    // Arrow
    `M910 1080 c-27 -27 -27 -87 1 -117 28 -29 25 -30 -135 -37 -145 -6
-166 -15 -166 -72 0 -56 31 -68 187 -72 l133 -4 -20 -28 c-38 -54 -13 -140 40
-140 25 0 215 185 229 223 8 22 8 35 -4 57 -35 68 -192 210 -232 210 -7 0 -22
-9 -33 -20z`,
    // Path
    `M1896 920 c-89 -17 -90 -110 -1 -130 141 -33 252 19 210 99 -11 23
-23 29 -61 35 -56 7 -95 6 -148 -4z`,
    `M2476 920 c-59 -11 -78 -44 -55 -94 20 -43 153 -61 224 -32 69 29 69
112 0 127 -41 9 -121 8 -169 -1z`,
    `M3060 921 c-53 -11 -60 -18 -60 -61 0 -59 30 -75 141 -75 79 0 90 2
113 24 30 29 33 60 8 90 -14 18 -30 23 -92 26 -41 2 -91 1 -110 -4z`,
    `M3636 921 c-44 -9 -56 -23 -56 -68 0 -41 29 -61 98 -70 108 -12 182
18 182 76 0 45 -28 62 -112 66 -40 2 -90 0 -112 -4z`,
    `M4230 923 c-44 -6 -70 -29 -70 -63 0 -38 20 -60 65 -70 97 -23 197
-3 214 42 10 28 -5 74 -27 83 -23 9 -139 14 -182 8z`,
    `M4858 935 c-36 -7 -76 -18 -87 -25 -26 -13 -35 -48 -22 -83 10 -25
17 -28 84 -42 9 -2 47 3 84 11 109 23 144 76 82 128 -34 29 -45 30 -141 11z`,
    `M5348 1288 c-26 -22 -89 -136 -95 -173 -12 -71 62 -102 116 -47 35
34 77 108 85 148 13 60 -59 109 -106 72z`,
    // Circle
    `M5052 2279 c-30 -12 -77 -44 -111 -75 -47 -43 -65 -54 -93 -54 -89 0
-110 -94 -31 -139 12 -6 19 -29 24 -75 12 -120 91 -236 196 -288 40 -19 64
-23 143 -23 52 0 108 2 125 5 24 4 31 1 43 -23 30 -61 94 -71 128 -20 15 24
15 30 0 87 l-17 62 31 78 c29 72 32 87 28 165 -4 106 -22 146 -98 221 -76 76
-115 93 -225 97 -73 3 -100 -1 -143 -18z m231 -146 c50 -30 87 -91 93 -154 5
-46 1 -62 -23 -109 -35 -69 -89 -100 -173 -100 -67 0 -113 22 -153 72 -53 66
-50 181 6 245 64 73 170 92 250 46z`,
    // Path
    `M4213 2140 c-19 -8 -23 -17 -23 -54 0 -64 26 -80 131 -80 101 0 134
20 134 80 0 31 -5 41 -25 51 -29 15 -183 16 -217 3z`,
    `M3619 2129 c-26 -26 -20 -75 13 -103 20 -15 36 -18 115 -14 106 5
133 19 133 74 0 52 -27 64 -142 64 -86 0 -101 -3 -119 -21z`,
    `M3042 2134 c-31 -21 -29 -68 4 -101 24 -24 29 -25 119 -21 109 5 135
19 135 74 0 52 -27 64 -140 64 -70 0 -101 -4 -118 -16z`,
    `M2470 2143 c-22 -9 -30 -24 -30 -60 0 -52 37 -73 127 -73 117 0 165
31 149 96 -4 14 -18 29 -32 34 -27 11 -189 12 -214 3z`,
    `M1883 2140 c-18 -7 -23 -17 -23 -48 0 -63 17 -76 102 -80 96 -5 156
11 168 44 14 36 2 74 -27 85 -31 11 -191 11 -220 -1z`,
    `M1303 2165 c-25 -18 -37 -59 -24 -84 15 -27 69 -49 146 -60 75 -11
105 -3 125 34 28 52 -14 91 -117 111 -88 17 -104 17 -130 -1z`,
    `M881 2533 c-24 -30 -23 -41 20 -130 45 -94 95 -124 147 -87 30 21 28
62 -4 127 -45 90 -71 117 -109 117 -24 0 -39 -7 -54 -27z`,
    // Circle
    `M1100 3581 c-97 -32 -178 -105 -223 -199 -28 -59 -29 -70 -25 -147 4
-58 13 -99 30 -136 l24 -54 -25 -63 -25 -62 20 -27 c11 -15 33 -30 48 -34 23
-7 34 -3 56 19 15 15 29 34 32 42 4 12 18 11 102 -5 93 -17 100 -17 159 -1
155 43 240 146 263 317 l7 49 81 0 c99 0 118 11 118 64 0 61 -17 70 -141 76
l-109 5 -48 52 c-67 71 -144 106 -244 110 -41 1 -86 -1 -100 -6z m187 -163
c103 -62 132 -192 63 -287 -36 -50 -76 -71 -145 -78 -66 -7 -132 22 -173 75
-24 32 -27 44 -27 118 0 68 4 87 21 110 64 87 177 114 261 62z`,
    // Path
    `M2100 3413 c-47 -18 -68 -85 -35 -113 17 -14 179 -26 219 -16 14 3
30 15 36 27 16 29 -4 83 -36 98 -25 11 -156 14 -184 4z`,
    `M2672 3410 c-31 -13 -48 -54 -36 -88 11 -32 36 -39 150 -41 66 -1 86
3 105 18 21 17 22 23 14 57 -7 25 -19 43 -35 51 -29 15 -164 16 -198 3z`,
    `M3248 3404 c-55 -29 -49 -97 10 -114 58 -16 184 -13 210 6 30 21 29
68 -3 99 -22 23 -32 25 -107 25 -54 -1 -93 -6 -110 -16z`,
    `M3833 3408 c-12 -6 -27 -23 -33 -39 -16 -38 6 -74 51 -83 48 -9 164
-7 193 4 22 8 26 16 26 49 0 62 -32 81 -134 80 -44 0 -91 -5 -103 -11z`,
    `M4404 3397 c-17 -15 -26 -33 -26 -51 0 -48 21 -58 130 -64 121 -6
142 3 142 56 0 66 -27 82 -139 82 -69 0 -84 -3 -107 -23z`,
    `M5064 3480 c-43 -22 -86 -47 -96 -56 -42 -39 -6 -104 58 -104 35 0
143 47 177 77 27 25 22 67 -14 97 -17 14 -34 26 -39 26 -5 0 -44 -18 -86 -40z`,
    `M5414 3989 c-32 -11 -40 -29 -59 -125 -13 -72 -14 -96 -5 -113 25
-47 93 -46 123 1 17 26 37 114 37 161 0 59 -46 95 -96 76z`,
    // Circle
    `M5052 4889 c-30 -12 -77 -44 -111 -75 -47 -43 -65 -54 -93 -54 -89 0
-110 -94 -31 -139 12 -6 19 -29 24 -75 12 -120 91 -236 196 -288 40 -19 64
-23 143 -23 52 0 108 2 125 5 24 4 31 1 43 -23 30 -61 94 -71 128 -20 15 24
15 30 0 87 l-17 62 31 78 c29 72 32 87 28 165 -4 106 -22 146 -98 221 -76 76
-115 93 -225 97 -73 3 -100 -1 -143 -18z m231 -146 c50 -30 87 -91 93 -154 5
-46 1 -62 -23 -109 -35 -69 -89 -100 -173 -100 -67 0 -113 22 -153 72 -53 66
-50 181 6 245 64 73 170 92 250 46z`,
    // Path
    `M4213 4750 c-19 -8 -23 -17 -23 -54 0 -64 26 -80 131 -80 101 0 134
20 134 80 0 31 -5 41 -25 51 -29 15 -183 16 -217 3z`,
    `M3619 4739 c-26 -26 -20 -75 13 -103 20 -15 36 -18 115 -14 106 5
133 19 133 74 0 52 -27 64 -142 64 -86 0 -101 -3 -119 -21z`,
    `M2470 4753 c-22 -9 -30 -24 -30 -60 0 -52 37 -73 127 -73 117 0 165
31 149 96 -4 14 -18 29 -32 34 -27 11 -189 12 -214 3z`,
    `M3042 4744 c-31 -21 -29 -68 4 -101 24 -24 29 -25 119 -21 109 5 135
19 135 74 0 52 -27 64 -140 64 -70 0 -101 -4 -118 -16z`,
    `M1883 4750 c-18 -7 -23 -17 -23 -48 0 -63 17 -76 102 -80 96 -5 156
11 168 44 14 36 2 74 -27 85 -31 11 -191 11 -220 -1z`,
    `M1303 4775 c-25 -18 -37 -59 -24 -84 15 -27 69 -49 146 -60 75 -11
105 -3 125 34 28 52 -14 91 -117 111 -88 17 -104 17 -130 -1z`,
    `M881 5143 c-24 -30 -23 -41 20 -130 45 -94 95 -124 147 -87 30 21 28
62 -4 127 -45 90 -71 117 -109 117 -24 0 -39 -7 -54 -27z`,
    // Circle
    `M1100 6191 c-97 -32 -178 -105 -223 -199 -28 -59 -29 -70 -25 -147 4
-58 13 -99 30 -136 l24 -54 -25 -63 -25 -62 20 -27 c11 -15 33 -30 48 -34 23
-7 34 -3 56 19 15 15 29 34 32 42 4 12 18 11 102 -5 93 -17 100 -17 159 -1
155 43 240 146 263 317 l7 49 81 0 c99 0 118 11 118 64 0 61 -17 70 -141 76
l-109 5 -48 52 c-67 71 -144 106 -244 110 -41 1 -86 -1 -100 -6z m187 -163
c103 -62 132 -192 63 -287 -36 -50 -76 -71 -145 -78 -66 -7 -132 22 -173 75
-24 32 -27 44 -27 118 0 68 4 87 21 110 64 87 177 114 261 62z`,
    // Path
    `M2100 6023 c-47 -18 -68 -85 -35 -113 17 -14 179 -26 219 -16 14 3
30 15 36 27 16 29 -4 83 -36 98 -25 11 -156 14 -184 4z`,
    `M2672 6020 c-31 -13 -48 -54 -36 -88 11 -32 36 -39 150 -41 66 -1 86
3 105 18 21 17 22 23 14 57 -7 25 -19 43 -35 51 -29 15 -164 16 -198 3z`,
    `M3248 6014 c-55 -29 -49 -97 10 -114 58 -16 184 -13 210 6 30 21 29
68 -3 99 -22 23 -32 25 -107 25 -54 -1 -93 -6 -110 -16z`,
    `M3833 6018 c-12 -6 -27 -23 -33 -39 -16 -38 6 -74 51 -83 48 -9 164
-7 193 4 22 8 26 16 26 49 0 62 -32 81 -134 80 -44 0 -91 -5 -103 -11z`,
    `M4404 6007 c-17 -15 -26 -33 -26 -51 0 -48 21 -58 130 -64 121 -6
142 3 142 56 0 66 -27 82 -139 82 -69 0 -84 -3 -107 -23z`,
    `M5064 6090 c-43 -22 -86 -47 -96 -56 -42 -39 -6 -104 58 -104 35 0
143 47 177 77 27 25 22 67 -14 97 -17 14 -34 26 -39 26 -5 0 -44 -18 -86 -40z`,
    `M5414 6599 c-32 -11 -40 -29 -59 -125 -13 -72 -14 -96 -5 -113 25
-47 93 -46 123 1 17 26 37 114 37 161 0 59 -46 95 -96 76z`,
    `M5180 7060 c-33 -33 -25 -64 33 -132 67 -79 109 -105 143 -89 13 6
29 22 35 35 16 34 -18 101 -81 160 -55 52 -96 60 -130 26z`,
    `M4645 7225 c-30 -29 -32 -68 -6 -94 30 -30 123 -37 227 -16 18 4 44
41 44 65 0 5 -14 22 -31 39 -30 30 -33 31 -120 31 -82 0 -92 -2 -114 -25z`,
    // Flag
    `M3985 8961 c-108 -50 -154 -174 -104 -278 12 -24 43 -62 70 -85 33
-28 49 -49 49 -65 l0 -23 -409 0 c-228 0 -421 -4 -434 -9 -14 -6 -27 -21 -31
-36 -4 -14 -7 -191 -6 -393 0 -355 0 -367 20 -387 20 -19 34 -20 440 -23 l420
-4 0 -103 0 -104 -47 -6 c-93 -13 -94 -16 -91 -173 l3 -137 30 -14 c21 -10 79
-16 196 -19 177 -5 196 -1 225 43 14 21 14 26 -1 56 -10 18 -20 67 -23 111 -6
100 -22 123 -92 132 l-50 7 0 554 0 554 41 33 c23 18 53 53 67 78 47 80 30
192 -40 257 -57 53 -159 68 -233 34z m127 -141 c35 -27 40 -55 16 -85 -26 -34
-76 -34 -107 -1 -27 29 -22 56 16 86 32 25 44 25 75 0z m-112 -730 l0 -280
-370 0 -370 0 0 280 0 280 370 0 370 0 0 -280z m134 -796 c9 -3 16 -12 16 -19
0 -18 -23 -25 -85 -25 -55 0 -71 10 -61 35 6 16 97 21 130 9z`,
  ];

  // Store callback in ref to prevent re-running effect when it changes
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  // Animate paths sequentially in the order they appear in the paths array
  useEffect(() => {
    // If animation is disabled, show all paths immediately and call callback
    if (!animate) {
      setPathOpacities(Array(44).fill(1));
      onAnimationCompleteRef.current?.();
      return;
    }

    // Update opacities as animations progress
    // Store listener IDs and their corresponding animations for cleanup
    const listenerData: Array<{ anim: Animated.Value; listenerId: string }> = [];
    
    pathAnimations.forEach((anim, index) => {
      const listenerId = anim.addListener(({ value }) => {
        setPathOpacities((prev) => {
          // Only update if value actually changed (prevents unnecessary re-renders)
          if (Math.abs(prev[index] - value) < 0.001) {
            return prev;
          }
          const newOpacities = [...prev];
          newOpacities[index] = value;
          return newOpacities;
        });
      });
      listenerData.push({ anim, listenerId });
    });

    // Create animations for each path in array order (index 0, 1, 2, ...)
    const animations = pathAnimations.map((anim) => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 400, // Duration for each path to appear
        useNativeDriver: false, // SVG opacity doesn't support native driver
      });
    });
    
    // On web, ensure initial state is set
    if (Platform.OS === 'web') {
      setPathOpacities(Array(44).fill(initialOpacity));
    }

    // Start all animations with stagger - each path appears 100ms after the previous
    // Paths animate in the order they appear in the paths array above
    // Total animation time: (paths.length * staggerDelay) + duration
    // = (44 * 100) + 400 = 4800ms
    Animated.stagger(100, animations).start(() => {
      // Callback when all path animations complete
      onAnimationCompleteRef.current?.();
    });

    // Cleanup listeners on unmount
    return () => {
      listenerData.forEach(({ anim, listenerId }) => {
        anim.removeListener(listenerId);
      });
    };
  }, [animate, initialOpacity]);

  return (
    <View 
      style={[
        StyleSheet.absoluteFill, 
        Platform.OS === 'web' && {
          width: '100%',
          height: '100%',
          zIndex: 0,
          position: 'absolute',
        }
      ]} 
      pointerEvents="none">
      <Svg
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        viewBox="0 0 588 921"
        style={styles.svg}
        preserveAspectRatio="xMidYMid meet">
        <G opacity={opacity} transform={`translate(0,921) scale(0.1,-0.1)`}>
          {paths.map((pathData: string, index: number) => {
            const pathOpacity = pathOpacities[index];
            return (
              <Path
                key={`path-${index}`}
                d={pathData}
                fill="#ffffff"
                stroke="none"
                opacity={pathOpacity}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    ...(Platform.OS === 'web' && {
      width: '100%',
      height: '100%',
      zIndex: 0,
    }),
  },
});
