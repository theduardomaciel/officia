import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const materialSchema = tableSchema({
	name: "materials",
	columns: [
		{ name: "name", type: "string" },
		{ name: "description", type: "string" },
		{ name: "image_url", type: "string", isOptional: true },
		{ name: "price", type: "number", isOptional: true },
		{ name: "amount", type: "number" },
		{ name: "profit_margin", type: "number", isOptional: true },
		{ name: "availability", type: "boolean" },
		{ name: "saved", type: "boolean" },
		{ name: "created_at", type: "number" },
		{ name: "service_id", type: "string", isIndexed: true },
	],
});
