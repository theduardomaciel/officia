import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const materialSchema = tableSchema({
    name: "materials",
    columns: [
        { name: "name", type: "string" },
        { name: "description", type: "string", isOptional: true },
        { name: "image_url", type: "string", isOptional: true },

        { name: "price", type: "number", isOptional: true },
        { name: "cost", type: "number", isOptional: true },
        { name: "profit_margin", type: "number", isOptional: true },
        { name: "amount", type: "number" },
        { name: "unit", type: "string" },
        { name: "responsibility", type: "string" },

        { name: "order_id", type: "string", isIndexed: true },

        { name: "project_id", type: "string", isIndexed: true },

        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
