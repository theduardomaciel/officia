import { tableSchema } from "@nozbe/watermelondb";

// model = table
// schema = column
// both = database schema

export const enterpriseSchema = tableSchema({
    name: "enterprises",
    columns: [
        { name: "fantasyName", type: "string" },
        { name: "socialReason", type: "string" },
        { name: "juridicalPerson", type: "string", isOptional: true },
        { name: "address", type: "string" },
        { name: "logo_uri", type: "string", isOptional: true },

        { name: "phone1", type: "string" },
        { name: "phone2", type: "string", isOptional: true },
        { name: "bankAccount", type: "string", isOptional: true },
        { name: "pixKey", type: "string", isOptional: true },
        { name: "defaultAdditionalInfo", type: "string", isOptional: true },
        { name: "defaultWarrantyDetails", type: "string", isOptional: true },
        { name: "digitalSignature_uri", type: "string", isOptional: true },
        { name: "website", type: "string", isOptional: true },
        /* { name: "email", type: "string", isOptional: true }, */
        { name: "instagram", type: "string", isOptional: true },
        { name: "whatsAppBusiness", type: "string", isOptional: true },

        /* por enquanto, os dados de login para a conta estarão inerentes às empresas */
        /* somente depois a migração para o sistema unificado de contas será realizado */
        { name: "email", type: "string" },
        { name: "password", type: "string" },

        { name: "service_id", type: "string", isIndexed: true },
        { name: "created_at", type: "number" },
    ],
})