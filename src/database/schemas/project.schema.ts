import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const projectSchema = tableSchema({
    name: "projects",
    columns: [
        // Basic Info
        { name: "name", type: "string" },
        { name: "socialReason", type: "string" },
        { name: "juridicalPerson", type: "string", isOptional: true },

        // Additional Info
        { name: "defaultAdditionalInfo", type: "string", isOptional: true },
        { name: "defaultWarrantyDetails", type: "string", isOptional: true },

        { name: "defaultOrderString", type: "string", isOptional: true },
        { name: "defaultProductString", type: "string", isOptional: true },

        { name: "digitalSignature_url", type: "string", isOptional: true },

        // Customer Service
        { name: "businessModels", type: "string", isOptional: true },
        { name: "agenda", type: "string", isOptional: true },
        {
            name: "autoHolidayUnavailability",
            type: "boolean",
            isOptional: true,
        },
        { name: "busyAmount", type: "number", isOptional: true },
        { name: "unavailableAmount", type: "number", isOptional: true },
        { name: "serviceZoneCountries", type: "string", isOptional: true },
        { name: "serviceZoneStates", type: "string", isOptional: true },
        { name: "serviceZoneCities", type: "string", isOptional: true },

        // Contact
        { name: "email", type: "string" },
        { name: "phone1", type: "string" },
        { name: "phone2", type: "string", isOptional: true },
        { name: "website", type: "string", isOptional: true },
        { name: "socialMedia", type: "string", isOptional: true },

        // Branding
        { name: "logo_url", type: "string", isOptional: true },
        { name: "banner_url", type: "string", isOptional: true },
        { name: "primaryColor", type: "string", isOptional: true },
        { name: "secondaryColor", type: "string", isOptional: true },

        // Address
        { name: "address", type: "string" },

        // Payments
        { name: "bankAccount", type: "string", isOptional: true },
        { name: "pixKey", type: "string", isOptional: true },

        { name: "order_id", type: "string", isIndexed: true },
        { name: "client_id", type: "string", isIndexed: true },
        { name: "material_id", type: "string", isIndexed: true },
        { name: "subOrder_id", type: "string", isIndexed: true },

        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
