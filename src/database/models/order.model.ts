import { Model } from "@nozbe/watermelondb";
import { Associations } from "@nozbe/watermelondb/Model";
import {
    field,
    readonly,
    date,
    children,
    relation,
    json,
    text,
} from "@nozbe/watermelondb/decorators";

// Types
import type { CostumerModel } from "./costumer.model";
import type { MaterialModel } from "./material.model";
import type { ProductModel } from "./product.model";
import type { ProjectModel } from "./project.model";

import type { PaymentConditionsModel } from "./paymentConditions.model";
import type { FeeModel } from "./fee.model";
import type { DiscountModel } from "./discount.model";

const sanitizePaymentMethods = (rawReactions: string[]) => {
    return Array.isArray(rawReactions) ? rawReactions.map(String) : [];
};

export class OrderModel extends Model {
    static table = "orders";
    static associations: Associations = {
        products: { type: "has_many", foreignKey: "order_id" },
        materials: { type: "has_many", foreignKey: "order_id" },
        fees: { type: "has_many", foreignKey: "order_id" },
        discounts: { type: "has_many", foreignKey: "order_id" },
    };

    @text("name") name!: string;
    @date("date") date!: Date;
    @field("status") status!: string;
    @text("additional_info") additionalInfo!: string | null;
    @text("notes") notes!: string | null;

    // Payment
    @relation("payment_conditions", "payment_condition_id")
    paymentCondition?: PaymentConditionsModel;

    @json("payment_methods", sanitizePaymentMethods) paymentMethods!:
        | string[]
        | null;

    // Warranty
    @field("warranty_period") warrantyPeriod!: number;
    @text("warranty_details") warrantyDetails!: string | null;

    @relation("costumer", "client_id") client!: CostumerModel;

    @relation("project", "project_id") project!: ProjectModel;

    @children("products") products!: ProductModel[];
    @children("materials") materials!: MaterialModel[];

    @children("fees") fees!: FeeModel[];
    @children("discounts") discounts!: DiscountModel[];

    @readonly @date("created_at") createdAt!: number;
    @readonly @date("updated_at") updatedAt!: Date;
}

export type PAYMENT_CONDITION = "FULL" | "INSTALLMENTS" | "AGREEMENT";
