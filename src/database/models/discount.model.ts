import { Model } from "@nozbe/watermelondb";
import { Associations } from "@nozbe/watermelondb/Model";

import {
    readonly,
    date,
    field,
    immutableRelation,
} from "@nozbe/watermelondb/decorators";

// Types

export class DiscountModel extends Model {
    static table = "discounts";
    static associations: Associations = {
        orders: { type: "belongs_to", key: "order_id" },
    };

    @field("name") name!: string;
    @field("description") description?: string;
    @field("value") value!: number;
    @field("value_type") valueType!: ValueType;
    @field("type") type!: string;

    @immutableRelation("orders", "order_id") order!: Associations["orders"];

    @readonly @date("created_at") createdAt!: Date;
    @readonly @date("updated_at") updatedAt!: Date;
}

type DiscountType = "PRODUCTS" | "MATERIALS";
