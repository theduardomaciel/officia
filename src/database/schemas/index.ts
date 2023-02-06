import { appSchema } from "@nozbe/watermelondb";

import { serviceSchema } from "./serviceSchema";

export const schemas = appSchema({
    version: 2,
    tables: [
        serviceSchema,
    ]
})