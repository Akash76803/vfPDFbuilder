# Template Schema v0.1

```json
{
  "schemaVersion": "0.1",
  "page": {
    "size": "A4",
    "orientation": "portrait",
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
      "layoutMode": "flow",
      "value": "TAX INVOICE",
      "style": {
        "fontSize": 18,
        "fontWeight": "bold",
        "textAlign": "center"
      }
    },
    {
      "id": "customerName",
      "type": "field",
      "layoutMode": "flow",
      "binding": "{{invoice.Account__r.Name}}"
    }
  ]
}
```
