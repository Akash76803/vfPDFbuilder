import { LightningElement } from 'lwc';

const MM_TO_PX = 96 / 25.4;
const MIN_SIZE_MM = 2;
const HISTORY_LIMIT = 50;

const PAGE_SIZES = {
    A4: { width: 210, height: 297 },
    LETTER: { width: 215.9, height: 279.4 }
};

const PALETTE = [
    { type: 'text', label: 'Text', icon: 'utility:text' },
    { type: 'field', label: 'Dynamic Field', icon: 'utility:merge_field' },
    { type: 'image', label: 'Image', icon: 'utility:image' },
    { type: 'line', label: 'Line', icon: 'utility:dash' },
    { type: 'rectangle', label: 'Rectangle', icon: 'utility:stop' },
    { type: 'table', label: 'Dynamic Table', icon: 'utility:table' },
    { type: 'section', label: 'Section', icon: 'utility:section' }
];

const DEFAULTS = {
    text: { width: 55, height: 10, value: 'Text', fontSize: 12 },
    field: { width: 65, height: 10, value: '{{record.Name}}', fontSize: 11 },
    image: { width: 35, height: 25, value: 'Image', fontSize: 10 },
    line: { width: 70, height: 2, value: '', fontSize: 10 },
    rectangle: { width: 55, height: 25, value: '', fontSize: 10 },
    table: { width: 150, height: 45, value: 'Dynamic Table', fontSize: 10 },
    section: { width: 170, height: 30, value: 'Section', fontSize: 10 }
};

export default class PdfTemplateDesigner extends LightningElement {
    paletteItems = PALETTE;
    elements = [];
    selectedElementId;
    pageSize = 'A4';
    orientation = 'portrait';
    zoomPercent = 90;
    activeBottomTab = 'layers';

    history = [];
    future = [];
    interaction;

    connectedCallback() {
        this.pushHistory();
    }

    get pageSizeOptions() {
        return [
            { label: 'A4', value: 'A4' },
            { label: 'Letter', value: 'LETTER' }
        ];
    }

    get orientationOptions() {
        return [
            { label: 'Portrait', value: 'portrait' },
            { label: 'Landscape', value: 'landscape' }
        ];
    }

    get layoutModeOptions() {
        return [
            { label: 'Absolute', value: 'absolute' },
            { label: 'Flow', value: 'flow' },
            { label: 'Fixed Header', value: 'fixedHeader' },
            { label: 'Fixed Footer', value: 'fixedFooter' }
        ];
    }

    get textAlignOptions() {
        return [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' }
        ];
    }

    get pageDimensions() {
        const base = PAGE_SIZES[this.pageSize] || PAGE_SIZES.A4;
        return this.orientation === 'landscape'
            ? { width: base.height, height: base.width }
            : { width: base.width, height: base.height };
    }

    get pageStyle() {
        const { width, height } = this.pageDimensions;
        const scale = this.zoomPercent / 100;
        return `width:${width * MM_TO_PX}px;height:${height * MM_TO_PX}px;transform:scale(${scale});`;
    }

    get zoomStageStyle() {
        const scale = this.zoomPercent / 100;
        const { width, height } = this.pageDimensions;
        return `width:${width * MM_TO_PX * scale}px;height:${height * MM_TO_PX * scale}px;`;
    }

    get marginGuideStyle() {
        const margin = 15 * MM_TO_PX;
        return `top:${margin}px;right:${margin}px;bottom:${margin}px;left:${margin}px;`;
    }

    get hasElements() {
        return this.elements.length > 0;
    }

    get elementCount() {
        return this.elements.length;
    }

    get selectedElement() {
        return this.elements.find((item) => item.id === this.selectedElementId);
    }

    get selectedElementName() {
        return this.selectedElement ? this.selectedElement.label : 'None';
    }

    get selectedSupportsText() {
        return ['text', 'field', 'table', 'section'].includes(this.selectedElement?.type);
    }

    get disableSelectionActions() {
        return !this.selectedElementId;
    }

    get disableUndo() {
        return this.history.length <= 1;
    }

    get disableRedo() {
        return this.future.length === 0;
    }

    get layerItems() {
        return [...this.elements].reverse().map((item) => ({
            ...item,
            typeLabel: item.type.toUpperCase(),
            layerClass: item.id === this.selectedElementId ? 'layer-item selected-layer' : 'layer-item'
        }));
    }

    get renderElements() {
        return this.elements.map((item) => {
            const selected = item.id === this.selectedElementId;
            const border = item.type === 'rectangle' ? 'border:1px solid #444;' : '';
            const background = item.type === 'section' ? 'background:rgba(1,118,211,.04);' : '';
            const lineStyle = item.type === 'line' ? 'border-top:1px solid #444;height:0;' : '';
            const displayText = item.type === 'line' || item.type === 'rectangle' ? '' : item.value || item.label;
            const fontWeight = item.bold ? '700' : '400';
            const fontStyle = item.italic ? 'italic' : 'normal';

            return {
                ...item,
                selected,
                displayText,
                cssClass: selected ? `canvas-element type-${item.type} selected` : `canvas-element type-${item.type}`,
                style:
                    `left:${item.x * MM_TO_PX}px;top:${item.y * MM_TO_PX}px;` +
                    `width:${item.width * MM_TO_PX}px;height:${item.height * MM_TO_PX}px;` +
                    `font-size:${item.fontSize}px;font-weight:${fontWeight};font-style:${fontStyle};` +
                    `text-align:${item.textAlign};${border}${background}${lineStyle}`
            };
        });
    }

