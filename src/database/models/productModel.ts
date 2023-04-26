import { Model } from "@nozbe/watermelondb";
import {
	field,
	readonly,
	date,
	relation,
	json,
} from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";

// Types
import type { OrderModel } from "./orderModel";
import type { ProjectModel } from "./projectModel";

// Category
import { Category } from "screens/Main/Business/@types";

const sanitizeTypes = (json: Category) => json;

export class ProductModel extends Model {
	static table = "products";
	static associations: Associations = {
		orders: { type: "belongs_to", key: "order_id" },
		projects: { type: "belongs_to", key: "project_id" },
	};

	@field("description") description!: string;
	@field("details") details!: string | null;
	@json("types", sanitizeTypes) types!: Category[];
	@field("price") price!: number;
	@field("amount") amount!: number;
	@field("saved") saved!: boolean;

	@relation("orders", "order_id") order!: OrderModel;
	@relation("projects", "project_id") project!: ProjectModel;

	@readonly @date("created_at") createdAt!: number;
}
