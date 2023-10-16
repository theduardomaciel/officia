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
	onUpdate?: (imageUri: string | undefined) => void;
	onPress?: () => void;
	showDeleteButton?: boolean;
	label: string;
}

export default function ImagePicker({
	imageUri,
	onUpdate,
	onPress,
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
			onUpdate && onUpdate(uri);
		}
	}

	async function removeBusinessLogo() {
		if (imageUri) {
			FileSystem.deleteAsync(imageUri, { idempotent: true });
			onUpdate && onUpdate(undefined);
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
					paddingTop: imageUri ? 0 : 0,
					paddingBottom: imageUri ? 0 : 0,
					paddingLeft: imageUri ? 20 : 0,
					paddingRight: imageUri ? 20 : 0,
					borderRadius: 8,
					borderColor: colors.primary,
					borderWidth: 1,
					borderStyle: "dashed",
				}}
				onPress={onPress ?? getBusinessLogo}
			>
				{imageUri ? (
					<Image
						source={{ uri: imageUri }}
						style={{ width: "100%", height: 200 }}
						contentFit="contain"
						transition={1000}
					/>
				) : (
					<View className="w-full h-[165px] items-center justify-center relative flex-col">
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
						<Image
							source={require("src/assets/images/pattern_rectangle.png")}
							style={{
								width: "100%",
								height: "100%",
								position: "absolute",
								top: 0,
								left: 0,
								opacity: 0.35,
							}}
							contentFit="cover"
						/>
					</View>
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
