# Template Schema v0.2

All canvas elements use absolute positioning. The internal unit is millimeters.

```json
{
  "schemaVersion": "0.2",
  "page": {
    "size": "A4",
    "orientation": "portrait",
    "unit": "mm",
    "margin": {
      "top": 15,
      "right": 15,
      "bottom": 15,
      "left": 15
    }
  },
  "dataPack": {
    "rootObject": "Invoice__c",
    "alias": "invoice"
  },
  "elements": [
    {
      "id": "title",
      "type": "text",
      "position": "absolute",
      "x": 15,
      "y": 20,
      "width": 80,
      "height": 10,
      "value": "TAX INVOICE",
      "fontSize": 18,
      "textAlign": "center",
      "bold": true,
      "italic": false
    },
    {
      "id": "customerName",
      "type": "field",
      "position": "absolute",
      "x": 15,
      "y": 35,
      "width": 80,
      "height": 8,
      "value": "{{invoice.Account__r.Name}}",
      "fontSize": 11,
      "textAlign": "left",
      "bold": false,
      "italic": false
    }
  ]
}
```

Dynamic tables follow the same absolute start-position rule. Their multi-page row continuation is handled separately by pagination logic.
