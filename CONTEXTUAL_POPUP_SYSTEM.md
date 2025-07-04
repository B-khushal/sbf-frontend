# Contextual Popup System

## Overview

The Contextual Popup System provides intelligent, viewport-aware popups that appear contextually near their trigger elements. Unlike traditional centered modals, these popups dynamically position themselves based on available space and automatically adjust to stay within viewport bounds.

## Key Features

### ✅ Dynamic Positioning
- **Contextual Placement**: Popups appear near the trigger element that activated them
- **Intelligent Side Selection**: Automatically chooses the best side (top, bottom, left, right) based on available space
- **Viewport Awareness**: Ensures popups never overflow outside the visible viewport
- **Scroll Position Awareness**: Accounts for current scroll position when calculating placement

### ✅ Responsive Behavior
- **Screen Size Adaptation**: Works seamlessly across all device sizes
- **Orientation Handling**: Adapts to both portrait and landscape orientations
- **Edge Case Management**: Handles scenarios where trigger elements are near viewport edges

### ✅ Smooth Interactions
- **Framer Motion Animations**: Smooth enter/exit animations with scale and opacity transitions
- **Background Scroll Prevention**: Prevents background scrolling when popup is open
- **Keyboard Navigation**: Escape key closes the popup
- **Click Outside to Close**: Clicking outside the popup area closes it

### ✅ Flexible State Management
- **Controlled Mode**: External state management for complex interactions
- **Uncontrolled Mode**: Internal state management for simple use cases
- **Customizable Behavior**: Configurable options for scroll prevention, keyboard handling, etc.

## Components

### 1. EnhancedContextualPopup
The main component that provides contextual positioning and behavior.

```tsx
<EnhancedContextualPopup
  trigger={<Button>Click me</Button>}
  variant="default"
  preventScroll={true}
  closeOnEscape={true}
  closeOnOutsideClick={true}
>
  <ContextualPopupHeader>
    <ContextualPopupTitle>Title</ContextualPopupTitle>
    <ContextualPopupDescription>Description</ContextualPopupDescription>
  </ContextualPopupHeader>
  <div>Content goes here</div>
  <ContextualPopupFooter>
    <Button>Action</Button>
  </ContextualPopupFooter>
</EnhancedContextualPopup>
```

### 2. Supporting Components
- **ContextualPopupHeader**: Container for title and description
- **ContextualPopupTitle**: Popup title (h2 element)
- **ContextualPopupDescription**: Popup description (p element)
- **ContextualPopupFooter**: Container for action buttons

## Positioning Logic

### Space Calculation
The system calculates available space in all four directions:

```typescript
const spaceBelow = viewportHeight - triggerRect.bottom;
const spaceAbove = triggerRect.top;
const spaceRight = viewportWidth - triggerRect.left;
const spaceLeft = triggerRect.right;
```

### Side Selection Priority
1. **Bottom**: Preferred when space below ≥ popup height OR space below > space above
2. **Top**: When space above ≥ popup height
3. **Right**: When space right ≥ popup width OR space right > space left
4. **Left**: When space left ≥ popup width
5. **Fallback**: Bottom with center alignment if no space available

### Position Calculation
Based on the selected side, the system calculates optimal positioning:

```typescript
// Bottom positioning
top = triggerRect.bottom + scrollY + offset;
left = triggerRect.left + scrollX + (triggerRect.width / 2) - (popupRect.width / 2);

// Top positioning
top = triggerRect.top + scrollY - popupRect.height - offset;
left = triggerRect.left + scrollX + (triggerRect.width / 2) - (popupRect.width / 2);

// Right positioning
top = triggerRect.top + scrollY + (triggerRect.height / 2) - (popupRect.height / 2);
left = triggerRect.right + scrollX + offset;

// Left positioning
top = triggerRect.top + scrollY + (triggerRect.height / 2) - (popupRect.height / 2);
left = triggerRect.left + scrollX - popupRect.width - offset;
```

### Viewport Boundary Adjustment
The system ensures popups stay within viewport bounds:

```typescript
// Horizontal bounds
if (left < scrollX) {
  left = scrollX + padding;
  align = 'start';
} else if (left + popupRect.width > scrollX + viewportWidth) {
  left = scrollX + viewportWidth - popupRect.width - padding;
  align = 'end';
}

// Vertical bounds
if (top < scrollY) {
  top = scrollY + padding;
} else if (top + popupRect.height > scrollY + viewportHeight) {
  top = scrollY + viewportHeight - popupRect.height - padding;
}
```

## Usage Examples

### Basic Info Popup
```tsx
<EnhancedContextualPopup
  trigger={<Button variant="outline">Show Info</Button>}
  variant="default"
>
  <ContextualPopupHeader>
    <ContextualPopupTitle>Information</ContextualPopupTitle>
    <ContextualPopupDescription>
      This popup appears contextually near the trigger button.
    </ContextualPopupDescription>
  </ContextualPopupHeader>
  <div className="mt-4">
    <p className="text-sm">
      The popup automatically positions itself to stay within the viewport bounds.
    </p>
  </div>
  <ContextualPopupFooter>
    <Button size="sm">Got it</Button>
  </ContextualPopupFooter>
</EnhancedContextualPopup>
```

