import { Model } from "@nozbe/watermelondb";
import {
	field,
	readonly,
	date,
	relation,
	text,
} from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { OrderModel } from "./order.model";

export class MaterialModel extends Model {
	static table = "materials";
	static associations: Associations = {
		orders: { type: "belongs_to", key: "order_id" },
	};

	@readonly @date("created_at") createdAt!: number;
	@text("name") name!: string;
	@text("description") description!: string;
	@text("image_url") image_url!: string | null;
	@field("price") price!: number;
	@field("amount") amount!: number;
	@field("profit_margin") profitMargin!: number | null;

	@field("is_available") isAvailable!: boolean;
	@field("is_bookmarked") isBookmarked!: boolean;

	@relation("orders", "order_id") order!: OrderModel;
}
