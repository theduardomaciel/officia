import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const orderSchema = tableSchema({
	name: "orders",
	columns: [
		{ name: "name", type: "string" },
		{ name: "date", type: "number" },
		{ name: "status", type: "string" },
		{ name: "additionalInfo", type: "string", isOptional: true },
		// Payment
		{ name: "paymentCondition", type: "string" },
		{ name: "paymentMethods", type: "string" },
		// Split Values (for card and agreement payment)
		{ name: "splitValue", type: "string", isOptional: true },
		{ name: "splitRemaining", type: "string", isOptional: true },
		// Warranty
		{ name: "warrantyPeriod", type: "number" },
		{ name: "warrantyDetails", type: "string", isOptional: true },
		// Invoice
		{ name: "invoiceValidity", type: "number", isOptional: true },
		{ name: "discount", type: "number", isOptional: true },
		// Additional
		{ name: "created_at", type: "number" },
		{ name: "client_id", type: "string", isIndexed: true },
	],
});
