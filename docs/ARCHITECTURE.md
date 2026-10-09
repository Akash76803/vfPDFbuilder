# Architecture

## Core principle

The builder stores a renderer-neutral document model. Visualforce PDF is an output adapter.

## Layers

1. **Designer UI**
   - Palette
   - Canvas
   - Layers tree
   - Property inspector
   - Data binding panel
   - Page settings

2. **Template Model**
   - Page
   - Sections
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
   - Converts template model into supported HTML/CSS
   - Avoids unsupported modern browser CSS
   - Handles flow layout separately from absolute layout

5. **PDF Runtime**
   - Generic Visualforce page
   - Apex controller
   - `getContentAsPDF()`
   - Save as ContentVersion

## Layout modes

- `flow`
- `absolute`
- `fixedHeader`
- `fixedFooter`

Dynamic tables and long content should use flow mode.
