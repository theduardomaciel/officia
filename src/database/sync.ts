import { synchronize } from "@nozbe/watermelondb/sync";
import { database } from "./index.native";

async function syncApp() {
    await synchronize({
        database: database,
        pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
            const urlParams = `last_pulled_at=${lastPulledAt}&schema_version=${schemaVersion}&migration=${encodeURIComponent(
                JSON.stringify(migration)
            )}`;
            const response = await fetch(
                `https://my.backend/sync?${urlParams}`
            );
            if (!response.ok) {
                throw new Error(await response.text());
            }

            const { changes, timestamp } = await response.json();
            return { changes, timestamp };
        },
        pushChanges: async ({ changes, lastPulledAt }) => {
            const response = await fetch(
                `https://my.backend/sync?last_pulled_at=${lastPulledAt}`,
                {
                    method: "POST",
                    body: JSON.stringify(changes),
                }
            );
            if (!response.ok) {
                throw new Error(await response.text());
            }
        },
        migrationsEnabledAtVersion: 1,
    });
}
