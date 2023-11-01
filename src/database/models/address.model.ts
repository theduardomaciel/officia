import { Model } from "@nozbe/watermelondb";
import { date, readonly, relation, text } from "@nozbe/watermelondb/decorators";

// Types
import type { ProjectModel } from "./project.model";

export class AddressModel extends Model {
    static table = "addresses";

    // Basic Info
    @text("country") country!: string;
    @text("state") state!: string;
    @text("city") city!: string;
    @text("district") district!: string;
    @text("street") street!: string;
    @text("number") number!: number;
    @text("zip_code") zipCode!: string;

    // Associations
    @relation("projects", "project_id") project!: ProjectModel;

    // Timestamps
    @readonly @date("created_at") createdAt!: Date;
    @readonly @date("updated_at") updatedAt!: Date;
}
