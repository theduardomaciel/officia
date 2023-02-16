import { Model } from "@nozbe/watermelondb";
import { field, readonly, date, relation } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { ServiceModel } from "./serviceModel";

export class ClientModel extends Model {
    static table = "clients";
    static associations: Associations = {
        services: { type: 'belongs_to', key: 'service_id' },
    }

    @field("name") name!: string;
    @field("contact") contact!: string | null;
    @field("image_url") image_url!: string | null;
    @field("address") address!: string | null;
    @field("email") email!: string | null;

    @readonly @date('created_at') createdAt!: number;

    @relation('services', 'service_id') service!: ServiceModel;
}