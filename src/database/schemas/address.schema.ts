import { tableSchema } from "@nozbe/watermelondb";

export const addressSchema = tableSchema({
    name: "addresses",
    columns: [
        { name: "country", type: "string" },
        { name: "state", type: "string" },
        { name: "city", type: "string" },
        { name: "district", type: "string" },
        { name: "street", type: "string" },
        { name: "number", type: "number" },
        { name: "zip_code", type: "string" },

        { name: "project_id", type: "string" },

        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
