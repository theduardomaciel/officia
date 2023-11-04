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
        { name: "notes", type: "string", isOptional: true },

        // Payment
        { name: "payment_conditions_id", type: "string" },
        { name: "payment_methods", type: "string", isOptional: true },

        // Warranty
        { name: "warranty_period", type: "number" },
        { name: "warranty_details", type: "string", isOptional: true },

        { name: "costumer_id", type: "string", isIndexed: true },

        { name: "project_id", type: "string", isIndexed: true },

        { name: "product_id", type: "string", isIndexed: true },
        { name: "material_id", type: "string", isIndexed: true },

        { name: "discount_id", type: "string", isIndexed: true },
        { name: "fee_id", type: "string", isIndexed: true },

        // Additional
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
