import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const serviceSchema = tableSchema({
    name: "services",
    columns: [
        { name: "name", type: "string" },
        { name: "subServices", type: "string" },
        { name: "materials", type: "string" },
        { name: "date", type: "string" },
        { name: "status", type: "string" },
        { name: "client", type: "string" },
        { name: 'created_at', type: 'number' },
    ],
})