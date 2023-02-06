import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import { schemas } from "./schemas";
import { ServiceModel } from "./models/serviceModel";

const adapter = new SQLiteAdapter({
    dbName: "officia",
    schema: schemas,
});

export const database = new Database({
    adapter,
    modelClasses: [ServiceModel],
});