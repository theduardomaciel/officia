import { PortalHost } from "@gorhom/portal";
import { NavigationContainer } from "@react-navigation/native";

import { useAuth } from "context/AuthContext";

import { AppStack } from "./app.routes";
import { AuthStack } from "./auth.routes";
import { SelectionStack } from "./selection.routes";

export default function Routes() {
	const { id, selectedProjectId } = useAuth();

	return (
		<NavigationContainer>
			<PortalHost name="BottomSheetHost" />
			{selectedProjectId ? (
				<AppStack />
			) : id ? (
				<SelectionStack />
			) : (
				<AuthStack />
			)}
		</NavigationContainer>
	);
}
