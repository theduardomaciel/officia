import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import appSchema from "./schemas";

import { OrderModel } from "./models/order.model";
import { ProductModel } from "./models/product.model";
import { MaterialModel } from "./models/material.model";
import {  CostumerModel } from "./models/costumer.model";
import { ProjectModel } from "./models/project.model";

import migrations from "./migrations";

const adapter = new SQLiteAdapter({
	schema: appSchema,
	//migrations,
	jsi: true,
	onSetUpError: (error) => {
		console.log(error);
	},
});

export const database = new Database({
	adapter,
	modelClasses: [
		OrderModel,
		ProductModel,
		MaterialModel,
		CostumerModel,
		ProjectModel,
	],
});
