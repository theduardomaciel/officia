import { Model } from "@nozbe/watermelondb";
import {
    field,
    readonly,
    date,
    relation,
    text,
} from "@nozbe/watermelondb/decorators";

// Types
import type { OrderModel } from "./order.model";
import type { ProjectModel } from "./project.model";
import type { UNIT } from "./product.model";

export class MaterialModel extends Model {
    static table = "materials";

    @text("name") name!: string;
    @text("description") description!: string | null;
    @text("image_url") image_url!: string | null;

    @field("price") price!: number | null;
    @field("cost") cost!: number | null;
    @field("profit_margin") profitMargin!: number | null;
    @field("amount") amount!: number;
    @field("unit") unit!: UNIT;
    @field("responsibility") responsibility!: Responsibility;

    @relation("orders", "order_id") order!: OrderModel;
    @relation("projects", "project_id") project!: ProjectModel;

    @readonly @date("created_at") createdAt!: number;
    @readonly @date("updated_at") updatedAt!: number;
}

export type Responsibility = "COSTUMER" | "PROJECT" | "OTHER";
