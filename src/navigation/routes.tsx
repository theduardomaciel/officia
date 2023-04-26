import { PortalHost } from "@gorhom/portal";
import { NavigationContainer } from "@react-navigation/native";

import { useAuth } from "context/AuthContext";

import { AppStack } from "./app.routes";
import { AuthStack } from "./auth.routes";

export default function Routes() {
	const { authData } = useAuth();

	return (
		<NavigationContainer>
			<PortalHost name="BottomSheetHost" />
			{authData?.id && authData.selectedProjectId ? (
				<AppStack />
			) : (
				<AuthStack />
			)}
		</NavigationContainer>
	);
}
