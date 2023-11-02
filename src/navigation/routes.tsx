import { PortalHost } from "@gorhom/portal";
import { NavigationContainer } from "@react-navigation/native";

import { useAuth } from "context/AuthContext";

import { AppStack } from "./app.routes";
import { AuthStack } from "./auth.routes";

export default function Routes() {
    const { id } = useAuth();

    return (
        <NavigationContainer>
            <PortalHost name="BottomSheetHost" />
            {id ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
}
