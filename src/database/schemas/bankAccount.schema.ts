import { tableSchema } from "@nozbe/watermelondb";

export const bankAccountSchema = tableSchema({
    name: "bank_accounts",
    columns: [
        { name: "bank", type: "string" },
        { name: "agency", type: "string" },
        { name: "agency_digit", type: "string" },
        { name: "account", type: "string" },
        { name: "account_type", type: "string" },
        { name: "titular_pin", type: "string" },

        { name: "project_id", type: "string" },

        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
    ],
});
