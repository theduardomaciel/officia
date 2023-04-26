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

// Types
import type { ClientModel } from "./clientModel";
import type { MaterialModel } from "./materialModel";
import type { ProductModel } from "./productModel";
import { OrderModel } from "./orderModel";

export class ProjectModel extends Model {
	static table = "projects";
	static associations: Associations = {
		orders: { type: "has_many", foreignKey: "order_id" },
		clients: { type: "has_many", foreignKey: "client_id" },

		bookmarkedMaterials: { type: "has_many", foreignKey: "material_id" },
		bookmarkedProducts: {
			type: "has_many",
			foreignKey: "subOrder_id",
		},
	};

	@field("name") name!: string;
	@field("socialReason") socialReason!: string;
	@field("juridicalPerson") juridicalPerson!: string | null;
	@field("email") email!: string;

	@field("logo_url") logoUrl!: string | null;
	@field("digitalSignature_url") digitalSignatureUrl!: string | null;

	@field("address") address!: string;
	@field("phone1") phone1!: string;
	@field("phone2") phone2!: string | null;
	@field("website") website!: string | null;
	@field("instagram") instagram!: string | null;
	@field("facebook") facebook!: string | null;
	@field("twitter") twitter!: string | null;
	@field("tiktok") tiktok!: string | null;
	@field("youtube") youtube!: string | null;
	@field("whatsAppBusiness") whatsAppBusiness!: string | null;

	@field("bankAccount") bankAccount!: string | null;
	@field("pixKey") pixKey!: string | null;

	@field("defaultAdditionalInfo") defaultAdditionalInfo!: string | null;
	@field("defaultWarrantyDetails") defaultWarrantyDetails!: string | null;

	@children("orders") orders!: OrderModel[];
	@children("clients") clients!: ClientModel[];

	@children("bookmarkedMaterials") bookmarkedMaterials!: MaterialModel[];
	@children("bookmarkedProducts")
	bookmarkedProducts!: ProductModel[];

	@readonly @date("created_at") createdAt!: number;
}
