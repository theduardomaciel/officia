import { Model } from "@nozbe/watermelondb";
import {
	field,
	readonly,
	date,
	children,
	relation,
	json,
	writer,
} from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { ClientModel } from "./clientModel";
import { MaterialModel } from "./materialModel";
import { ProductModel } from "./productModel";

const sanitizePaymentMethods = (rawReactions: string[]) => {
	return Array.isArray(rawReactions) ? rawReactions.map(String) : [];
};

// Copilot Hint = (rawJson) => JSON.parse(rawJson)

export class OrderModel extends Model {
	static table = "orders";
	static associations: Associations = {
		products: { type: "has_many", foreignKey: "order_id" },
		materials: { type: "has_many", foreignKey: "order_id" },
		clients: { type: "has_many", foreignKey: "order_id" },
	};

	@field("name") name!: string;
	@date("date") date!: Date;
	@field("status") status!: string;
	@field("additionalInfo") additionalInfo!: string | null;

	// Payment
	@field("paymentCondition") paymentCondition!: string;
	@json("paymentMethods", sanitizePaymentMethods) paymentMethods!: string[];
	// Split Values (for card and agreement payment)
	@field("splitValue") splitValue!: string | null;
	@field("splitRemaining") splitRemaining!: string | null;
	// Warranty
	@field("warrantyPeriod") warrantyPeriod!: number;
	@field("warrantyDetails") warrantyDetails!: string | null;

	// Invoice
	@field("invoiceValidity") invoiceValidity!: number | null;
	@field("discount") discount!: number | null;

	@children("products") products!: ProductModel[];
	@children("materials") materials!: MaterialModel[];
	@relation("clients", "client_id") client!: ClientModel;

	@readonly @date("created_at") createdAt!: number;
}
