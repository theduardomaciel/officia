import { Model } from "@nozbe/watermelondb";
import { field, readonly, date, relation, json } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { ServiceModel } from "./serviceModel";

// Category
import { Category } from "screens/Main/Business/@types";

const sanitizeTypes = (json: Category) => json;

export class SubServiceModel extends Model {
    static table = "sub_services";
    static associations: Associations = {
        services: { type: 'belongs_to', key: 'service_id' },
    }

    @field("description") description!: string;
    @field("details") details!: string | null;
    @json("types", sanitizeTypes) types!: Category[];
    @field("price") price!: number;
    @field("amount") amount!: number;
    @field("saved") saved!: boolean;

    @readonly @date('created_at') createdAt!: number;
    @relation('services', 'service_id') service!: ServiceModel;
}