import React, { createContext, useState, useContext, useEffect } from "react";
import { ENCRYPTION_KEY } from "@env";

import { api } from "lib/axios";

// Types
import type { ProjectModel } from "database/models/project.model";

// Original base code by: https://github.com/LucasGarcez/react-native-auth-flow

export interface Account {
	id: string;

	email: string;
	password: string;
	image_url?: string;

	planExpiresAt?: string;

	name: string;
	phone: string;
	birthday: string;
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
	reactivating?: boolean;
}

type AuthContextData = {
	id?: string;
	selectedProjectId?: string;
	loading: boolean;
	signIn: (data: AuthData) => Promise<void>;
	signOut: () => void;
	updateSelectedProject: (
		projectId: string,
		project?: ProjectModel
	) => Promise<void>;
	verifyEmail: (email: string) => Promise<string>;
	verifyPassword: (password: string) => Promise<string>;
};

//Create the Auth Context with the data type specified
//and a empty object
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Initialize the MMKV Storage
import { MMKV } from "react-native-mmkv";
import { CustomException, safeJsonParse } from "utils";

export const globalStorage = new MMKV();

export const userStorage = new MMKV({
	id: "user",
	encryptionKey: ENCRYPTION_KEY,
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [id, setId] = useState<string | undefined>(undefined);
	const [selectedProjectId, setSelectedProjectId] = useState<
		string | undefined
	>(undefined);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Every time the App is opened, this provider is rendered
		// and call de loadStorage function.
		loadStorageData();
	}, []);

	async function loadStorageData(): Promise<void> {
		try {
			const id = userStorage.getString("id");
			if (!id) throw CustomException(409, "Invalid id stored in device.");

			const currentProjectId =
				globalStorage.getString("currentProjectId");

			const access_token = userStorage.getString("access_token");

			if (access_token) {
				api.defaults.headers.Authorization = `Bearer ${access_token}`;
				setId(id);
				setSelectedProjectId(currentProjectId);
			} else {
				setId(undefined);
				setSelectedProjectId(undefined);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	}

	const signIn = async (data: AuthData) => {
		try {
			// Login or create the account
			//console.log(data, "data");
			const response = await api.post("/accounts", {
				...data,
				reactivating: data.reactivating || false,
			});

			const access_token = response.data.access_token;

			// Set the access token in the api headers
			api.defaults.headers.Authorization = `Bearer ${access_token}`;
			userStorage.set("access_token", access_token);

			const account = response.data.body as Account;

			// Save the main user data in the device
			if (account.planExpiresAt)
				userStorage.set("planExpiresAt", account.planExpiresAt);

			userStorage.set("email", account.email);
			userStorage.set("password", account.password);

			userStorage.set("name", account.name);
			userStorage.set("phone", account.phone);
			userStorage.set("birthday", account.birthday);
			if (account.gender) {
				userStorage.set("gender", account.gender as string);
			}

			// Save the projects in the device
			if (account.projects.length > 0) {
				// We store a local cache copy of the projects for fast and optimistic project switching
				globalStorage.set("projects", JSON.stringify(account.projects));

				const newSelectedProjectId =
					account.selectedProjectId ?? account.projects[0].id;

				// We update the currentProjectId in the globalStorage
				globalStorage.set("currentProjectId", newSelectedProjectId);
				setSelectedProjectId(newSelectedProjectId);
			}

			// Não podemos atualizar o estado do "id" pois isso faria com que o SelectionStack fosse renderizado, e isso não é o que queremos
			// Somente atualizamos o valor do id no userStorage, e o resto é feito pelo loadStorageData
			userStorage.set("id", account.id);

			// Somente atualizamos o estado do "id" se o usuário estiver logando na conta sem projetos criados
			if (account.projects.length === 0 || !data.registerData) {
				setId(account.id);
			}
		} catch (error: any) {
			console.log(error, "erro");
			throw CustomException(
				error.response && error.response.data.statusCode,
				error.response && error.response.data.message.split("/")[1]
			);
		}
	};

	const signOut = async () => {
		// Remove data from context, so the App can be notified
		// and send the user to the AuthStack
		await setId(undefined);
		await setSelectedProjectId(undefined);
		await userStorage.clearAll();
		await globalStorage.clearAll();
	};

	const updateSelectedProject = async (
		projectId: string,
		newProject?: ProjectModel
	) => {
		const projectsString = globalStorage.getString("projects");
		const storageProjects = safeJsonParse(projectsString);

		// Caso o projeto tenha sido criado no momento, ele já foi adicionado ao servidor, então só precisamos atualizar o projeto localmente
		if (newProject) {
			const updatedProjects = [...(storageProjects || []), newProject];

			globalStorage.set("projects", JSON.stringify(updatedProjects));
			globalStorage.set("currentProjectId", projectId);
			setSelectedProjectId(projectId);
		} else {
			// Caso o projeto não seja novo, precisamos atualizar o projeto no servidor e localmente
			try {
				const accountId = userStorage.getString("id");

				// Checamos se o usuário está logado e se há projetos salvos em cache local
				if (!storageProjects || !accountId) {
					throw new Error("Erro ao atualizar o projeto selecionado");
				}

				// Update the selected project locally
				setSelectedProjectId(projectId);

				// Update the selected project id in the server
				api.patch(`/projects/${projectId}`, {
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

	const verifyEmail = async (email: string) => {
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

	const verifyPassword = async (password: string) => {
		try {
			const response = await api.post("/auth/verify/password", {
				password,
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
				id,
				selectedProjectId,
				loading,
				signIn,
				signOut,
				updateSelectedProject,
				verifyEmail,
				verifyPassword,
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
