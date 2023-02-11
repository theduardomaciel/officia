import { appSchema } from "@nozbe/watermelondb";

import { serviceSchema } from "./serviceSchema";
import { subServiceSchema } from "./subServiceSchema";
import { materialSchema } from "./materialSchema";
import { clientSchema } from "./clientSchema";

export const schemas = appSchema({
    version: 4,
    tables: [
        serviceSchema,
        subServiceSchema,
        materialSchema,
        clientSchema,
    ]
})