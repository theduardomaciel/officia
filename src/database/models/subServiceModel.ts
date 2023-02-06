import { Model } from "@nozbe/watermelondb";
import { field, readonly, date, relation } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { ServiceModel } from "./serviceModel";

export class SubServiceModel extends Model {
    static table = "sub_services";
    static associations: Associations = {
        services: { type: 'belongs_to', key: 'service_id' },
    }

    @field("description") description!: string;
    @field("details") details!: string | null;
    @field("types") types!: string;
    @field("price") price!: number;
    @field("amount") amount!: number;
    @field("service_id") service_id!: string;
    @readonly @date('created_at') createdAt!: number;

    @relation('services', 'service_id') service!: ServiceModel;
}