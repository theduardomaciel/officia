import { Model } from "@nozbe/watermelondb";

import {
    readonly,
    date,
    text,
    field,
    immutableRelation,
} from "@nozbe/watermelondb/decorators";

import { ProjectModel } from "./project.model";
import { Associations } from "@nozbe/watermelondb/Model";

export class CategoryModel extends Model {
    static table = "categories";
    static associations: Associations = {
        projects: { type: "belongs_to", key: "project_id" },
    };

    @text("name") name!: string;
    @field("icon") icon!: string;
    @field("color") color!: string;

    @immutableRelation("projects", "project_id") project!: ProjectModel;

    @readonly @date("created_at") createdAt!: Date;
    @readonly @date("updated_at") updatedAt!: Date;
}
