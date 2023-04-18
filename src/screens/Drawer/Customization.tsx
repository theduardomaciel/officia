import React from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	FlatList,
} from "react-native";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container from "components/Container";
import Header from "components/Header";
import NavigationButton from "components/NavigationButton";
import Modal from "components/Modal";

const DOCUMENTS_COLORS = [
	{
		name: "red",
		color: "#c73b3b",
	},
	{
		name: "blue",
		color: "#3b7ac7",
	},
	{
		name: "green",
		color: "#6cbe45",
	},
	{
		name: "yellow",
		color: "#e6f242",
	},
	{
		name: "purple",
		color: "#753bc7",
	},
	{
		name: "orange",
		color: "#c76e3b",
	},
	{
		name: "pink",
		color: "#c73bbe",
	},
	{
		name: "gray",
		color: colors.gray[500],
	},
] as const;

export default function CustomizationScreen() {
	const [isDocumentsColorModalVisible, setDocumentsColorModalVisible] =
		React.useState(false);

	const [selectedColor, setSelectedColor] = React.useState(
		DOCUMENTS_COLORS[DOCUMENTS_COLORS.length - 1].color
	);

	return (
		<Container>
			<Header title="Customização" returnButton />
			<NavigationButton
				title="Cor dos Documentos"
				description="Escolha uma cor para adequar os documentos gerados à identidade visual de sua marca"
				onPress={() => setDocumentsColorModalVisible(true)}
			>
				<View
					className="rounded-full w-10 h-10"
					style={{
						backgroundColor: selectedColor,
					}}
				/>
			</NavigationButton>
			<Modal
				isVisible={isDocumentsColorModalVisible}
				toggleVisibility={() => setDocumentsColorModalVisible(false)}
				title="Selecione a cor dos documentos"
				icon="palette"
				buttons={[
					{
						label: "Confirmar",
						onPress: async () => {
							console.log("Confirmar");
						},
						closeOnPress: true,
					},
				]}
				cancelButton
			>
				<FlatList
					data={DOCUMENTS_COLORS}
					className="w-full"
					contentContainerStyle={{
						rowGap: 10,
						columnGap: 10,
						paddingVertical: 15,
					}}
					renderItem={({ item }) => (
						<ColorItem
							color={item.color}
							isSelected={item.color === selectedColor}
							onPress={() => setSelectedColor(item.color)}
						/>
					)}
					numColumns={4}
					columnWrapperStyle={{
						rowGap: 10,
						columnGap: 10,
						justifyContent: "space-between",
					}}
				/>
			</Modal>
		</Container>
	);
}

interface ColorItemProps {
	color: string;
	isSelected?: boolean;
	onPress: () => void;
}

const ColorItem = ({ color, isSelected, onPress }: ColorItemProps) => {
	return (
		<TouchableOpacity
			onPress={onPress}
			className="rounded-full w-10 h-10"
			activeOpacity={0.6}
			style={{
				backgroundColor: color,
				borderWidth: 3,
				borderColor: isSelected ? colors.white : "transparent",
			}}
		/>
	);
};
