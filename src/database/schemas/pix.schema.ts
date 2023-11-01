import { tableSchema } from "@nozbe/watermelondb";

export const pixSchema = tableSchema({
    name: "pix",
    columns: [
        { name: "type", type: "string" },
        { name: "key", type: "string" },

        { name: "project_id", type: "string" },

        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
