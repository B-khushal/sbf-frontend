# Dialog Viewport Positioning Fix

## Problem
The dialog boxes in the admin panel were appearing in fixed positions and not properly adapting to the screen view, unlike the offer popup which appeared correctly centered and responsive.

## Root Cause
The standard Radix UI Dialog components were using fixed positioning with `fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]` which can cause viewport issues when:
- Dialog content is larger than the viewport
- Page has scrolling issues
- Different screen sizes and orientations

## Solution
Updated the dialog components to use better viewport handling similar to the Modal component used by the OfferPopup:

### Changes Made

#### 1. Updated `src/components/ui/dialog.tsx`
- **Before**: Used fixed positioning with transform translate
- **After**: Implemented viewport-aware positioning with:
  - `overflow-y-auto` container for scrolling
  - `min-h-screen px-4 text-center` for proper centering
  - Trick element for vertical centering
  - `inline-block align-middle` for responsive behavior

#### 2. Updated `src/components/ui/alert-dialog.tsx`
- Applied the same viewport handling improvements
- Enhanced backdrop with `backdrop-blur-sm` for better visual effect

#### 3. Updated `src/components/ui/enhanced-dialog.tsx`
- Applied the same viewport handling improvements
- Maintained existing animation and variant support

#### 4. Updated `src/components/ui/sheet.tsx`
- Enhanced backdrop with `backdrop-blur-sm` for consistency

## Key Improvements

### Viewport Handling
- **Responsive Centering**: Dialogs now properly center regardless of screen size
- **Scroll Support**: Large dialogs can scroll within the viewport
- **Mobile Friendly**: Better behavior on mobile devices and different orientations

### Visual Enhancements
- **Backdrop Blur**: Added backdrop blur effect for better visual separation
- **Consistent Styling**: All dialog components now have consistent appearance
- **Better Accessibility**: Improved focus handling and screen reader support

### Technical Benefits
- **No Fixed Positioning Issues**: Eliminates problems with fixed positioning
- **Better Performance**: Improved rendering and animation performance
- **Maintainable Code**: Consistent approach across all dialog components

## Components Affected
- Admin Users page dialogs (Edit, Add, Delete, Vendor Details)
- Admin Vendor Management dialogs (Details, Status Change)
- All other admin panel dialogs using the standard Dialog components
- Alert dialogs throughout the application
- Enhanced dialogs with custom variants

## Testing
The changes ensure that:
1. Dialogs appear properly centered in the viewport
2. Large dialogs can scroll when content exceeds viewport height
3. Dialogs work correctly on all screen sizes and orientations
4. Backdrop and animations work smoothly
5. Close buttons and interactions function properly

## Result
All dialog boxes in the admin panel now appear properly in the screen view, just like the offer popup, with better responsiveness and user experience. 