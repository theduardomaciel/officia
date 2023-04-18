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
import type { SubServiceModel } from "./subServiceModel";
import { ServiceModel } from "./serviceModel";

export class ProjectModel extends Model {
	static table = "projects";
	static associations: Associations = {
		services: { type: "has_many", foreignKey: "service_id" },
		clients: { type: "has_many", foreignKey: "client_id" },

		bookmarkedMaterials: { type: "has_many", foreignKey: "material_id" },
		bookmarkedSubServices: {
			type: "has_many",
			foreignKey: "subService_id",
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

	@children("services") services!: ServiceModel[];
	@children("clients") clients!: ClientModel[];

	@children("bookmarkedMaterials") bookmarkedMaterials!: MaterialModel[];
	@children("bookmarkedSubServices")
	bookmarkedSubServices!: SubServiceModel[];

	@readonly @date("created_at") createdAt!: number;
}
