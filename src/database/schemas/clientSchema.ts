import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const clientSchema = tableSchema({
    name: "clients",
    columns: [
        { name: "name", type: "string" },
        { name: "phone", type: "string", isOptional: true },
        { name: "image_url", type: "string", isOptional: true },
        { name: "address", type: "string", isOptional: true },
        { name: "email", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "service_id", type: "string", isOptional: true },
    ],
})