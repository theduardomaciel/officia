import { Model } from "@nozbe/watermelondb";
import { field, readonly, date, relation } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { ServiceModel } from "./serviceModel";

export class ClientModel extends Model {
    static table = "materials";

    @field("name") name!: string;
    @field("phone") phone!: string | null;
    @field("image_url") image_url!: string | null;
    @field("address") address!: string | null;
    @field("email") email!: string | null;

    @field("service_id") service_id!: string | null;
    @readonly @date('created_at') createdAt!: number;
}