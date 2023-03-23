import { Collection, Model } from "@nozbe/watermelondb";
import { field, readonly, date, children, relation, json, writer } from "@nozbe/watermelondb/decorators";
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
        clients: { type: "has_many", foreignKey: "service_id" },
    }

    @field("name") name!: string;
    @date("date") date!: Date;
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

    @field("invoice_uri") invoiceUri!: string | null;

    @field("invoiceValidity") invoiceValidity!: number | null;
    @field("discountPercentage") discountPercentage!: number | null;

    @children("sub_services") subServices!: SubServiceModel[];
    @children("materials") materials!: MaterialModel[];

    @readonly @date('created_at') createdAt!: number;
    @relation("clients", "client_id") client!: ClientModel;
}