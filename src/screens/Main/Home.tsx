import React, { useCallback, useEffect, useState } from "react";
import { SectionList, Text, TouchableOpacity, View } from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

import Animated, { FadeInUp, FadeOutUp, Layout } from "react-native-reanimated";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container from "components/Container";
import { TabBarScreenHeader } from "components/Header";
import Toast from "components/Toast";
import OrderPreview from "components/OrderPreview";

import Calendar, { WeekDays, WeekView } from "components/Calendar";
import { Empty, Loading } from "components/StatusMessage";
import { Tag, TagObject, TagsSelector } from "components/TagsSelector";

// Database
import { Q } from "@nozbe/watermelondb";
import { database } from "database/index.native";

// Types
import type { OrderModel } from "database/models/order.model";
import type { ProductModel } from "database/models/product.model";
import type { BusinessData, Category } from "screens/Main/Business/@types";

export const FilterView = ({ colorScheme }: { colorScheme: string }) => (
	<View className="bg-black dark:bg-gray-200 flex-row items-center h-full mr-3 px-3 py-[7.5px] rounded-full">
		<MaterialIcons
			name="filter-alt"
			color={colorScheme === "dark" ? colors.text[100] : colors.white}
			size={20}
		/>
		<Text className="text-white dark:text-text-100 font-semibold text-sm ml-2">
			Filtros
		</Text>
	</View>
);

export const isToday = (date: Date) => {
	const today = new Date();
	return date.getDate() ===
		today.getDate() /* || date.getDate() === today.getDate() + 1 */
		? true
		: false;
};

const hasTags = (tags: Array<TagObject>, products: ProductModel[]) => {
	const serviceTypes = products
		?.map((product) => product.types)
		.flat()
		.map((type) => type.name);
	//return tags.every(tag => serviceTypes.includes(tag.name))
	return tags.some((tag) => serviceTypes.includes(tag.name));
};

function getWeekOrders(orders: OrderModel[], date: Date) {
	const weekOrders = orders.filter((order) => {
		const serviceDate = new Date(order.date);
		return (
			serviceDate.getDate() > date.getDate() &&
			serviceDate.getDate() <= date.getDate() + 5 &&
			!isToday(serviceDate)
		);
	});
	return weekOrders
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		.reverse();
}

function getMonthOrders(
	orders: OrderModel[],
	month: Date,
	excludeElements: Array<OrderModel> = []
) {
	const monthOrders = orders.filter((order) => {
		const serviceDate = new Date(order.date);
		return (
			serviceDate.getMonth() === month.getMonth() &&
			serviceDate.getFullYear() === month.getFullYear() &&
			!excludeElements.includes(order) &&
			!isToday(serviceDate)
		);
	});
	return monthOrders;
}

const daysOnMonth = (month: number, year: number) => {
	return new Date(year, month, 0).getDate();
};