    get templateModel() {
        return {
            schemaVersion: '0.2',
            page: {
                size: this.pageSize,
                orientation: this.orientation,
                unit: 'mm',
                margin: { top: 15, right: 15, bottom: 15, left: 15 }
            },
            elements: this.elements.map((item) => ({ ...item }))
        };
    }

    get templateJson() {
        return JSON.stringify(this.templateModel, null, 2);
    }

    get showBottomJson() {
        return this.activeBottomTab === 'json';
    }

    get showBottomLayers() {
        return this.activeBottomTab === 'layers';
    }

    get jsonTabClass() {
        return this.activeBottomTab === 'json' ? 'bottom-tab active' : 'bottom-tab';
    }

    get layersTabClass() {
        return this.activeBottomTab === 'layers' ? 'bottom-tab active' : 'bottom-tab';
    }

    handleAddElement(event) {
        const type = event.currentTarget.dataset.type;
        const palette = PALETTE.find((item) => item.type === type);
        const defaults = DEFAULTS[type] || DEFAULTS.text;
        const offset = (this.elements.length % 8) * 4;
        const id = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const element = {
            id,
            type,
            label: palette.label,
            layoutMode: 'absolute',
            x: 20 + offset,
            y: 20 + offset,
            width: defaults.width,
            height: defaults.height,
            value: defaults.value,
            fontSize: defaults.fontSize,
            textAlign: 'left',
            bold: false,
            italic: false
        };

        this.elements = [...this.elements, element];
        this.selectedElementId = id;
        this.commitChange();
    }

    handleElementClick(event) {
        event.stopPropagation();
        this.selectedElementId = event.currentTarget.dataset.id;
    }

    handleLayerSelect(event) {
        this.selectedElementId = event.currentTarget.dataset.id;
    }

    handleCanvasClick(event) {
        if (event.target.classList.contains('page') || event.target.classList.contains('page-margin-guide')) {
            this.selectedElementId = undefined;
        }
    }

