import { PortalHost } from "@gorhom/portal";
import { NavigationContainer } from "@react-navigation/native";
import { AppRoutes } from "./app.routes";

export default function Routes() {
    return (
        <NavigationContainer>
            <PortalHost name="BottomSheetHost" />
            <AppRoutes />
        </NavigationContainer>
    )
}