import { tableSchema } from "@nozbe/watermelondb";

export const categorySchema = tableSchema({
    name: "categories",
    columns: [
        { name: "name", type: "string" },
        { name: "icon", type: "string" },
        { name: "color", type: "string" },

        { name: "project_id", type: "string" },

        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
