import { TouchableOpacity, View, Text } from "react-native";
import { Image } from "expo-image";

import * as ExpoImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

// Visuals
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import colors from "global/colors";

// Types
import type { BusinessData } from "screens/Main/Business/@types";

interface Props {
	imageUri?: string;
	onUpdate: (imageUri: string | undefined) => void;
	showDeleteButton?: boolean;
	label: string;
}

export default function ImagePicker({
	imageUri,
	onUpdate,
	showDeleteButton,
	label,
}: Props) {
	const { colorScheme } = useColorScheme();

	async function getBusinessLogo() {
		const result = await ExpoImagePicker.launchImageLibraryAsync({
			mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			/* aspect: [1, 1], */
			/* quality: 1, */
		});

		if (result.assets) {
			const { uri } = result.assets[0];
			//console.log("Nova imagem selecionada ", uri)
			onUpdate(uri);
		}
	}

	async function removeBusinessLogo() {
		if (imageUri) {
			FileSystem.deleteAsync(imageUri, { idempotent: true });
			onUpdate(undefined);
		}
	}

	return (
		<View
			className="flex-col items-start justify-center"
			style={{ rowGap: 10 }}
		>
			<TouchableOpacity
				activeOpacity={0.8}
				className="w-full flex-col items-center justify-center border"
				style={{
					paddingTop: imageUri ? 0 : 50,
					paddingBottom: imageUri ? 0 : 50,
					paddingLeft: imageUri ? 20 : 50,
					paddingRight: imageUri ? 20 : 50,
					borderRadius: 8,
					borderColor: colors.primary,
					borderWidth: 1,
					borderStyle: "dashed",
				}}
				onPress={getBusinessLogo}
			>
				{imageUri ? (
					<Image
						source={{ uri: imageUri }}
						style={{ width: "100%", height: 200 }}
						contentFit="contain"
						transition={1000}
					/>
				) : (
					<>
						<MaterialIcons
							name="add-photo-alternate"
							size={32}
							color={
								colorScheme === "dark"
									? colors.white
									: colors.black
							}
						/>
						<Text className="font-medium text-sm text-black dark:text-white">
							{label}
						</Text>
					</>
				)}
			</TouchableOpacity>
			{showDeleteButton && imageUri && (
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={removeBusinessLogo}
				>
					<Text className="font-medium text-sm text-red">
						Remover logotipo da empresa
					</Text>
				</TouchableOpacity>
			)}
		</View>
	);
}
