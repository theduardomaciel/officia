import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const serviceSchema = tableSchema({
    name: "services",
    columns: [
        { name: "name", type: "string" },
        { name: "date", type: "number" },
        { name: "status", type: "string" },
        { name: "additionalInfo", type: "string", isOptional: true },
        // Payment
        { name: "paymentCondition", type: "string" },
        { name: "paymentMethods", type: "string" },
        // Agreements
        { name: "splitMethod", type: "string", isOptional: true },
        { name: "agreementInitialValue", type: "string", isOptional: true },
        // Installments
        { name: "installmentsAmount", type: "number", isOptional: true },
        // Warranty
        { name: "warrantyPeriod", type: "number" },
        { name: "warrantyDetails", type: "string", isOptional: true },
        // Additional
        { name: "invoice_uri", type: "string", isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'client_id', type: 'string', isIndexed: true },
    ],
})