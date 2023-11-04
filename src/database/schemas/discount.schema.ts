import { tableSchema } from "@nozbe/watermelondb";

export const discountSchema = tableSchema({
    name: "discounts",
    columns: [
        { name: "name", type: "string" },
        { name: "description", type: "string", isOptional: true },
        { name: "value", type: "number" },
        { name: "value_type", type: "string" },
        { name: "type", type: "string" },

        { name: "order_id", type: "string", isIndexed: true },

        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
