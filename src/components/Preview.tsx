import { useRef } from "react";
import { Animated, View, Text } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { TouchableOpacity } from "react-native-gesture-handler";

import clsx from "clsx";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

import { ProductModel } from "database/models/productModel";
import { MaterialModel } from "database/models/materialModel";

// Tyoes
import type { Category } from "screens/Main/Business/@types";

const Category = ({ category }: { category: Category }) => (
	<>
		<MaterialIcons
			name={category.icon as unknown as any}
			size={12}
			color={colors.white}
			style={{ marginRight: 5 }}
		/>
		<Text className="font-semibold text-black dark:text-white text-xs mr-1">
			{category.name}
		</Text>
	</>
);

interface PreviewStatic {
	product?: ProductModel;
	material?: MaterialModel;
	palette?: "light";
	hasBorder?: boolean;
	padding?: "small";
	onPress?: () => void;
}

export const PreviewStatic = ({
	onPress,
	product,
	material,
	palette,
	hasBorder,
	padding,
}: PreviewStatic) => {
	if (!product && !material) return null;

	return (
		<TouchableOpacity
			className={clsx(
				"flex-row items-center justify-between w-full dark:bg-gray-300 rounded-sm p-3",
				{
					"bg-gray-200": palette === "light",
					"py-2": padding === "small",
					"border border-gray-100": hasBorder,
				}
			)}
			onPress={onPress}
			activeOpacity={onPress ? 0.7 : 1}
		>
			<View className="flex-1 flex-col items-start justify-center gap-y-2 mr-3">
				<Text className="font-bold text-[15px] leading-none text-white">
					{product?.description || material?.name}
				</Text>
				<View className="flex-row">
					{product?.types && product.types.length > 0 && (
						<Category
							category={
								product.types?.length > 1
									? ({
											icon: "build",
											name: "Várias categorias",
									  } as Category)
									: product.types[0]
							}
						/>
					)}
					{material && (
						<Text className="font-semibold text-black dark:text-white text-xs mr-1">
							{`${
								material?.availability === true
									? "Fornecido como cortesia"
									: "Custo do cliente"
							}`}
						</Text>
					)}
					<Text className="text-white text-xs">
						(x{product?.amount || material?.amount})
					</Text>
				</View>
			</View>
			<View
				className={clsx("px-3 py-1 rounded-full", {
					"bg-primary": product?.price || material?.price,
					"bg-primary-red": material?.availability === true,
				})}
			>
				<Text className="font-bold text-xs text-white">
					R$ {product?.price || material?.price}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

interface PreviewProps {
	material?: MaterialModel;
	product?: ProductModel;
	onDelete: () => void;
	onEdit: () => void;
}

export function Preview({ material, product, onDelete, onEdit }: PreviewProps) {
	const swipeableRef = useRef<any>(null);

	function deletePreview() {
		if (swipeableRef.current) {
			swipeableRef.current.close();
		}
		onDelete();
		//console.log('deletePreOrder')
	}

	function editPreview() {
		if (swipeableRef.current) {
			swipeableRef.current.close();
		}
		onEdit();
		//console.log('editPreOrder')
	}

	return (
		<Swipeable
			ref={swipeableRef}
			friction={1.25}
			leftThreshold={10}
			rightThreshold={10}
			enableTrackpadTwoFingerGesture
			renderRightActions={(progress, dragX) => (
				<Action
					onPress={deletePreview}
					progress={progress}
					dragX={dragX}
					direction="right"
					type="delete"
				/>
			)}
			renderLeftActions={(progress, dragX) => (
				<Action
					onPress={editPreview}
					progress={progress}
					dragX={dragX}
					direction="left"
					type="edit"
				/>
			)}
		>
			<PreviewStatic material={material} product={product} />
		</Swipeable>
	);
}

interface Action {
	onPress: () => void;
	progress: any;
	dragX: any;
	direction: "left" | "right";
	type: "delete" | "edit";
}

const Action = ({ onPress, dragX, direction, type }: Action) => {
	const scale = dragX.interpolate({
		inputRange: [0, 50, 100, 101],
		outputRange: [-20, 0, 0, 1],
	});
	return (
		<TouchableOpacity
			className={clsx(
				"flex-row items-center flex-1 w-16 justify-center",
				{
					"rounded-tr-sm rounded-br-sm": direction === "right",
					"rounded-tl-sm rounded-bl-sm": direction === "left",
					"bg-primary-red": type === "delete",
					"bg-primary-blue": type === "edit",
				}
			)}
			onPress={onPress}
		>
			<MaterialIcons
				name={type === "delete" ? "delete" : "edit"}
				size={24}
				color={colors.white}
			/>
			<Animated.View style={{ transform: [{ scale }] }} />
		</TouchableOpacity>
	);
};
