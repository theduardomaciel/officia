import { Model } from "@nozbe/watermelondb";
import { field, readonly, date, relation } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { ServiceModel } from "./serviceModel";

export class MaterialModel extends Model {
    static table = "materials";
    static associations: Associations = {
        services: { type: 'belongs_to', key: 'service_id' },
    }

    @readonly @date('created_at') createdAt!: number;
    @field("name") name!: string;
    @field("description") description!: string;
    @field("image_url") image_url!: string | null;
    @field("price") price!: string;
    @field("amount") amount!: number;
    @field("profit_margin") profitMargin!: number | null;
    @field("availability") availability!: boolean;

    @relation('services', 'service_id') service!: ServiceModel;
}