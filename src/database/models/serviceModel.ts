import { Model } from "@nozbe/watermelondb";
import { field, readonly, date, children, relation, json } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { ClientModel } from "./clientModel";
import { MaterialModel } from "./materialModel";
import { SubServiceModel } from "./subServiceModel";

const sanitizePaymentMethods = (rawReactions: string[]) => {
    return Array.isArray(rawReactions) ? rawReactions.map(String) : []
}

// Copilot Hint = (rawJson) => JSON.parse(rawJson)

export class ServiceModel extends Model {
    static table = "services";
    static associations: Associations = {
        sub_services: { type: "has_many", foreignKey: "service_id" },
        materials: { type: "has_many", foreignKey: "service_id" },
    }

    @field("name") name!: string;
    @date("date") date!: string;
    @field("status") status!: string;
    @field("additionalInfo") additionalInfo!: string | null;

    // Payment
    @field("paymentCondition") paymentCondition!: string;
    @json("paymentMethods", sanitizePaymentMethods) paymentMethods!: string[];
    // Agreement
    @field("splitMethod") splitMethod!: string | null;
    @field("agreementInitialValue") agreementInitialValue!: string | null;
    // Installments
    @field("installmentsAmount") installmentsAmount!: number | null;
    // Warranty
    @field("warrantyPeriod") warrantyPeriod!: number;
    @field("warrantyDetails") warrantyDetails!: string | null;

    @readonly @date('created_at') createdAt!: number;

    @children("sub_services") subServices!: SubServiceModel[];
    @children("materials") materials!: MaterialModel[];
    @relation("client", "service_id") client!: ClientModel;
}