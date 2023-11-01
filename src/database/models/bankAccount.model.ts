import { Model } from "@nozbe/watermelondb";
import { date, readonly, relation, text } from "@nozbe/watermelondb/decorators";

// Types
import type { ProjectModel } from "./project.model";

export class BankAccountModel extends Model {
    static table = "bank_accounts";

    // Basic Info
    @text("bank") bank!: BANK;
    @text("agency") agency!: string;
    @text("agency_digit") agencyDigit!: string;
    @text("account") account!: string;
    @text("account_type") accountType!: string;
    @text("titular_pin") titularPin!: string;

    // Associations
    @relation("projects", "project_id") project!: ProjectModel;

    // Timestamps
    @readonly @date("created_at") createdAt!: Date;
    @readonly @date("updated_at") updatedAt!: Date;
}

type BANK =
    | "BANCO_DO_BRASIL"
    | "BRADESCO"
    | "CAIXA"
    | "ITAU"
    | "NUBANK"
    | "SANTANDER"
    | "SICOOB"
    | "SICREDI"
    | "ORIGINAL"
    | "INTER"
    | "C6"
    | "BS2"
    | "NEON"
    | "PAGBANK"
    | "BRB"
    | "BANRISUL"
    | "STONE"
    | "VIA_CREDI"
    | "OTHER";
