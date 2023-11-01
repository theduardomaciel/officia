import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const projectSchema = tableSchema({
    name: "projects",
    columns: [
        // Basic Info
        { name: "name", type: "string", isOptional: true },
        { name: "social_reason", type: "string", isOptional: true },
        { name: "juridical_person", type: "string", isOptional: true },

        { name: "category_id", type: "string", isIndexed: true },

        // Additional Info
        { name: "default_additional_info", type: "string", isOptional: true },
        { name: "default_warranty_info", type: "string", isOptional: true },

        { name: "default_order_string", type: "string", isOptional: true }, // ORDER | SERVICE
        { name: "default_product_string", type: "string", isOptional: true }, // PIECE | PRODUCT | SERVICE

        { name: "digital_signature_url", type: "string", isOptional: true },

        // Marketplace
        { name: "marketplace_id", type: "string", isIndexed: true },

        // Branding
        { name: "logo_url", type: "string", isOptional: true },
        { name: "banner_url", type: "string", isOptional: true },
        { name: "primary_color", type: "string", isOptional: true },
        { name: "secondary_color", type: "string", isOptional: true },

        // Contact
        { name: "email", type: "string", isOptional: true },
        { name: "phone1", type: "string", isOptional: true },
        { name: "phone2", type: "string", isOptional: true },
        { name: "website", type: "string", isOptional: true },
        { name: "social_media", type: "string", isOptional: true },

        // Address
        { name: "address_id", type: "string", isIndexed: true },

        // Payments
        { name: "default_payment_methods", type: "string", isOptional: true },
        { name: "currency", type: "string" },

        { name: "bank_account_id", type: "string" },
        { name: "pix_id", type: "string" },

        { name: "order_id", type: "string", isIndexed: true },
        { name: "costumer_id", type: "string", isIndexed: true },

        // Catalog
        { name: "product_id", type: "string", isIndexed: true },
        { name: "material_id", type: "string", isIndexed: true },

        { name: "account_id", type: "string", isIndexed: true },

        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
