import { Model } from "@nozbe/watermelondb";
import { field, readonly, date, children, relation } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { ClientModel } from "./clientModel";
import { MaterialModel } from "./materialModel";
import { SubServiceModel } from "./subServiceModel";

export class ServiceModel extends Model {
    static table = "services";
    static associations: Associations = {
        sub_services: { type: "has_many", foreignKey: "service_id" },
        materials: { type: "has_many", foreignKey: "service_id" },
    }

    @field("name") name!: string;
    @date("date") date!: string;
    @field("status") status!: string;
    @readonly @date('created_at') createdAt!: number;

    @children("sub_services") subServices!: SubServiceModel[];
    @children("materials") materials!: MaterialModel[];
    @relation("client", "service_id") client!: ClientModel;
}