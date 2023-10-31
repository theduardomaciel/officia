import React, { createContext, useState, useContext, useEffect } from "react";
import { ENCRYPTION_KEY } from "@env";

import { api } from "lib/axios";

// Utils
import { CustomException, safeJsonParse } from "utils";
import type { ProjectModel } from "database/models/project.model";

// Original base code by: https://github.com/LucasGarcez/react-native-auth-flow

export type GENDER = "male" | "female" | "other";

export interface Account {
    id: string;
    projectId?: string;

    email: string;
    password: string;
    planExpiresAt?: string;
    image_url?: string;

    name: string;
    phone: string;
    birthday: string;
    gender: GENDER;
}

export interface AuthData {
    email: Account["email"];
    password: Account["password"];
    registerData?: Account;
}

interface AuthResponse {
    access_token: string;
    account: Account & { project: ProjectModel };
}

type AuthContextData = {
    id?: string;
    isLoading: boolean;
    signIn: (data?: AuthData) => Promise<void>;
    signOut: () => void;
    verifyEmail: (email: string) => Promise<string>;
    verifyPassword: (password: string) => Promise<string>;
};

// Create the Auth Context with the data type specified and a empty object
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Initialize the MMKV Storage
import { MMKV } from "react-native-mmkv";

export const userStorage = new MMKV({
    id: "user",
    encryptionKey: ENCRYPTION_KEY,
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [id, setId] = useState<string | undefined>(undefined);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        // Every time the App is opened, this provider is rendered
        // and the loadStorage function is called.
        loadStorageData();
    }, []);

    async function loadStorageData(): Promise<void> {
        try {
            const id = userStorage.getString("id");

            if (!id)
                throw CustomException(
                    409,
                    "Invalid id stored in device. User is not logged."
                );

            const access_token = userStorage.getString("access_token");

            if (access_token) {
                api.defaults.headers.Authorization = `Bearer ${access_token}`;
                setId(id);
            } else {
                setId(undefined);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const signIn = async (data?: AuthData) => {
        if (!data) {
            console.warn("Logando como convidado");

            setId("guest");
            userStorage.set("id", "guest");

            return;
        }

        try {
            // Login or create the account
            // console.log(data, "data");

            const response = (await api.post("/accounts", {
                ...data,
            })) as { data: AuthResponse };

            const { access_token, account } = response.data;

            // Set the access token in the api headers
            api.defaults.headers.Authorization = `Bearer ${access_token}`;
            userStorage.set("access_token", access_token);

            // Save the main user data in the device
            if (account.planExpiresAt)
                userStorage.set("planExpiresAt", account.planExpiresAt);

            userStorage.set("email", account.email);
            userStorage.set("id", account.id);

            setId(account.id); // Enviamos o usuário para a stack do App
        } catch (error: any) {
            console.log("Erro ao logar: ", error);
            throw CustomException(
                error.response && error.response.data.statusCode,
                error.response && error.response.data.message.split("/")[1]
            );
        }
    };

    const signOut = async () => {
        // Remove data from context, so the App can be notified and send the user to the AuthStack
        await setId(undefined);
        await userStorage.clearAll();
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
        // This component will be used to encapsulate the whole App, so all components will have access to the Context
        <AuthContext.Provider
            value={{
                id,
                isLoading,
                signIn,
                signOut,
                verifyEmail,
                verifyPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// A simple hooks to facilitate the access to the AuthContext and permit components to subscribe to AuthContext updates
function useAuth(): AuthContextData {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}

export { AuthContext, AuthProvider, useAuth };
