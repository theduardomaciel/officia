import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const subServiceSchema = tableSchema({
	name: "sub_services",
	columns: [
		{ name: "description", type: "string" },
		{ name: "details", type: "string", isOptional: true },
		{ name: "types", type: "string" },
		{ name: "price", type: "number", isOptional: true },
		{ name: "amount", type: "number" },
		{ name: "saved", type: "boolean" },
		{ name: "created_at", type: "number" },
		{ name: "service_id", type: "string", isIndexed: true },
	],
});
