import { database } from "database/index.native";
import { ProjectModel } from "database/models/projectModel";
import React, { createContext, useState, useContext, useEffect } from "react";

// Original code by: https://github.com/LucasGarcez/react-native-auth-flow

export interface Account {
	email: string;
	password: string;
	image_url?: string;

	name: string;
	phone: string;
	birthday: Date;
	gender: GENDER;
	pin: string;

	projects: ProjectModel[];
}

export type GENDER = "masculine" | "feminine" | "other";

export interface AuthData {
	email: string;
	password: string;
	registerData?: {
		name: string;
		phone: string;
		birthday: string;
		cpf: string;
		gender: GENDER;
	};
}

type AuthContextData = {
	authData?: AuthData;
	loading: boolean;
	signIn: (data: AuthData) => Promise<void>;
	signOut: () => void;
};

//Create the Auth Context with the data type specified
//and a empty object
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [authData, setAuthData] = useState<AuthData>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Every time the App is opened, this provider is rendered
		// and call de loadStorage function.
		loadStorageData();
	}, []);

	async function loadStorageData(): Promise<void> {
		try {
			const data = (await database.localStorage.get(
				"businessData"
			)) as AuthData;
			if (data) {
				setAuthData(data);
			}
		} catch (error) {
			// console.log(error);
		} finally {
			setLoading(false);
		}
	}

	const signIn = async (data: AuthData) => {
		setAuthData(data);
		await database.localStorage.set("businessData", data);
	};

	const signOut = async () => {
		// Remove data from context, so the App can be notified
		// and send the user to the AuthStack
		setAuthData(undefined);
		database.localStorage.remove("businessData");
	};

	return (
		//This component will be used to encapsulate the whole App,
		//so all components will have access to the Context
		<AuthContext.Provider value={{ authData, loading, signIn, signOut }}>
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
