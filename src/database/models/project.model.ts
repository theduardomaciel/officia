import { Model } from "@nozbe/watermelondb";
import { Associations } from "@nozbe/watermelondb/Model";
import {
    field,
    readonly,
    date,
    children,
    json,
    text,
    immutableRelation,
    relation,
} from "@nozbe/watermelondb/decorators";

// Types
import type { CostumerModel } from "./costumer.model";
import type { MaterialModel } from "./material.model";
import type { ProductModel } from "./product.model";
import type { OrderModel } from "./order.model";
import type { CategoryModel } from "./category.model";
import type { AccountModel } from "./account.model";
import type { MarketplaceModel } from "./marketplace.model";

const sanitizeJSON = (rawJSON: any) => {
    return Array.isArray(rawJSON) ? rawJSON.map(String) : [];
};

export class ProjectModel extends Model {
    static table = "projects";
    static associations: Associations = {
        categories: { type: "has_many", foreignKey: "project_id" },

        orders: { type: "has_many", foreignKey: "project_id" },
        costumers: { type: "has_many", foreignKey: "project_id" },

        products: { type: "has_many", foreignKey: "project_id" },
        materials: { type: "has_many", foreignKey: "project_id" },
    };

    // Basic Info
    @text("name") name!: string | null;
    @text("social_reason") socialReason!: string | null;
    @text("juridical_person") juridicalPerson!: string | null;

    @children("categories") categories!: CategoryModel[];

    // Additional Info
    @text("default_additional_info") defaultAdditionalInfo!: string | null;
    @text("default_warranty_details") defaultWarrantyDetails!: string | null;

    @field("default_order_string") defaultOrderString!: ORDER | null;
    @field("default_product_string") defaultProductString!: PRODUCT | null;

    @field("digital_signature_url") digitalSignatureUrl!: string | null;

    // Marketplace
    @relation("marketplaces", "marketplace_id") marketplace!: MarketplaceModel;

    // Branding
    @field("logo_url") logoUrl!: string | null;
    @field("banner_url") bannerUrl!: string | null;
    @field("primary_color") primaryColor!: string | null;
    @field("secondary_color") secondaryColor!: string | null;

    // Contact
    @text("email") email!: string | null;
    @text("phone1") phone1!: string | null;
    @text("phone2") phone2!: string | null;
    @text("website") website!: string | null;
    @json("social_media", sanitizeJSON) socialMedia!: string[] | null;

    // Address
    @relation("addresses", "address_id") address!: string | null;

    // Payments
    @json("default_payment_methods", sanitizeJSON) defaultPaymentMethods!:
        | string[]
        | null;
    @field("currency") currency!: CURRENCY | null;

    @relation("bank_accounts", "bank_account_id") bankAccount!: string | null;
    @relation("pix", "pix_id") pix!: string | null;

    @children("orders") orders!: OrderModel[];
    @children("costumers") costumers!: CostumerModel[];

    // Catalog
    @children("products") products!: ProductModel[];
    @children("materials") materials!: MaterialModel[];

    @immutableRelation("accounts", "account_id") account!: AccountModel;

    @readonly @date("created_at") createdAt!: number;
    @readonly @date("updated_at") updatedAt!: number;
}

type ORDER = "ORDER" | "SERVICE";
type PRODUCT = "PRODUCT" | "PART" | "SERVICE";
type CURRENCY =
    | "BRL"
    | "USD"
    | "EUR"
    | "JPY"
    | "GBP"
    | "AUD"
    | "CAD"
    | "CHF"
    | "CNY"
    | "SEK"
    | "NZD"
    | "MXN"
    | "SGD"
    | "HKD"
    | "NOK"
    | "KRW"
    | "TRY"
    | "RUB"
    | "INR";
