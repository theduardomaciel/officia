import { appSchema } from "@nozbe/watermelondb";

import { orderSchema } from "./order.schema";
import { productSchema } from "./product.schema";
import { materialSchema } from "./material.schema";
import { costumerSchema } from "./costumer.schema";
import { projectSchema } from "./project.schema";

export default appSchema({
	version: 26,
	tables: [
		orderSchema,
		productSchema,
		materialSchema,
		costumerSchema,
		projectSchema,
	],
});
