import { View } from "react-native";

import colors from "global/colors";

// Components
import BottomSheet, { BottomSheetProps } from "components/BottomSheet";
import { ActionButton } from "components/Button";

interface AccountEditLayoutProps {
	children: React.ReactNode;
	id: BottomSheetProps["id"];
	label: string;
	isLoading: boolean;
	handleEdit: () => void;
	currentData?: string;
	data: string;
}

export default function AccountEditLayout({
	children,
	id,
	label,
	isLoading,
	handleEdit,
	currentData,
	data,
}: AccountEditLayoutProps) {
	return (
		<>
			<BottomSheet.Title>Alterar {label}</BottomSheet.Title>
			{children}
			<View className="w-full flex-col items-start justify-start gap-y-3">
				<ActionButton
					style={{
						backgroundColor: colors.gray[100],
						opacity: isLoading ? 0.5 : 1,
					}}
					disabled={isLoading}
					onPress={() => BottomSheet.close(id)}
					label="Cancelar"
				/>
				<ActionButton
					onPress={handleEdit}
					disabled={isLoading || data === currentData}
					isLoading={isLoading}
					label={`Alterar ${label}`}
				/>
			</View>
		</>
	);
}