### Settings Popup with Complex Content
```tsx
<EnhancedContextualPopup
  trigger={<Button variant="outline">Settings</Button>}
  variant="popup"
>
  <div className="p-6">
    <ContextualPopupHeader>
      <ContextualPopupTitle>Quick Settings</ContextualPopupTitle>
      <ContextualPopupDescription>
        Configure your preferences
      </ContextualPopupDescription>
    </ContextualPopupHeader>
    
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm">Notifications</span>
        <Badge variant="secondary">On</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Dark Mode</span>
        <Badge variant="outline">Off</Badge>
      </div>
    </div>

    <ContextualPopupFooter className="mt-6">
      <Button variant="outline" size="sm">Cancel</Button>
      <Button size="sm">Save Changes</Button>
    </ContextualPopupFooter>
  </div>
</EnhancedContextualPopup>
```

### Controlled State Popup
```tsx
const [isOpen, setIsOpen] = useState(false);

<EnhancedContextualPopup
  trigger={<Button variant="outline">Controlled</Button>}
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  variant="default"
>
  <ContextualPopupHeader>
    <ContextualPopupTitle>Controlled State</ContextualPopupTitle>
    <ContextualPopupDescription>
      This popup uses controlled state management.
    </ContextualPopupDescription>
  </ContextualPopupHeader>
  
  <div className="mt-4">
    <Button 
      size="sm" 
      onClick={() => setIsOpen(false)}
      className="w-full"
    >
      Close Popup
    </Button>
  </div>
</EnhancedContextualPopup>
```

## Props Reference

### EnhancedContextualPopup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `React.ReactNode` | - | The element that triggers the popup |
| `children` | `React.ReactNode` | - | The content to display in the popup |
| `isOpen` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes |
| `showCloseButton` | `boolean` | `true` | Whether to show the close button |
| `variant` | `'default' \| 'popup'` | `'default'` | Visual variant of the popup |
| `className` | `string` | - | Additional CSS classes |
| `preventScroll` | `boolean` | `true` | Whether to prevent background scrolling |
| `closeOnEscape` | `boolean` | `true` | Whether to close on Escape key |
| `closeOnOutsideClick` | `boolean` | `true` | Whether to close on outside click |
| `sideOffset` | `number` | `8` | Distance from trigger element |
| `alignOffset` | `number` | `0` | Alignment offset |

## Custom Hook: useContextualPopup

The system includes a custom hook for advanced positioning logic:

```tsx
const {
  isOpen,
  position,
  triggerRef,
  popupRef,
  open,
  close,
  toggle,
} = useContextualPopup({
  preventScroll: true,
  closeOnEscape: true,
  closeOnOutsideClick: true,
});
```

### Hook Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `preventScroll` | `boolean` | `true` | Prevent background scrolling |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `closeOnOutsideClick` | `boolean` | `true` | Close on outside click |

### Hook Return Values

| Value | Type | Description |
|-------|------|-------------|
| `isOpen` | `boolean` | Current open state |
| `position` | `PopupPosition` | Calculated position object |
| `triggerRef` | `RefObject<HTMLElement>` | Ref for trigger element |
| `popupRef` | `RefObject<HTMLElement>` | Ref for popup element |
| `open` | `() => void` | Function to open popup |
| `close` | `() => void` | Function to close popup |
| `toggle` | `() => void` | Function to toggle popup |

## Best Practices

### 1. Content Guidelines
- **Keep content concise**: Contextual popups work best with focused, quick interactions
- **Use appropriate sizing**: Let content determine popup size, but keep it reasonable
- **Provide clear actions**: Include clear call-to-action buttons in the footer

### 2. Positioning Considerations
- **Test edge cases**: Verify behavior when triggers are near viewport edges
- **Consider mobile**: Ensure popups work well on small screens
- **Account for scroll**: Test behavior when page is scrolled

### 3. Accessibility
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible
- **Screen readers**: Use semantic HTML and proper ARIA attributes
- **Focus management**: Ensure focus is properly managed when popup opens/closes

### 4. Performance
- **Minimize re-renders**: Use controlled state only when necessary
- **Optimize animations**: Keep animations smooth and performant
- **Cleanup listeners**: Ensure event listeners are properly cleaned up

## Browser Support

The contextual popup system supports:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile, etc.)

## Migration from Traditional Modals

### Before (Centered Modal)
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Information</DialogTitle>
      <DialogDescription>Modal content</DialogDescription>
    </DialogHeader>
    <div>Content</div>
  </DialogContent>
</Dialog>
```

### After (Contextual Popup)
```tsx
<EnhancedContextualPopup
  trigger={<Button>Show Info</Button>}
  isOpen={isOpen}
  onOpenChange={setIsOpen}
>
  <ContextualPopupHeader>
    <ContextualPopupTitle>Information</ContextualPopupTitle>
    <ContextualPopupDescription>Popup content</ContextualPopupDescription>
  </ContextualPopupHeader>
  <div>Content</div>
</EnhancedContextualPopup>
```

## Demo Component

A comprehensive demo component (`ContextualPopupDemo`) is included to showcase:
- Basic usage patterns
- Different variants and styles
- Controlled vs uncontrolled state
- Edge case handling
- Complex content examples

To view the demo, import and use the `ContextualPopupDemo` component in your application.

## Conclusion

The Contextual Popup System provides a modern, intelligent approach to popup positioning that enhances user experience by appearing contextually near trigger elements while ensuring optimal visibility and accessibility across all devices and screen sizes. 