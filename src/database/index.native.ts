import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import { schemas } from "./schemas";

import { OrderModel } from "./models/orderModel";
import { ProductModel } from "./models/productModel";
import { MaterialModel } from "./models/materialModel";
import { ClientModel } from "./models/clientModel";
import { ProjectModel } from "./models/projectModel";

const adapter = new SQLiteAdapter({
	schema: schemas,
});

export const database = new Database({
	adapter,
	modelClasses: [
		OrderModel,
		ProductModel,
		MaterialModel,
		ClientModel,
		ProjectModel,
	],
});
