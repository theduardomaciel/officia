import { Model } from "@nozbe/watermelondb";
import { field, readonly, date } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";

export class ServiceModel extends Model {
    static table = "services";
    static associations: Associations = {
        sub_services: { type: "has_many", foreignKey: "service_id" },
        materials: { type: "has_many", foreignKey: "service_id" },
    }

    @readonly @date('created_at') createdAt!: number;
    @field("name") name!: string;
    @field("sub_services") subServices!: string;
    @field("materials") materials!: string;
    @field("status") status!: string;
    @date("date") date!: string;
    @field("client") client!: string;
}