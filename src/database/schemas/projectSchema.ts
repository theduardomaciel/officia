import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const projectSchema = tableSchema({
	name: "projects",
	columns: [
		{ name: "name", type: "string" },
		{ name: "socialReason", type: "string" },
		{ name: "juridicalPerson", type: "string", isOptional: true },
		{ name: "email", type: "string" },

		{ name: "logo_url", type: "string", isOptional: true },
		{ name: "digitalSignature_url", type: "string", isOptional: true },

		{ name: "address", type: "string" },
		{ name: "phone1", type: "string" },
		{ name: "phone2", type: "string", isOptional: true },
		{ name: "website", type: "string", isOptional: true },
		{ name: "instagram", type: "string", isOptional: true },
		{ name: "facebook", type: "string", isOptional: true },
		{ name: "twitter", type: "string", isOptional: true },
		{ name: "tiktok", type: "string", isOptional: true },
		{ name: "youtube", type: "string", isOptional: true },
		{ name: "whatsAppBusiness", type: "string", isOptional: true },

		{ name: "bankAccount", type: "string", isOptional: true },
		{ name: "pixKey", type: "string", isOptional: true },

		{ name: "defaultAdditionalInfo", type: "string", isOptional: true },
		{ name: "defaultWarrantyDetails", type: "string", isOptional: true },

		{ name: "order_id", type: "string", isIndexed: true },
		{ name: "client_id", type: "string", isIndexed: true },
		{ name: "material_id", type: "string", isIndexed: true },
		{ name: "subOrder_id", type: "string", isIndexed: true },

		{ name: "created_at", type: "number" },
	],
});
