import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const materialSchema = tableSchema({
    name: "materials",
    columns: [
        { name: "name", type: "string" },
        { name: "description", type: "string" },
        { name: "image_url", type: "string" },
        { name: "price", type: "number" },
        { name: "amount", type: "number" },
        { name: "profit_margin", type: "number" },
        { name: "availability", type: "number" },
        { name: "service_id", type: "string" },
        { name: "created_at", type: "number" },
    ],
})