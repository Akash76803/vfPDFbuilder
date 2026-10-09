# vfPDFbuilder - Salesforce Visualforce PDF Designer

A Salesforce-native visual PDF template builder inspired by PDFDocGen.

## Goal

Design PDF templates from a Lightning Web Component UI, bind Salesforce data visually, save templates as JSON, and render final PDFs using a generic Visualforce `renderAs="pdf"` runtime.

## MVP

- LWC template designer shell
- A4 / Letter page settings
- Portrait / Landscape
- Text element
- Dynamic field element
- Image element
- Line / Rectangle
- Flow section
- Dynamic table
- Header / Footer
- Template JSON
- Save / Load template
- Record-based data binding
- Visualforce PDF preview/runtime
- ContentVersion output

## Architecture

```text
LWC Designer
    ↓
Template JSON
    ↓
PDF_Template__c
    ↓
Data Pack Resolver
    ↓
Layout Renderer
    ↓
Generic Visualforce PDF Page
    ↓
PDF
```

The template JSON is the source of truth. The designer does not generate a separate Visualforce page for every document template.

## Status

Phase 1A — Core Canvas Interaction implemented. Next: Phase 1B Designer Polish and element-specific properties.
