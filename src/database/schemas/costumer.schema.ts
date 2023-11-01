import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const costumerSchema = tableSchema({
    name: "costumers",
    columns: [
        { name: "name", type: "string" },
        { name: "image_url", type: "string", isOptional: true },
        { name: "phone", type: "string", isOptional: true },
        { name: "email", type: "string", isOptional: true },
        { name: "address", type: "string", isOptional: true },

        { name: "project_id", type: "string", isIndexed: true },

        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
