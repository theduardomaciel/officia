import { appSchema } from "@nozbe/watermelondb";

import { serviceSchema } from "./serviceSchema";

export const schemas = appSchema({
    version: 1,
    tables: [
        serviceSchema,
    ]
})