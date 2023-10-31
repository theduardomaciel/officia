import { Model } from "@nozbe/watermelondb";
import {
    field,
    readonly,
    date,
    children,
    json,
} from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";

// Types
import type { CostumerModel } from "./costumer.model";
import type { MaterialModel } from "./material.model";
import type { ProductModel } from "./product.model";
import type { OrderModel } from "./order.model";

const sanitizeJSON = (rawJSON: any) => {
    return Array.isArray(rawJSON) ? rawJSON.map(String) : [];
};

const rawJSON = (json: any) => json;

export class ProjectModel extends Model {
    static table = "projects";
    static associations: Associations = {
        orders: { type: "has_many", foreignKey: "order_id" },
        clients: { type: "has_many", foreignKey: "client_id" },

        bookmarkedMaterials: { type: "has_many", foreignKey: "material_id" },
        bookmarkedProducts: { type: "has_many", foreignKey: "product_id" },
    };

    // Basic Info
    @field("name") name!: string;
    @field("socialReason") socialReason!: string;
    @field("juridicalPerson") juridicalPerson!: string | null;
    // segments

    // Additional Info
    @field("defaultAdditionalInfo") defaultAdditionalInfo!: string | null;
    @field("defaultWarrantyDetails") defaultWarrantyDetails!: string | null;

    @field("defaultOrderString") defaultOrderString!:
        | "order"
        | "service"
        | null;
    @field("defaultProductString") defaultProductString!:
        | "product"
        | "subservice"
        | null;

    @field("digitalSignature_url") digitalSignatureUrl!: string | null;

    // Customer Service
    @json("businessModels", sanitizeJSON) businessModels!: string[] | null;
    @json("agenda", sanitizeJSON) agenda!: string[] | null;
    @field("autoHolidayUnavailability") autoHolidayUnavailability!: boolean;
    @field("busyAmount") busyAmount!: number;
    @field("unavailableAmount") unavailableAmount!: number;
    @field("serviceZoneCountries") serviceZoneCountries!: string[] | null;
    @field("serviceZoneStates") serviceZoneStates!: string[] | null;
    @field("serviceZoneCities") serviceZoneCities!: string[] | null;

    // Contact
    @field("email") email!: string;
    @field("phone1") phone1!: string;
    @field("phone2") phone2!: string | null;
    @field("website") website!: string | null;
    @field("socialMedia") socialMedia!: string[] | null;

    // Branding
    @field("logo_url") logoUrl!: string | null;
    @field("banner_url") bannerUrl!: string | null;
    @field("primaryColor") primaryColor!: string | null;
    @field("secondaryColor") secondaryColor!: string | null;

    // Marketplace
    @field("at") at!: string | null;
    @json("marketplaceData", rawJSON) marketplaceData!: string[] | null;

    // Address
    @field("address") address!: string;

    // Payments
    @json("defaultPaymentMethods", sanitizeJSON) defaultPaymentMethods!:
        | string[]
        | null;
    @field("currency") currency!: string | null;
    @json("bankAccount", rawJSON) bankAccount!: string | null;
    @json("pix", rawJSON) pixKey!: string | null;

    @children("orders") orders!: OrderModel[];
    @children("clients") clients!: CostumerModel[];

    @children("bookmarkedMaterials") bookmarkedMaterials!: MaterialModel[];
    @children("bookmarkedProducts")
    bookmarkedProducts!: ProductModel[];

    @readonly @date("created_at") createdAt!: number;
    @readonly @date("updated_at") updatedAt!: number;
}
