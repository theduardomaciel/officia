import { Model } from "@nozbe/watermelondb";
import {
    date,
    field,
    readonly,
    relation,
    text,
} from "@nozbe/watermelondb/decorators";

// Types
import type { ProjectModel } from "./project.model";

export class PixModel extends Model {
    static table = "pix";

    // Basic Info
    @field("type") type!: PIX_KEY_TYPE;
    @text("key") key!: string;

    // Associations
    @relation("projects", "project_id") project!: ProjectModel;

    // Timestamps
    @readonly @date("created_at") createdAt!: Date;
    @readonly @date("updated_at") updatedAt!: Date;
}

type PIX_KEY_TYPE = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM";
