import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const productSchema = tableSchema({
    name: "products",
    columns: [
        { name: "name", type: "string" },
        { name: "description", type: "string", isOptional: true },
        { name: "price", type: "number", isOptional: true },
        { name: "unit", type: "string" },
        { name: "amount", type: "number" },

        { name: "category_id", type: "string", isIndexed: true },

        { name: "order_id", type: "string", isIndexed: true },
        { name: "project_id", type: "string", isIndexed: true },

        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