export default function Home({ route, navigation }: any) {
	const { navigate } = useNavigation();
	const { colorScheme } = useColorScheme();

	const showCreatedOrderToast = useCallback(() => {
		Toast.show({
			preset: "success",
			title: "Serviço criado com sucesso!",
			description:
				"Agora você pode acessar o orçamento do serviço agendado.",
		});
	}, []);

	const showDeleteOrderToast = useCallback(() => {
		Toast.show({
			preset: "success",
			title: "Serviço excluído com sucesso!",
			description: "Agora não será mais possível acessá-lo.",
		});
	}, []);

	const [pendingOrders, setPendingOrders] = useState<
		OrderModel[] | undefined
	>(undefined);
	const [businessData, setBusinessData] = useState<BusinessData | undefined>(
		undefined
	);
	const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

	const currentDate = new Date();
	async function fetchData() {
		setPendingOrders(undefined);
		try {
			await database
				.get<OrderModel>("orders")
				.query(Q.where("status", "scheduled"))
				.observe()
				.subscribe((orders) => {
					setPendingOrders(
						orders.filter(
							(order) =>
								order.date.getTime() >= currentDate.getTime()
						)
					);
				});

			const businessData = (await database.localStorage.get(
				"businessData"
			)) as BusinessData;
			if (businessData) {
				setBusinessData(businessData);
			}
		} catch (error) {
			//console.log(error)
			setPendingOrders([]);
		}
	}

	useFocusEffect(
		useCallback(() => {
			if (route?.params?.order === "created") {
				showCreatedOrderToast();
				navigation.setParams({ order: undefined });
			} else if (route?.params?.order === "deleted") {
				showDeleteOrderToast();
				navigation.setParams({ order: undefined });
			}
		}, [route.params])
	);

	useEffect(() => {
		fetchData();
	}, []);

	const [currentFilteredTags, setCurrentFilteredTags] = useState<TagObject[]>(
		[]
	);

	const isolatedOrders =
		pendingOrders?.filter((order) => isToday(order.date)).reverse() ?? [];
	const weekOrders = getWeekOrders(pendingOrders || [], currentDate);
	const monthOrders = getMonthOrders(
		pendingOrders || [],
		currentDate,
		weekOrders
	);
	const otherOrders =
		pendingOrders?.filter(
			(order) =>
				!isolatedOrders.includes(order) &&
				!weekOrders.includes(order) &&
				!monthOrders.includes(order)
		) ?? [];

	const DATA = [
		...(isolatedOrders.length > 0
			? [
					{
						title: "blank",
						data: isolatedOrders,
					},
			  ]
			: []),
		...(weekOrders.length > 0
			? [
					{
						title: "Esta semana",
						data: weekOrders,
					},
			  ]
			: []),
		...(monthOrders.length > 0
			? [
					{
						title: "Este mês",
						data: monthOrders,
					},
			  ]
			: []),
		...(otherOrders.length > 0
			? [
					{
						title: "Próximos",
						data: otherOrders,
					},
			  ]
			: []),
	];

	function handleTagSelection(data: TagObject[]) {
		setCurrentFilteredTags(data);
	}

	const statusArray = new Array(12).fill(null).map((_, month) => {
		if (month >= currentDate.getMonth()) {
			return new Array(daysOnMonth(month, currentDate.getFullYear()))
				.fill(null)
				.map((_, index) => {
					if (pendingOrders) {
						const firstDayOfMonth = new Date(
							currentDate.getFullYear(),
							month,
							1
						).getDay();
						const ordersCountOnDay = pendingOrders.filter(
							(order) => {
								const serviceDate = new Date(order.date);
								return (
									serviceDate.getDate() +
										(firstDayOfMonth - 1) ===
										index &&
									serviceDate.getMonth() === month
								);
							}
						).length;
						if (ordersCountOnDay === 1) {
							return "contains";
						} else if (ordersCountOnDay > 1) {
							return "busy";
						} else {
							return undefined;
						}
					}
				});
		} else return [];
	});

	return (
		<Container>
			<TabBarScreenHeader navigation={navigation}>
				<TouchableOpacity
					activeOpacity={0.7}
					className="flex flex-row items-center justify-center px-3 py-1 bg-gray_light-neutral bg-black dark:bg-gray-200 rounded-full"
					onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
				>
					<MaterialIcons
						name="expand-more"
						size={16}
						className={"m-0"}
						color={
							colorScheme === "dark"
								? colors.text[100]
								: colors.white
						}
						style={{
							transform: [
								{
									rotate: isCalendarExpanded
										? "180deg"
										: "0deg",
								},
							],
						}}
					/>
					<Text className="text-sm ml-1 text-white dark:text-text-100">
						{isCalendarExpanded ? "Minimizar" : "Expandir"}
					</Text>
				</TouchableOpacity>
			</TabBarScreenHeader>
			{isCalendarExpanded && (
				<Animated.View
					entering={FadeInUp.duration(235)}
					exiting={FadeOutUp.duration(150)}
					className="flex-col items-center justify-center w-full"
				>
					<Calendar statusArray={statusArray} />
				</Animated.View>
			)}
			{!isCalendarExpanded && (
				<Animated.View
					entering={FadeInUp.duration(235)}
					exiting={FadeOutUp}
					className="flex-col items-center justify-start w-full"
				>
					<WeekDays />
					<WeekView
						statusArray={statusArray[currentDate.getMonth()].splice(
							0,
							7
						)}
						navigate={navigate}
					/>
				</Animated.View>
			)}
			<Animated.View
				className="flex flex-row items-start w-full"
				layout={Layout.springify().damping(7).stiffness(85).mass(0.25)}
			>
				<FilterView colorScheme={colorScheme} />
				{businessData?.categories && (
					<View className="w-full pr-10">
						<TagsSelector
							tags={businessData?.categories}
							onSelectTags={handleTagSelection}
							insertPaddingRight
						/>
					</View>
				)}
			</Animated.View>
			<Animated.View
				layout={Layout.springify().damping(7).stiffness(85).mass(0.25)}
				className="flex-1 pb-3"
			>
				{pendingOrders !== undefined ? (
					<SectionList
						sections={DATA}
						keyExtractor={(item, index) => index.toString()}
						style={{ flex: 1 }}
						ListEmptyComponent={
							<Animated.View className="flex-1 items-center pt-24">
								<Empty message="Que tal agendar um serviço pra que ele apareça por aqui?" />
							</Animated.View>
						}
						showsVerticalScrollIndicator={false}
						renderSectionHeader={({ section: { title } }) =>
							title !== "blank" ? (
								<Text className="text-xl font-titleBold text-white mb-2">
									{title}
								</Text>
							) : (
								<></>
							)
						}
						renderItem={({ item, section }) => (
							<EnhancedOrderPreview
								key={item.id}
								onPress={() =>
									navigate("order", { orderId: item.id })
								}
								order={item}
								additionalInfo={
									section.title === "Esta semana" ||
									section.title === "blank"
										? "day"
										: "date"
								}
								filterTags={currentFilteredTags}
							/>
						)}
					/>
				) : (
					<Animated.View className="flex-1">
						<Loading />
					</Animated.View>
				)}
			</Animated.View>
		</Container>
	);
}

export const EnhancedOrderPreview = ({ order, filterTags, ...rest }: any) => {
	const [observedProducts, setProducts] = useState<
		ProductModel[] | undefined
	>(undefined);

	useEffect(() => {
		order.products.observe().subscribe((products: ProductModel[]) => {
			setProducts(products);
		});
	}, []);

	return !filterTags ||
		(filterTags && filterTags.length === 0) ||
		(filterTags && hasTags(filterTags, observedProducts ?? [])) ? (
		<OrderPreview order={order} products={observedProducts} {...rest} />
	) : (
		<></>
	);
};
