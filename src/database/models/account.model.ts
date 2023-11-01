import { Model } from "@nozbe/watermelondb";

import {
    readonly,
    date,
    text,
    field,
    immutableRelation,
} from "@nozbe/watermelondb/decorators";

import { ProjectModel } from "./project.model";

type GENDER = "MALE" | "FEMALE" | "OTHER";

export class AccountModel extends Model {
    static table = "accounts";

    @text("email") email!: string;
    @text("password") password!: string;
    @text("image_url") image_url!: string | null;

    @text("name") name!: string;
    @text("phone") phone!: string | null;
    @text("birthday") birthday!: string | null;
    @field("gender") gender!: GENDER | null;

    @immutableRelation("projects", "project_id") project!: ProjectModel;

    // Subscription
    @field("subscription_id") subscription_id!: string | null;
    @date("subscription_expires_at") subscription_expires_at!: number | null;
    @field("is_recurring_payment_active") is_recurring_payment_active!: boolean;

    get isSubscribed() {
        return (
            this.subscription_id !== null &&
            this.subscription_expires_at !== null &&
            this.subscription_expires_at > Date.now()
        );
    }

    @readonly @date("created_at") createdAt!: Date;
    @readonly @date("updated_at") updatedAt!: Date;
}
