import { TextInput, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

export interface SearchBarProps {
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	onSubmit?: () => void;
	palette?: "dark";
}

export default function SearchBar({
	placeholder,
	value,
	onChange,
	onSubmit,
	palette,
}: SearchBarProps) {
	return (
		<View
			className="flex flex-row w-full h-10"
			style={{ position: "relative" }}
		>
			<TextInput
				className="flex flex-1 flex-row bg-gray-200 p-2 rounded-lg pl-12 text-text-100"
				style={{
					backgroundColor:
						palette === "dark"
							? colors.gray[300]
							: colors.gray[200],
				}}
				value={value}
				onChangeText={onChange}
				onSubmitEditing={onSubmit}
				placeholderTextColor={colors.text[200]}
				cursorColor={colors.primary}
				placeholder={placeholder ?? "Buscar"}
			/>
			<MaterialIcons
				name="search"
				style={{ position: "absolute", top: 10, left: 15 }}
				size={18}
				color={colors.text[100]}
			/>
		</View>
	);
}
