import { Model } from "@nozbe/watermelondb";
import { Associations } from "@nozbe/watermelondb/Model";
import {
    field,
    readonly,
    date,
    children,
    relation,
    json,
    writer,
    text,
} from "@nozbe/watermelondb/decorators";

// Types
import type { CostumerModel } from "./costumer.model";
import type { MaterialModel } from "./material.model";
import type { ProductModel } from "./product.model";
import type { ProjectModel } from "./project.model";

const sanitizePaymentMethods = (rawReactions: string[]) => {
    return Array.isArray(rawReactions) ? rawReactions.map(String) : [];
};

export class OrderModel extends Model {
    static table = "orders";
    static associations: Associations = {
        products: { type: "has_many", foreignKey: "order_id" },
        materials: { type: "has_many", foreignKey: "order_id" },
    };

    @text("name") name!: string;
    @date("date") date!: Date;
    @field("status") status!: string;
    @text("additional_info") additionalInfo!: string | null;

    // Payment
    @field("paymentCondition") paymentCondition!: PAYMENT_CONDITION;
    @json("paymentMethods", sanitizePaymentMethods) paymentMethods!:
        | string[]
        | null;

    // Split Values (for card and agreement payment)
    @text("split_value") splitValue!: string | null;
    @text("split_remaining") splitRemaining!: string | null;

    // Warranty
    @field("warrantyPeriod") warrantyPeriod!: number;
    @text("warrantyDetails") warrantyDetails!: string | null;

    // Invoice
    @text("invoice_validity") invoiceValidity!: number;
    @text("discount") discount!: number | null;

    @relation("costumer", "client_id") client!: CostumerModel;

    @relation("project", "project_id") project!: ProjectModel;

    @children("products") products!: ProductModel[];
    @children("materials") materials!: MaterialModel[];

    @readonly @date("created_at") createdAt!: number;
    @readonly @date("updated_at") updatedAt!: Date;
}

type PAYMENT_CONDITION = "FULL" | "CARD" | "AGREEMENT";