    handleCanvasKeydown(event) {
        if (!this.selectedElementId) {
            return;
        }
        if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault();
            this.handleDelete();
        }
    }

    handleElementPointerDown(event) {
        if (event.target.dataset.handle) {
            return;
        }
        event.stopPropagation();
        const id = event.currentTarget.dataset.id;
        this.selectedElementId = id;
        const element = this.elements.find((item) => item.id === id);
        if (!element || element.layoutMode !== 'absolute') {
            return;
        }
        this.interaction = {
            type: 'move',
            id,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startElement: { ...element }
        };
        event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    handleResizePointerDown(event) {
        event.stopPropagation();
        const id = event.currentTarget.dataset.id;
        const handle = event.currentTarget.dataset.handle;
        const element = this.elements.find((item) => item.id === id);
        if (!element) {
            return;
        }
        this.selectedElementId = id;
        this.interaction = {
            type: 'resize',
            handle,
            id,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startElement: { ...element }
        };
        event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    handlePointerMove(event) {
        if (!this.interaction) {
            return;
        }

        const scale = this.zoomPercent / 100;
        const dxMm = (event.clientX - this.interaction.startClientX) / MM_TO_PX / scale;
        const dyMm = (event.clientY - this.interaction.startClientY) / MM_TO_PX / scale;
        const start = this.interaction.startElement;
        const page = this.pageDimensions;
        let patch = {};

        if (this.interaction.type === 'move') {
            patch = {
                x: this.clamp(this.roundHalf(start.x + dxMm), 0, page.width - start.width),
                y: this.clamp(this.roundHalf(start.y + dyMm), 0, page.height - start.height)
            };
        } else {
            let x = start.x;
            let y = start.y;
            let width = start.width;
            let height = start.height;
            const handle = this.interaction.handle;

            if (handle.includes('e')) {
                width = Math.max(MIN_SIZE_MM, start.width + dxMm);
            }
            if (handle.includes('s')) {
                height = Math.max(MIN_SIZE_MM, start.height + dyMm);
            }
            if (handle.includes('w')) {
                const proposedX = start.x + dxMm;
                const maxX = start.x + start.width - MIN_SIZE_MM;
                x = this.clamp(proposedX, 0, maxX);
                width = start.width + (start.x - x);
            }
            if (handle.includes('n')) {
                const proposedY = start.y + dyMm;
                const maxY = start.y + start.height - MIN_SIZE_MM;
                y = this.clamp(proposedY, 0, maxY);
                height = start.height + (start.y - y);
            }

            width = Math.min(width, page.width - x);
            height = Math.min(height, page.height - y);
            patch = {
                x: this.roundHalf(x),
                y: this.roundHalf(y),
                width: this.roundHalf(width),
                height: this.roundHalf(height)
            };
        }

        this.patchElement(this.interaction.id, patch, false);
    }

    handlePointerUp() {
        if (!this.interaction) {
            return;
        }
        this.interaction = undefined;
        this.commitChange();
    }

    handleTextPropertyChange(event) {
        this.patchSelected({ [event.currentTarget.dataset.field]: event.target.value });
    }

    handleSelectPropertyChange(event) {
        this.patchSelected({ [event.currentTarget.dataset.field]: event.detail.value });
    }

    handleNumberPropertyChange(event) {
        const field = event.currentTarget.dataset.field;
        const raw = Number(event.target.value);
        if (!Number.isFinite(raw)) {
            return;
        }
        const page = this.pageDimensions;
        let value = this.roundHalf(raw);
        if (field === 'width' || field === 'height') {
            value = Math.max(MIN_SIZE_MM, value);
        }
        if (field === 'x') {
            value = this.clamp(value, 0, page.width - (this.selectedElement?.width || 0));
        }
        if (field === 'y') {
            value = this.clamp(value, 0, page.height - (this.selectedElement?.height || 0));
        }
        this.patchSelected({ [field]: value });
    }

    handleBooleanPropertyChange(event) {
        this.patchSelected({ [event.currentTarget.dataset.field]: event.target.checked });
    }

    handlePageSizeChange(event) {
        this.pageSize = event.detail.value;
        this.fitElementsToPage();
        this.commitChange();
    }

    handleOrientationChange(event) {
        this.orientation = event.detail.value;
        this.fitElementsToPage();
        this.commitChange();
    }

    handleZoomChange(event) {
        const value = Number(event.detail.value);
        this.zoomPercent = this.clamp(Number.isFinite(value) ? value : 90, 50, 150);
    }

    handleBottomTab(event) {
        this.activeBottomTab = event.currentTarget.dataset.tab;
    }

    handleDelete() {
        if (!this.selectedElementId) {
            return;
        }
        this.elements = this.elements.filter((item) => item.id !== this.selectedElementId);
        this.selectedElementId = undefined;
        this.commitChange();
    }

    handleDuplicate() {
        const source = this.selectedElement;
        if (!source) {
            return;
        }
        const id = `${source.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const copy = {
            ...source,
            id,
            label: `${source.label} Copy`,
            x: this.roundHalf(source.x + 5),
            y: this.roundHalf(source.y + 5)
        };
        this.elements = [...this.elements, copy];
        this.selectedElementId = id;
        this.fitElementsToPage();
        this.commitChange();
    }

    handleUndo() {
        if (this.history.length <= 1) {
            return;
        }
        const current = this.history.pop();
        this.future = [current, ...this.future];
        this.restoreSnapshot(this.history[this.history.length - 1]);
    }

    handleRedo() {
        if (!this.future.length) {
            return;
        }
        const next = this.future.shift();
        this.history = [...this.history, next];
        this.restoreSnapshot(next);
    }

    handleSave() {
        // Phase 1B/2: persist normalized template JSON through Apex.
        // eslint-disable-next-line no-console
        console.log('Template JSON', this.templateJson);
    }

    handlePreview() {
        // Phase 5: invoke runtime preview and open generated PDF.
        // eslint-disable-next-line no-console
        console.log('Preview payload', this.templateModel);
    }

    patchSelected(patch) {
        if (!this.selectedElementId) {
            return;
        }
        this.patchElement(this.selectedElementId, patch, true);
    }

    patchElement(id, patch, commit) {
        this.elements = this.elements.map((item) => (item.id === id ? { ...item, ...patch } : item));
        if (commit) {
            this.commitChange();
        }
    }

    fitElementsToPage() {
        const page = this.pageDimensions;
        this.elements = this.elements.map((item) => {
            const width = Math.min(item.width, page.width);
            const height = Math.min(item.height, page.height);
            return {
                ...item,
                width,
                height,
                x: this.clamp(item.x, 0, page.width - width),
                y: this.clamp(item.y, 0, page.height - height)
            };
        });
    }

    commitChange() {
        this.pushHistory();
        this.future = [];
    }

    pushHistory() {
        const snapshot = JSON.stringify({
            pageSize: this.pageSize,
            orientation: this.orientation,
            elements: this.elements
        });
        if (this.history[this.history.length - 1] === snapshot) {
            return;
        }
        this.history = [...this.history, snapshot].slice(-HISTORY_LIMIT);
    }

    restoreSnapshot(snapshot) {
        if (!snapshot) {
            return;
        }
        const state = JSON.parse(snapshot);
        this.pageSize = state.pageSize;
        this.orientation = state.orientation;
        this.elements = state.elements || [];
        if (!this.elements.some((item) => item.id === this.selectedElementId)) {
            this.selectedElementId = undefined;
        }
    }

    roundHalf(value) {
        return Math.round(value * 2) / 2;
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), Math.max(min, max));
    }
}
