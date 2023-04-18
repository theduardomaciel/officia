import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import { schemas } from "./schemas";

import { ServiceModel } from "./models/serviceModel";
import { SubServiceModel } from "./models/subServiceModel";
import { MaterialModel } from "./models/materialModel";
import { ClientModel } from "./models/clientModel";
import { ProjectModel } from "./models/projectModel";

const adapter = new SQLiteAdapter({
	schema: schemas,
});

export const database = new Database({
	adapter,
	modelClasses: [
		ServiceModel,
		SubServiceModel,
		MaterialModel,
		ClientModel,
		ProjectModel,
	],
});
