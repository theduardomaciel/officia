import { tableSchema } from "@nozbe/watermelondb";

export const paymentConditionsSchema = tableSchema({
    name: "payment_conditions",
    columns: [
        { name: "type", type: "string" },

        // Installments
        { name: "installmentsAmount", type: "number", isOptional: true },

        // Agreement
        { name: "agreementValue", type: "number", isOptional: true },

        { name: "details", type: "string", isOptional: true },

        { name: "order_id", type: "string", isIndexed: true },

        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
