import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useRef } from "react";
import {
	ActivityIndicator,
	FlatList,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container from "components/Container";
import Header from "components/Header";
import Modal from "components/Modal";
import Toast from "components/Toast";
import Dropdown, { DropdownData } from "components/Dropdown";

import { ActionButton } from "components/Button";
import BottomSheet, { BottomSheetActions } from "components/BottomSheet";
import { Loading } from "components/StatusMessage";
import { PreviewStatic } from "components/Preview";
import { SubSectionWrapper } from "components/Form/SubSectionWrapper";
import { Tag } from "components/TagsSelector";

import ClientAdd from "components/ClientForms/ClientAdd";
import ClientView from "components/ClientForms/ClientView";

// Database
import { database } from "database/index.native";

// Types
import type { ClientModel } from "database/models/clientModel";
import type { MaterialModel } from "database/models/materialModel";
import type { OrderModel } from "database/models/orderModel";
import type { ProductModel } from "database/models/productModel";
import {
	removeNotification,
	scheduleOrderNotification,
} from "utils/notificationHandler";

interface Props {
	order: OrderModel;
	products?: ProductModel[];
	materials?: MaterialModel[];
	client?: ClientModel;
}

interface ObservableOrderModel extends OrderModel {
	products: any;
	materials: any;
}

export default function Order({ route, navigation }: any) {
	const { orderId, updated } = route.params;

	const [order, setOrder] = React.useState<OrderModel | undefined>(undefined);
	const [products, setProducts] = React.useState<ProductModel[] | undefined>(
		undefined
	);
	const [materials, setMaterials] = React.useState<
		MaterialModel[] | undefined
	>(undefined);
	const [client, setClient] = React.useState<ClientModel | undefined>(
		undefined
	);

	const showUpdatedOrderToast = useCallback(() => {
		Toast.show({
			preset: "success",
			icon: "edit",
			title: "O serviço foi atualizado com sucesso!",
			message: "As alterações foram salvas.",
		});
	}, []);

	async function fetchOrder() {
		const newOrder = (await database
			.get<OrderModel>("orders")
			.find(orderId)) as ObservableOrderModel;

		if (newOrder.date < new Date() && newOrder.status === "scheduled") {
			await database.write(async () => {
				await newOrder.update((order: any) => {
					order.status = "archived";
				});
			});
			removeNotification(newOrder.id);
		}

		setOrder(newOrder);

		//newOrder.observe().subscribe(setOrder);
		newOrder.products.observe().subscribe(setProducts);
		newOrder.materials.observe().subscribe(setMaterials);
		newOrder.client.observe().subscribe(setClient);
	}

	useFocusEffect(
		React.useCallback(() => {
			if (updated) {
				navigation.setParams({
					updated: undefined,
					orderId: orderId,
				});
				showUpdatedOrderToast();
			}

			fetchOrder();
		}, [orderId, updated])
	);

	return (
		<>
			{order ? (
				<ScreenContent
					order={order}
					products={products}
					materials={materials}
					client={client}
				/>
			) : (
				<View className="flex-1 items-center justify-center pt-24">
					<Loading />
				</View>
			)}
		</>
	);
}

const STATUS_DATA = [
	{ label: "Agendado", value: "scheduled", icon: "calendar-today" },
	/* { label: "Em garantia", value: "warranty", icon: "verified" }, */
	{ label: "Arquivado", value: "archived", icon: "archive" },
] as DropdownData[];

function ScreenContent({ order, products, materials, client }: Props) {
	const insets = useSafeAreaInsets();
	const { navigate } = useNavigation();

	const [isDeleteModalVisible, setDeleteModalVisible] = React.useState(false);
	const ordersTypes = [
		...new Set(
			products
				?.map((product) =>
					product.types.length > 0
						? product.types.map((category) => category)
						: []
				)
				.flat()
		),
	];

	// Bottom Sheets
	const expandClientAddBottomSheet = useCallback(() => {
		BottomSheet.expand("clientAddBottomSheet");
	}, []);

	const expandClientViewBottomSheet = useCallback(() => {
		BottomSheet.expand("clientViewBottomSheet");
	}, []);

	// Dropdowns
	const [serviceStatus, setOrderStatus] = React.useState(order.status);
	const statusDropdownRef = useRef<any>(null);

	const statusDropdownOpenHandler = useCallback(() => {
		statusDropdownRef.current?.open();
	}, []);

	async function updateStatus(status: string) {
		setOrderStatus(status);

		await database.write(async () => {
			const queryOrder = await database
				.get<OrderModel>("orders")
				.find(order.id);

			await queryOrder.update((order) => {
				order.status = status;
			});
		});

		if (status === "archived") {
			await removeNotification(order.id);
		} else if (
			status === "scheduled" &&
			order.date.getTime() >= new Date().getTime()
		) {
			await scheduleOrderNotification(
				order,
				products?.length ?? 0,
				client?.name
			);
		}
	}

	async function deleteOrder() {
		await database.write(async () => {
			const queryOrder = await database
				.get<OrderModel>("orders")
				.find(order.id);

			await queryOrder.destroyPermanently();
		});

		await removeNotification(order.id);

		setDeleteModalVisible(false);
		navigate("home", { order: "deleted" });
	}

	return (
		<Container>
			<View>
				<Header
					title={order?.name ?? "teste"}
					returnButton
					upperChildren={
						<View className="flex-row items-center gap-x-2">
							<MaterialIcons
								name="calendar-today"
								size={18}
								color={colors.text[100]}
							/>
							<Text className="text-sm text-text-100">
								{order?.date?.toLocaleDateString("pt-BR", {
									day: "2-digit",
									month: "2-digit",
								})}{" "}
								-{" "}
								{order?.date.toLocaleTimeString("pt-BR", {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</Text>
						</View>
					}
					aboveTitle={
						<TouchableOpacity
							className="flex-row items-center gap-x-2"
							activeOpacity={0.8}
							onPress={statusDropdownOpenHandler}
						>
							<MaterialIcons
								name={
									STATUS_DATA.find(
										(status) =>
											status.value === serviceStatus
									)?.icon as unknown as any
								}
								size={14}
								color={colors.text[100]}
							/>
							<Text className="text-sm text-text-100 uppercase">
								{
									STATUS_DATA.find(
										(status) =>
											status.value === serviceStatus
									)?.label
								}
							</Text>
							<MaterialIcons
								name="arrow-drop-down"
								size={14}
								color={colors.text[100]}
							/>
						</TouchableOpacity>
					}
					bellowTitle={
						<TouchableOpacity
							activeOpacity={0.8}
							onPress={
								client && order.status === "scheduled"
									? expandClientViewBottomSheet
									: expandClientAddBottomSheet
							}
						>
							{client ? (
								<View className="flex-row items-center gap-x-2">
									<MaterialIcons
										name="person"
										size={18}
										color={colors.text[100]}
									/>
									<Text
										className="text-base text-text-100"
										style={{
											textDecorationLine:
												order.status === "scheduled"
													? "underline"
													: "none",
										}}
									>
										{client.name}
									</Text>
								</View>
							) : (
								<Text className="text-base underline text-text-100">
									Adicionar dados do cliente
								</Text>
							)}
						</TouchableOpacity>
					}
				/>
			</View>
			<ScrollView
				className=""
				contentContainerStyle={{
					paddingBottom: 75,
					rowGap: 20,
				}}
				showsVerticalScrollIndicator={false}
			>
				{ordersTypes && ordersTypes.length > 0 && (
					<SubSectionWrapper
						header={{
							title: "Categorias",
						}}
						preset="smallMargin"
					>
						<View className="h-9 w-full">
							<FlatList
								horizontal
								className="w-full pr-10"
								contentContainerStyle={{}}
								nestedScrollEnabled
								showsHorizontalScrollIndicator={false}
								data={ordersTypes}
								renderItem={({ item, index }) => (
									<Tag {...item} />
								)}
							/>
						</View>
					</SubSectionWrapper>
				)}

				{products && products.length > 0 ? (
					<SubSectionWrapper
						header={{
							title: "Serviços",
						}}
						preset="smallMargin"
					>
						<View className="w-full">
							{products?.map((product, index) => (
								<View className="mb-2" key={index.toString()}>
									<PreviewStatic
										palette="light"
										hasBorder
										product={product}
									/>
								</View>
							))}
						</View>
					</SubSectionWrapper>
				) : (
					products === undefined && (
						<ActivityIndicator
							color={colors.primary}
							size="small"
						/>
					)
				)}

				{materials && materials.length > 0 ? (
					<SubSectionWrapper
						header={{
							title: "Materiais",
						}}
					>
						<View className="w-full">
							{materials?.map((material, index) => {
								return (
									<View
										className="mb-2"
										key={index.toString()}
									>
										<PreviewStatic
											palette="light"
											hasBorder
											material={material}
										/>
									</View>
								);
							})}
						</View>
					</SubSectionWrapper>
				) : (
					products === undefined && (
						<ActivityIndicator
							color={colors.primary}
							size="small"
						/>
					)
				)}

				<SubSectionWrapper
					header={{
						title: "Ações",
					}}
					preset="smallMargin"
				>
					<View className="flex w-full gap-y-2">
						<ActionButton
							label="Editar serviço"
							icon="edit"
							style={{ paddingTop: 12, paddingBottom: 12 }}
							onPress={() =>
								navigate("schedule", { orderId: order.id })
							}
						/>
						<View>
							<ActionButton
								label="Excluir serviço"
								icon="delete"
								style={{
									backgroundColor: colors.red,
									paddingTop: 12,
									paddingBottom: 12,
								}}
								onPress={() => setDeleteModalVisible(true)}
							/>
						</View>
					</View>
				</SubSectionWrapper>
			</ScrollView>
			<View
				className="w-screen absolute bottom-0 px-6"
				style={{
					paddingBottom: insets.bottom + 10,
				}}
			>
				<ActionButton
					preset="next"
					icon={"attach-money"}
					label={"Gerar orçamento"}
					disabled={products && products?.length === 0}
					onPress={() => navigate("invoice", { orderId: order.id })}
				/>
			</View>
			{client && <ClientView client={client} order={order} />}
			<ClientAdd order={order} />
			<Dropdown
				ref={statusDropdownRef}
				data={STATUS_DATA}
				bottomSheetHeight={"23%"}
				bottomSheetLabel={"Selecione o status do serviço"}
				selected={serviceStatus}
				setSelected={updateStatus}
			/>
			<Modal
				isVisible={isDeleteModalVisible}
				toggleVisibility={() => setDeleteModalVisible(false)}
				title={"Você tem certeza?"}
				message="É possível arquivar este serviço a qualquer momento, ao invés de deletá-lo."
				icon="delete"
				buttons={[
					{
						label: "Remover",
						onPress: deleteOrder,
						color: colors.red,
						closeOnPress: true,
					},
				]}
				cancelButton
			/>
		</Container>
	);
}
