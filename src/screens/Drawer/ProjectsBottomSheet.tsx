import React, { useCallback, useState, useEffect } from "react";
import { Text, View, TouchableOpacity, FlatList } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors, { primary } from "global/colors";

// Components
import Modal from "components/Modal";
import BottomSheet, { BottomSheetActions } from "components/BottomSheet";
import { Empty } from "components/StatusMessage";

// Database
import { database } from "database/index.native";
import { Q } from "@nozbe/watermelondb";

// Types
import type { ClientModel } from "database/models/client.model";
import type { OrderModel } from "database/models/order.model";

interface Props {
	lastBottomSheet: string;
	order: OrderModel;
	onSelectClient?: (data: ClientModel) => void;
}

export default function ProjectsBottomSheet({ lastBottomSheet, order }: Props) {
	const [clients, setClients] = useState<ClientModel[]>([]);

	const lastBottomSheetRefOpenHandler = useCallback(() => {
		BottomSheet.expand(lastBottomSheet);
	}, []);

	const bottomSheetCloseHandler = useCallback(() => {
		BottomSheet.close("clientSelectBottomSheet");
	}, []);

	async function handleSelectClient(client: ClientModel) {
		bottomSheetCloseHandler();
		try {
			await database.write(async () => {
				await order.update((order: any) => {
					order.client.id = client.id;
				});
			});
		} catch (error) {
			console.log(error);
		}
		/* onSelectClient?.(client); */
	}

	async function fetchClients() {
		await database
			.get<ClientModel>("clients")
			.query()
			.observe()
			.subscribe((clients) => {
				setClients(clients);
			});
	}

	useEffect(() => {
		fetchClients();
	}, []);

	return (
		<BottomSheet
			height={"35%"}
			id={"clientSelectBottomSheet"}
			onDismiss={lastBottomSheetRefOpenHandler}
		>
			<View
				className="flex flex-1 gap-y-5"
				style={{
					paddingLeft: 24,
					paddingRight: 24,
					paddingBottom: 12,
				}}
			>
				<BottomSheet.Title>Selecionar cliente</BottomSheet.Title>
				{clients.length > 0 ? (
					<FlatList
						data={clients}
						renderItem={({ item }) => (
							<EnhancedClientPreview
								client={item}
								onPress={() => handleSelectClient(item)}
							/>
						)}
						className="flex flex-1 relative"
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{
							paddingBottom: 16,
						}}
					/>
				) : (
					<View className="flex flex-1 items-center justify-center">
						<Empty message="Nenhum cliente foi adicionado até o momento." />
					</View>
				)}
				{/* {
                    clientAddBottomSheetOpenHandler && (
                        <SubActionButton
                            onPress={() => {
                                bottomSheetCloseHandler();
                                clientAddBottomSheetOpenHandler();
                            }}
                            icon="add"
                            label='Adicionar cliente'
                            preset='dashed'
                        />
                    )
                } */}
			</View>
		</BottomSheet>
	);
}

async function deleteClient(client: ClientModel) {
	await database.write(async () => {
		const ordersWithClient = await database
			.get<OrderModel>("orders")
			.query(Q.where("client_id", client.id))
			.fetch();

		await Promise.all(
			ordersWithClient.map(async (order) => {
				await order.update((order: any) => {
					order.client.id = null;
				});
			})
		);

		await client.destroyPermanently();
	});
	console.log("Cliente removido com sucesso.");
}

interface ConfirmDeleteModalProps {
	isVisible: boolean;
	setVisible: (value: boolean) => void;
	client: ClientModel;
}

export function ClientDeleteModal({
	isVisible,
	setVisible,
	client,
}: ConfirmDeleteModalProps) {
	return (
		<Modal
			isVisible={isVisible}
			toggleVisibility={() => setVisible(false)}
			title={"Você tem certeza?"}
			description="Os dados do cliente não poderão ser recuperados."
			icon="delete"
			buttons={[
				{
					label: "Remover",
					onPress: () => {
						deleteClient(client);
					},
					color: colors.red,
					closeOnPress: true,
				},
			]}
			cancelButton
		/>
	);
}

const ClientPreview = ({
	client,
	onPress,
}: {
	client: ClientModel;
	onPress: () => void;
}) => {
	const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

	return (
		<View className="flex flex-row items-center gap-x-4 mb-4">
			<TouchableOpacity
				className="flex flex-1 flex-row items-center justify-start"
				activeOpacity={0.7}
				onPress={onPress}
			>
				<View className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-100 mr-4">
					<MaterialIcons
						name="person"
						size={18}
						color={colors.text[100]}
					/>
				</View>
				<View className="flex-col items-start justify-center">
					<Text className="font-titleSemiBold text-base text-white mr-2">
						{client.name}
					</Text>
					<Text className="text-sm text-text-200">
						{client.contact ?? "Não possui contato"}
					</Text>
				</View>
			</TouchableOpacity>
			<View className="flex flex-row items-center justify-end gap-x-4">
				<MaterialIcons
					name="delete"
					size={18}
					color={colors.red}
					onPress={() => setDeleteModalVisible(true)}
				/>
			</View>
			<ClientDeleteModal
				isVisible={isDeleteModalVisible}
				setVisible={setDeleteModalVisible}
				client={client}
			/>
		</View>
	);
};

const EnhancedClientPreview = ({ client, ...rest }: any) => {
	const [observedClient, setClient] = useState<ClientModel>(client);

	useEffect(() => {
		client.observe().subscribe((client: ClientModel) => {
			setClient(client);
		});
	}, []);

	return <ClientPreview client={observedClient} {...rest} />;
};
