import React, { createContext, useState, useContext, useEffect } from "react";
import { ENCRYPTION_KEY } from "@env";

import { api } from "lib/axios";

// Types
import type { ProjectModel } from "database/models/projectModel";

// Original base code by: https://github.com/LucasGarcez/react-native-auth-flow

export interface Account {
	id: string;

	email: string;
	password: string;
	image_url?: string;

	plan: "free" | "premium";

	name: string;
	phone: string;
	birthday: Date;
	gender: GENDER;
	pin: string;

	selectedProjectId?: string;
	projects: ProjectModel[];
}

export type GENDER = "male" | "female" | "other";

export interface AuthData {
	email: Account["email"];
	password: Account["password"];
	registerData?: Partial<Account>;
}

type AuthContextData = {
	authData?: {
		id: string;
		selectedProjectId?: string;
	};
	loading: boolean;
	signIn: (data: AuthData) => Promise<void>;
	signOut: () => void;
	updateSelectedProject: (projectId: string) => Promise<void>;
	verify: (email: string) => Promise<string>;
};

//Create the Auth Context with the data type specified
//and a empty object
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Initialize the MMKV Storage
import { MMKV } from "react-native-mmkv";
import { CustomException } from "utils";

export const globalStorage = new MMKV();

export const userStorage = new MMKV({
	id: "user",
	encryptionKey: ENCRYPTION_KEY,
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [authData, setAuthData] = useState<
		AuthContextData["authData"] | undefined
	>(undefined);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Every time the App is opened, this provider is rendered
		// and call de loadStorage function.
		loadStorageData();
	}, []);

	async function loadStorageData(): Promise<void> {
		try {
			const id = userStorage.getString("user.id");
			if (!id) throw CustomException(409, "Invalid id stored in device.");

			const selectedProjectId =
				globalStorage.getString("selectedProjectId");

			setAuthData({ id, selectedProjectId });
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	}

	const signIn = async (data: AuthData) => {
		try {
			// Login or create the account
			console.log(data, "data");
			const response = await api.post("/accounts", {
				...data,
			});

			if (response.data) {
				const access_token = response.data.access_token;
				api.defaults.headers.Authorization = `Bearer ${access_token}`;

				const {
					id,
					selectedProjectId,
					plan,
					email,
					password,
					projects,
					...rest
				} = response.data.body as Account;

				console.log(response.data, "response.data");

				// Save the selected project in the device
				if (selectedProjectId) {
					globalStorage.set("selectedProjectId", selectedProjectId);
					globalStorage.set("projects", JSON.stringify(projects));

					// For performance sake, we save the current project in the device
					globalStorage.set(
						"currentProject",
						JSON.stringify(
							projects.find(
								(project) => project.id === selectedProjectId
							)
						)
					);
				}

				// Save the main user data in the device
				userStorage.set("user.id", id);
				userStorage.set("user.plan", plan as string);
				userStorage.set("user.email", email);
				userStorage.set("user.password", password);

				// Save the remaining user data in the device
				userStorage.set("user.data", JSON.stringify(rest));

				setAuthData({ id, selectedProjectId });
			} else {
				throw CustomException(500, "Erro desconhecido no servidor.");
			}
		} catch (error: any) {
			console.log(error);
			throw CustomException(
				error.response && error.response.data.statusCode
			);
		}
	};

	const signOut = async () => {
		// Remove data from context, so the App can be notified
		// and send the user to the AuthStack
		await setAuthData(undefined);
		await userStorage.clearAll();
	};

	const updateSelectedProject = async (
		projectId: string,
		newProject?: ProjectModel
	) => {
		const projectsString = globalStorage.getString("projects");
		let projects = projectsString
			? (JSON.parse(projectsString) as ProjectModel[])
			: undefined;

		// Caso o projeto seja novo, ele já foi adicionado ao servidor, então só precisamos atualizar o projeto localmente
		if (newProject) {
			projects = projects?.map((project) => {
				if (project.id === newProject.id) {
					return newProject;
				}
				return project;
			});
			globalStorage.set("projects", JSON.stringify(projects));
			setAuthData((prevData) =>
				prevData
					? { ...prevData, selectedProjectId: projectId }
					: undefined
			);
		} else {
			try {
				if (!projects) {
					throw new Error("Erro ao atualizar o projeto selecionado");
				}

				// Update the selected project id locally
				globalStorage.set("selectedProjectId", projectId);
				setAuthData((prevData) =>
					prevData
						? { ...prevData, selectedProjectId: projectId }
						: undefined
				);

				// Update the selected project id in the server
				api.patch("/accounts", {
					selectedProjectId: projectId,
				})
					.then(() => {
						console.log(
							"Projeto selecionado atualizado com sucesso"
						);
					})
					.catch((error) => {
						console.log(
							error,
							"Erro ao atualizar o projeto selecionado"
						);
						//throw new Error("Erro ao atualizar o projeto selecionado");
					});
			} catch (error) {
				console.log(error);
				throw new Error(error as string);
			}
		}
	};

	const verify = async (email: string) => {
		try {
			const response = await api.post("/auth/verify/email", {
				email,
			});
			return response.data;
		} catch (error) {
			console.log(error);
			throw new Error(error as string);
		}
	};

	return (
		//This component will be used to encapsulate the whole App,
		//so all components will have access to the Context
		<AuthContext.Provider
			value={{
				authData,
				loading,
				signIn,
				signOut,
				updateSelectedProject,
				verify,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

// A simple hooks to facilitate the access to the AuthContext
// and permit components to subscribe to AuthContext updates
function useAuth(): AuthContextData {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}

export { AuthContext, AuthProvider, useAuth };
