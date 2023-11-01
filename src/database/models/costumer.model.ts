import { Model } from "@nozbe/watermelondb";
import { Associations } from "@nozbe/watermelondb/Model";
import { readonly, date, text, relation } from "@nozbe/watermelondb/decorators";

// Types
import type { ProjectModel } from "./project.model";

export class CostumerModel extends Model {
    static table = "costumers";
    static associations: Associations = {
        projects: { type: "belongs_to", key: "project_id" },
    };

    @text("name") name!: string;
    @text("image_url") image_url!: string | null;
    @text("phone") contact!: string | null;
    @text("email") email!: string | null;
    @text("address") address!: string | null;

    @relation("projects", "project_id") project!: ProjectModel;

    @readonly @date("created_at") createdAt!: Date;
    @readonly @date("updated_at") updatedAt!: Date;
}
