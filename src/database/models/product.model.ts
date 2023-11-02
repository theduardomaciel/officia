import { Model } from "@nozbe/watermelondb";
import {
    field,
    readonly,
    date,
    relation,
    text,
    children,
} from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";

// Types
import type { OrderModel } from "./order.model";
import type { ProjectModel } from "./project.model";
import type { CategoryModel } from "./category.model";

export class ProductModel extends Model {
    static table = "products";
    static associations: Associations = {
        categories: { type: "belongs_to", key: "project_id" },
    };

    @text("name") name!: string;
    @text("description") description!: string | null;
    @field("price") price!: number | null;
    @field("unit") unit!: UNIT;
    @field("amount") amount!: number;

    @children("categories") categories!: CategoryModel[];

    @relation("orders", "order_id") order!: OrderModel;
    @relation("projects", "project_id") project!: ProjectModel;

    @readonly @date("created_at") createdAt!: number;
}

export type UNIT =
    | "UNIT"
    | "M2"
    | "KM2"
    | "HA"
    | "MM"
    | "CM"
    | "M"
    | "KM"
    | "ML"
    | "L"
    | "M3"
    | "MIN"
    | "H"
    | "DAYS"
    | "WEEKS"
    | "MONTHS"
    | "G"
    | "KG";
