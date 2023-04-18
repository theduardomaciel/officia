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
import type { ServiceModel } from "./serviceModel";
import type { ProjectModel } from "./projectModel";

// Category
import { Category } from "screens/Main/Business/@types";

const sanitizeTypes = (json: Category) => json;

export class SubServiceModel extends Model {
	static table = "sub_services";
	static associations: Associations = {
		services: { type: "belongs_to", key: "service_id" },
		projects: { type: "belongs_to", key: "project_id" },
	};

	@field("description") description!: string;
	@field("details") details!: string | null;
	@json("types", sanitizeTypes) types!: Category[];
	@field("price") price!: number;
	@field("amount") amount!: number;
	@field("saved") saved!: boolean;

	@relation("services", "service_id") service!: ServiceModel;
	@relation("projects", "project_id") project!: ProjectModel;

	@readonly @date("created_at") createdAt!: number;
}
