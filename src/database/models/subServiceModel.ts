import { Model } from "@nozbe/watermelondb";
import { field, readonly, date, relation } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { ServiceModel } from "./serviceModel";

export class SubServiceModel extends Model {
    static table = "sub_services";
    static associations: Associations = {
        services: { type: 'belongs_to', key: 'service_id' },
    }

    @readonly @date('created_at') createdAt!: number;
    @field("details") details!: string;
    @field("types") types!: string;
    @field("price") price!: number;
    @field("amount") amount!: number;
    @field("service_id") service_id!: string;

    @relation('services', 'service_id') service!: ServiceModel;
}