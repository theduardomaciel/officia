import { useState } from "react";
import { OrderModel } from "database/models/order.model";
import {
	TouchableOpacity,
	View,
	Text,
	TouchableOpacityProps,
	ViewStyle,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

import { ProductModel } from "database/models/product.model";
import { Preview, PreviewStatic } from "./Preview";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

interface Container extends TouchableOpacityProps {
	children: React.ReactNode;
}

const Container = ({ children, ...rest }: Container) => (
	<TouchableOpacity
		className="w-full flex flex-row items-center justify-between mb-2 py-2"
		accessible
		activeOpacity={0.75}
		accessibilityRole="button"
		{...rest}
	>
		{children}
	</TouchableOpacity>
);

const MainInfo = ({
	order,
	products,
}: {
	order: OrderModel;
	products?: ProductModel[];
}) => (
	<View className="flex-col items-start justify-start flex flex-1 mr-4">
		<Text className="font-titleSemiBold text-base text-black dark:text-white leading-none">
			{order.name}
		</Text>
		<Text className="leading-tight font-regular text-xs text-gray-100">
			{products && products?.length > 0 ? (
				<>
					{products?.length} subserviço
					{products?.length !== 1 ? "s" : ""}{" "}
					{order.client.name ? "para" : ""}
					<Text className="font-titleSemiBold text-base text-black dark:text-white">
						{order.client.name ? order.client.name : ""}
					</Text>
				</>
			) : (
				"Nenhum subserviço adicionado"
			)}
		</Text>
	</View>
);

const Line = () => (
	<View className="h-full max-h-8 opacity-60 border-[0.5px] border-dashed border-text-100 mr-4" />
);

const InfoHolderLeft = ({
	children,
	width,
}: {
	children: React.ReactNode;
	width?: number;
}) => (
	<View
		className="flex items-center justify-center mr-2"
		style={{ minWidth: width ?? 35 }}
	>
		{children}
	</View>
);

const InfoHolderRight = ({
	children,
	onPress,
}: {
	children: React.ReactNode;
	onPress?: () => void;
}) => (
	<TouchableWithoutFeedback onPress={onPress}>
		<View className="relative min-w-8 flex items-end justify-center">
			{children}
		</View>
	</TouchableWithoutFeedback>
);

export interface OrderPreviewProps {
	order: OrderModel;
	products?: ProductModel[];
	onPress: () => void;
	additionalInfo: "day" | "date" | "time";
}

const specialStyle = {
	borderColor: colors.primary,
	borderWidth: 1,
	borderRadius: 5,
	paddingHorizontal: 10,
	paddingVertical: 5,
	borderStyle: "dashed",
} as ViewStyle;

export default function OrderPreview({
	order,
	products,
	onPress,
	additionalInfo,
}: OrderPreviewProps) {
	const orderTypes = products?.map((product) => product.types).flat();
	const orderTypesIcon =
		orderTypes && orderTypes?.length > 0 && orderTypes[0].icon;

	const currentDate = new Date();
	const orderDate = new Date(order.date);
	const infoContainers = {
		day:
			orderDate.getDate() === currentDate.getDate()
				? "hoje"
				: orderDate.getDate() === currentDate.getDate() + 1
				? "amanhã"
				: orderDate
						.toLocaleDateString("pt-BR", { weekday: "long" })
						.split(", ")[0]
						.split("-")[0],
		date: orderDate.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
		}),
		time: orderDate.toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		}),
	};

	return (
		<Container
			style={
				orderDate.getDate() === currentDate.getDate() && specialStyle
			}
			onPress={onPress}
		>
			{orderTypes && (
				<InfoHolderLeft>
					<MaterialIcons
						name={
							orderTypes.length > 1
								? "api"
								: orderTypesIcon
								? (orderTypesIcon as unknown as any)
								: "hourglass-empty"
						}
						size={32}
						color={colors.text[100]}
					/>
				</InfoHolderLeft>
			)}
			<Line />
			<MainInfo order={order} products={products} />
			<InfoHolderRight>
				{/* <Text className='absolute font-black text-[42px] opacity-20 flex-nowrap whitespace-nowrap text-text_light-100 dark:text-white'>
                    R$
                </Text> */}
				<View className="absolute m-auto opacity-20 justify-center items-center top-0 left-0 right-0 bottom-0">
					<MaterialIcons
						name={
							additionalInfo === "time"
								? "alarm"
								: "calendar-today"
						}
						size={28}
						color={colors.white}
					/>
				</View>
				<Text className="font-black text-2xl text-black dark:text-white">
					{
						infoContainers[
							additionalInfo as keyof typeof infoContainers
						]
					}
				</Text>
			</InfoHolderRight>
		</Container>
	);
}

interface OrderWithProductsPreviewProps {
	order: OrderPreviewProps["order"];
	products?: OrderPreviewProps["products"];
	onPress: OrderPreviewProps["onPress"];
}

export function OrderWithProductsPreview({
	order,
	products,
	onPress,
}: OrderWithProductsPreviewProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const earnings =
		products &&
		products?.map((product) => product.price).reduce((a, b) => a + b, 0);

	return (
		<View className="flex-col w-full items-center justify-between">
			<Container>
				<TouchableOpacity
					activeOpacity={0.8}
					className="flex-row h-full flex-1"
					onPress={onPress}
				>
					<InfoHolderLeft width={50}>
						<Text className="absolute font-black text-[42px] opacity-20 flex-nowrap whitespace-nowrap text-text_light-100 dark:text-white">
							R$
						</Text>
						<Text
							className="font-black text-2xl flex-nowrap whitespace-nowrap text-black dark:text-white"
							numberOfLines={1}
						>
							{earnings}
						</Text>
					</InfoHolderLeft>
					<Line />
					<MainInfo order={order} products={products} />
				</TouchableOpacity>
				{products && products?.length > 0 && (
					<InfoHolderRight onPress={() => setIsExpanded(!isExpanded)}>
						<MaterialIcons
							name={"keyboard-arrow-down"}
							style={{
								transform: isExpanded
									? [{ rotate: "180deg" }]
									: [{ rotate: "0deg" }],
								paddingLeft: isExpanded ? 0 : 15,
								paddingRight: isExpanded ? 15 : 0,
							}}
							size={16}
							color={colors.text[100]}
						/>
					</InfoHolderRight>
				)}
			</Container>
			{isExpanded &&
				products &&
				products?.map((product) => (
					<View className="mb-3" key={product.id}>
						<PreviewStatic
							palette="light"
							padding="small"
							product={product}
						/>
					</View>
				))}
		</View>
	);
}
