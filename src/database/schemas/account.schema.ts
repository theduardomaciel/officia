import { tableSchema } from "@nozbe/watermelondb";

export const accountSchema = tableSchema({
    name: "accounts",
    columns: [
        { name: "email", type: "string" },
        { name: "password", type: "string" },
        { name: "image_url", type: "string", isOptional: true },

        { name: "name", type: "string" },
        { name: "phone", type: "string", isOptional: true },
        { name: "birthday", type: "string", isOptional: true },
        { name: "gender", type: "string", isOptional: true }, // MALE, FEMALE, OTHER

        { name: "project_id", type: "string", isOptional: true },

        // Subscription
        { name: "subscription_id", type: "string", isOptional: true },
        { name: "subscription_expires_at", type: "number", isOptional: true },
        {
            name: "is_recurring_payment_active",
            type: "boolean",
            isOptional: true,
        },

        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
