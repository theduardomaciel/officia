import { Model } from "@nozbe/watermelondb";
import { Associations } from "@nozbe/watermelondb/Model";
import { field, readonly, date } from "@nozbe/watermelondb/decorators";

export class ClientModel extends Model {
	static table = "clients";
	static associations: Associations = {
		projects: { type: "belongs_to", key: "project_id" },
	};

	@field("name") name!: string;
	@field("contact") contact!: string | null;
	@field("image_url") image_url!: string | null;
	@field("address") address!: string | null;
	@field("email") email!: string | null;

	@readonly @date("created_at") createdAt!: number;
}
