import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const costumerSchema = tableSchema({
	name: "clients",
	columns: [
		{ name: "name", type: "string" },
		{ name: "contact", type: "string", isOptional: true },
		{ name: "image_url", type: "string", isOptional: true },
		{ name: "address", type: "string", isOptional: true },
		{ name: "email", type: "string", isOptional: true },
		{ name: "created_at", type: "number" },
		{ name: "project_id", type: "string", isIndexed: true },
	],
});
