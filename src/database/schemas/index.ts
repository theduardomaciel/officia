import { appSchema } from "@nozbe/watermelondb";

import { orderSchema } from "./order.schema";
import { productSchema } from "./product.schema";
import { materialSchema } from "./material.schema";
import { clientSchema } from "./client.schema";
import { projectSchema } from "./project.schema";

export default appSchema({
	version: 25,
	tables: [
		orderSchema,
		productSchema,
		materialSchema,
		clientSchema,
		projectSchema,
	],
});
