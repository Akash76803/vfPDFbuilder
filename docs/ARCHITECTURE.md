# Architecture

## Core principle

The builder stores a renderer-neutral document model. Visualforce PDF is the output adapter.

## Layers

1. **Designer UI**
   - Palette
   - Absolute-positioned canvas
   - Layers tree
   - Property inspector
   - Data binding panel
   - Page settings

2. **Template Model**
   - Page
   - Elements
   - Styles
   - Bindings
   - Conditions
   - Pagination settings

3. **Data Pack Runtime**
   - Root Salesforce record
   - Parent relationships
   - Child collections
   - Derived values
   - Formula values

4. **VF-safe Renderer**
   - Converts the template model into Visualforce-compatible HTML/CSS
   - Maps element coordinates to `position:absolute`
   - Uses millimeters for X, Y, width, and height
   - Avoids unsupported modern browser CSS

5. **PDF Runtime**
   - Generic Visualforce page
   - Apex controller
   - `getContentAsPDF()`
   - Save as ContentVersion

## Absolute positioning model

All designer elements are absolute positioned.

- `x`, `y`, `width`, and `height` are stored in millimeters.
- Canvas rendering converts millimeters to pixels only for the browser preview.
- The Visualforce renderer outputs `position:absolute; left:Xmm; top:Ymm; width:Wmm; height:Hmm;`.
- There is no Flow / Fixed Header / Fixed Footer layout mode in the designer.

### Dynamic table rule

A dynamic table also has an absolute starting X/Y position. Row growth, repeated headers, overflow, and continuation onto following pages are handled by the table pagination engine rather than introducing a second layout mode.
