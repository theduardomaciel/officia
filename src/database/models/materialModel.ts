import { Model } from "@nozbe/watermelondb";
import {
	field,
	readonly,
	date,
	relation,
} from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { OrderModel } from "./orderModel";

export class MaterialModel extends Model {
	static table = "materials";
	static associations: Associations = {
		orders: { type: "belongs_to", key: "order_id" },
	};

	@readonly @date("created_at") createdAt!: number;
	@field("name") name!: string;
	@field("description") description!: string;
	@field("image_url") image_url!: string | null;
	@field("price") price!: number;
	@field("amount") amount!: number;
	@field("profit_margin") profitMargin!: number | null;
	@field("availability") availability!: boolean;
	@field("saved") saved!: boolean;

	@relation("orders", "order_id") order!: OrderModel;
}
