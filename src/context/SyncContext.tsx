import React, { createContext, useState, useContext, useEffect } from "react";
import { api } from "lib/axios";

// Types
import type { ProjectModel } from "database/models/project.model";

type SyncContextData = {};

//Create the Sync Context with the data type specified
//and a empty object
const SyncContext = createContext<SyncContextData>({} as SyncContextData);

const SyncProvider = ({ children }: { children: React.ReactNode }) => {
	useEffect(() => {
		// Every time the App is opened, this provider is rendered
		// and call de loadStorage function.
		synchronize();
	}, []);

	async function synchronize(): Promise<void> {
		try {
		} catch (error) {
			console.log(error);
		}
	}

	async function addToQueue() {}

	return (
		//This component will be used to encapsulate the whole App,
		//so all components will have access to the Context
		<SyncContext.Provider
			value={{
				synchronize,
			}}
		>
			{children}
		</SyncContext.Provider>
	);
};

function useSync(): SyncContextData {
	const context = useContext(SyncContext);

	if (!context) {
		throw new Error("useSync must be used within an SyncProvider");
	}

	return context;
}

export { SyncContext, SyncProvider, useSync };
