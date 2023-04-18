import { appSchema } from "@nozbe/watermelondb";

import { serviceSchema } from "./serviceSchema";
import { subServiceSchema } from "./subServiceSchema";
import { materialSchema } from "./materialSchema";
import { clientSchema } from "./clientSchema";
import { projectSchema } from "./projectSchema";

export const schemas = appSchema({
	version: 24,
	tables: [
		serviceSchema,
		subServiceSchema,
		materialSchema,
		clientSchema,
		projectSchema,
	],
});
