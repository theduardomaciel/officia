import { Model } from "@nozbe/watermelondb";
import {
    field,
    readonly,
    date,
    relation,
    json,
    text,
} from "@nozbe/watermelondb/decorators";

// Types
import type { ProjectModel } from "./project.model";

function sanitizeJSON(rawJSON: any) {
    return Array.isArray(rawJSON) ? rawJSON.map(String) : [];
}

export class MarketplaceModel extends Model {
    static table = "marketplaces";

    @text("at") at!: string;
    @text("slogan") slogan!: string | null;
    @text("description") description!: string | null;
    @field("is_enabled") isEnabled!: boolean;

    @json("business_models", sanitizeJSON) businessModels!: string[];
    @json("agenda", sanitizeJSON) agenda!: string[];

    @field("auto_holiday_unavailability") autoHolidayUnavailability!: boolean;
    @field("busy_amount") busyAmount!: number;
    @field("unavailable_amount") unavailableAmount!: number;

    @json("service_zone_countries", sanitizeJSON)
    serviceZoneCountries!: string[];
    @json("service_zone_states", sanitizeJSON) serviceZoneStates!: string[];
    @json("service_zone_cities", sanitizeJSON) serviceZoneCities!: string[];

    @relation("projects", "project_id") project!: ProjectModel;

    @readonly @date("created_at") createdAt!: number;
    @readonly @date("updated_at") updatedAt!: Date;
}
