import { Model } from "@nozbe/watermelondb";

import {
    readonly,
    date,
    field,
    immutableRelation,
} from "@nozbe/watermelondb/decorators";

// Types
import type { ProjectModel } from "./project.model";

export class PaymentConditionsModel extends Model {
    static table = "payment_conditions";

    @field("type") type!: PaymentConditionsType;

    // Installments
    @field("installmentsAmount") installmentsAmount?: number;

    // Agreement
    @field("agreementValue") agreementValue?: number;
    @field("agreementValueType") agreementValueType?: ValueType;

    // Other
    @field("details") details?: string;

    @immutableRelation("projects", "project_id") project!: ProjectModel;

    @readonly @date("created_at") createdAt!: Date;
    @readonly @date("updated_at") updatedAt!: Date;
}
