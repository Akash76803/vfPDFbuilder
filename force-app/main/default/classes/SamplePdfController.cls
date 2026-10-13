public with sharing class SamplePdfController {
    public List<ItemRow> items { get; private set; }

    public SamplePdfController() {
        items = new List<ItemRow>{
            new ItemRow('Product A', 2, 1250, 2500),
            new ItemRow('Product B', 5, 450, 2250),
            new ItemRow('Product C', 1, 3200, 3200)
        };
    }

    public class ItemRow {
        public String Description { get; private set; }
        public Decimal Quantity { get; private set; }
        public Decimal Rate { get; private set; }
        public Decimal Amount { get; private set; }

        public ItemRow(String description, Decimal quantity, Decimal rate, Decimal amount) {
            Description = description;
            Quantity = quantity;
            Rate = rate;
            Amount = amount;
        }
    }
}
