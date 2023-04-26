import { appSchema } from "@nozbe/watermelondb";

import { orderSchema } from "./orderSchema";
import { productSchema } from "./productSchema";
import { materialSchema } from "./materialSchema";
import { clientSchema } from "./clientSchema";
import { projectSchema } from "./projectSchema";

export const schemas = appSchema({
	version: 24,
	tables: [
		orderSchema,
		productSchema,
		materialSchema,
		clientSchema,
		projectSchema,
	],
});
