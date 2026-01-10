# Styles Documentation

This directory contains centralized style definitions for the application, ensuring consistency across all components.

## Usage

### Import Styles

```typescript
import { buttons, cards, typography, colors, combineClasses } from 'styles/theme';
```

### Button Examples

```typescript
// Primary Button
<TouchableOpacity
  className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
  activeOpacity={0.8}>
  <Text className={buttons.primary.text}>Click Me</Text>
</TouchableOpacity>

// Using Helper Function
const buttonStyles = getButtonClasses('primary', 'enabled');
<TouchableOpacity className={buttonStyles.container} activeOpacity={0.8}>
  <Text className={buttonStyles.text}>Click Me</Text>
</TouchableOpacity>

// Outline Button
<TouchableOpacity
  className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
  activeOpacity={0.8}>
  <Text className={buttons.outline.text}>Cancel</Text>
</TouchableOpacity>
```

### Card Examples

```typescript
// Default Card
<View className={cards.default.container}>
  <Text>Card Content</Text>
</View>

// Colored Card (Warning)
<View className={cards.colored.amber}>
  <Text className="text-amber-900">Warning Message</Text>
</View>

// Using Helper Function
<View className={getCardClasses('green')}>
  <Text>Success Message</Text>
</View>
```

### Typography Examples

```typescript
// Headings
<Text className={typography.h1}>Main Title</Text>
<Text className={typography.h3}>Section Title</Text>

// Body Text
<Text className={typography.body.medium}>Regular text content</Text>
<Text className={typography.body.small}>Smaller text</Text>

// Links
<Text className={typography.link}>Click here</Text>
```

### Badge Examples

```typescript
// Using Direct Styles
<View className={badges.absolute.container}>
  <Text className={badges.absolute.text}>Absolute</Text>
</View>

// Using Helper Function
const badgeStyles = getBadgeClasses('relative');
<View className={badgeStyles.container}>
  <Text className={badgeStyles.text}>Relative</Text>
</View>
```

### Input Examples

```typescript
<View className={inputs.default.container}>
  <TextInput
    className={inputs.default.input}
    placeholder="Enter text"
    placeholderTextColor={inputs.default.placeholder}
  />
</View>
```

### Progress Bar Examples

```typescript
<View className={progress.container}>
  <View className={combineClasses(progress.bar.primary)} style={{ width: '50%' }} />
</View>
```

### Divider Examples

```typescript
<View className={dividers.full.container}>
  <View className={dividers.horizontal.default} />
  <View className={dividers.dot.container}>
    <View className={dividers.dot.dot} />
  </View>
  <View className={dividers.horizontal.default} />
</View>
```

## Color Palette

All colors are defined in the `colors` object:

- `colors.primary.*` - Green shades (50-900)
- `colors.secondary.*` - Orange shades (50-900)
- `colors.success.*` - Success states
- `colors.warning.*` - Warning states
- `colors.error.*` - Error states
- `colors.neutral.*` - Gray shades

## Helper Functions

### `combineClasses(...classes)`

Combines multiple class strings, filtering out falsy values:

```typescript
const classes = combineClasses(
  'flex-1',
  isActive && 'bg-green-500',
  'px-4'
);
```

### `getButtonClasses(variant, state)`

Returns button container and text classes:

```typescript
const { container, text } = getButtonClasses('primary', 'enabled');
```

### `getCardClasses(variant)`

Returns card container classes:

```typescript
const cardClass = getCardClasses('green');
```

### `getBadgeClasses(type)`

Returns badge container and text classes:

```typescript
const { container, text } = getBadgeClasses('absolute');
```

## Best Practices

1. **Always use predefined styles** - Don't create inline styles when a predefined style exists
2. **Use helper functions** - They provide type safety and consistency
3. **Combine classes carefully** - Use `combineClasses()` for dynamic class combinations
4. **Follow the color palette** - Use colors from the `colors` object, not arbitrary values
5. **Maintain consistency** - If you need a new style, add it to this file first

