import { Model } from "@nozbe/watermelondb";
import { Associations } from "@nozbe/watermelondb/Model";
import { readonly, date, text } from "@nozbe/watermelondb/decorators";

export class CostumerModel extends Model {
	static table = "clients";
	static associations: Associations = {
		projects: { type: "belongs_to", key: "project_id" },
	};

	@text("name") name!: string;
	@text("contact") contact!: string | null;
	@text("image_url") image_url!: string | null;
	@text("address") address!: string | null;
	@text("email") email!: string | null;

	@readonly @date("created_at") createdAt!: number;
}
