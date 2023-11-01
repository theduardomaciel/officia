import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const orderSchema = tableSchema({
    name: "orders",
    columns: [
        { name: "name", type: "string" },
        { name: "date", type: "number", isOptional: true },
        { name: "status", type: "string" },

        { name: "additional_info", type: "string", isOptional: true },

        // Payment
        { name: "payment_condition", type: "string" }, // FULL, CARD, AGREEMENT
        { name: "payment_methods", type: "string", isOptional: true },

        // Split Values (for card and agreement payment)
        { name: "split_value", type: "string", isOptional: true },
        { name: "split_remaining", type: "string", isOptional: true },

        // Warranty
        { name: "warranty_period", type: "number" },
        { name: "warranty_details", type: "string", isOptional: true },

        // Invoice
        { name: "invoice_validity", type: "number", isOptional: true },
        { name: "discount", type: "number", isOptional: true },

        { name: "costumer_id", type: "string", isIndexed: true },

        { name: "project_id", type: "string", isIndexed: true },

        { name: "product_id", type: "string", isIndexed: true },
        { name: "material_id", type: "string", isIndexed: true },

        // Additional
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
