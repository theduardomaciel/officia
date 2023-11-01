import { tableSchema } from "@nozbe/watermelondb";

export const marketplaceSchema = tableSchema({
    name: "marketplaces",
    columns: [
        { name: "at", type: "string" },
        { name: "slogan", type: "string", isOptional: true },
        { name: "description", type: "string", isOptional: true },
        { name: "isEnabled", type: "boolean", isOptional: true },

        { name: "business_models", type: "string", isOptional: true },
        { name: "agenda", type: "string", isOptional: true },

        {
            name: "auto_holiday_unavailability",
            type: "boolean",
            isOptional: true,
        },
        { name: "busy_amount", type: "number", isOptional: true },
        { name: "unavailable_amount", type: "number", isOptional: true },

        { name: "service_zone_countries", type: "string", isOptional: true },
        { name: "service_zone_states", type: "string", isOptional: true },
        { name: "service_zone_cities", type: "string", isOptional: true },

        { name: "project_id", type: "string", isIndexed: true },

        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
