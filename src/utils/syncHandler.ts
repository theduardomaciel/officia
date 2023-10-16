import { synchronize } from "@nozbe/watermelondb/sync";
import { globalStorage } from "context/AuthContext";
import { database } from "database/index.native";
import { api } from "lib/axios";

export async function synchronization() {
	await synchronize({
		database,
		pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
			try {
				const response = await api.get(
					`/sync?last_pulled_at=${lastPulledAt}&schema_version=${schemaVersion}&migration=${encodeURIComponent(
						JSON.stringify(migration)
					)}`
				);

				const { changes, timestamp } = await response.data;

				// Atualizamos os dados dos projetos localmente com os dados obtidos no servidor
				if (changes.updated?.length > 0) {
					if (changes.updated.projects) {
						await globalStorage.set(
							"projects",
							changes.updated.projects
						);
					}
				}

				return { changes, timestamp };
			} catch (error: any) {
				throw new Error(await error);
			}
		},
		pushChanges: async ({ changes, lastPulledAt }) => {
			try {
				await api.post(`/sync?last_pulled_at=${lastPulledAt}`, changes);
			} catch (error: any) {
				console.log(error);
				throw new Error(await error);
			}
		},
		migrationsEnabledAtVersion: 1,
	});
}
