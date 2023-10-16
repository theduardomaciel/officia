import React, { useCallback, useRef } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Form
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Components
import BottomSheet from "components/BottomSheet";
import { ActionButton, SubActionButton } from "components/Button";
import Toast from "components/Toast";
import { ClientDeleteModal } from "./ClientSelect";

import { database } from "database/index.native";
import ClientDataForm, {
	ClientFormValues,
	clientSchema,
} from "./ClientDataForm";

// Types
import type { ClientModel } from "database/models/client.model";
import type { OrderModel } from "database/models/order.model";

import { scheduleOrderNotification } from "utils/notificationHandler";

interface Props {
	lastBottomSheet: string;
	client: ClientModel;
	order?: OrderModel;
}

export default function ClientEdit({ order, lastBottomSheet, client }: Props) {
	const [isDeleteModalVisible, setDeleteModalVisible] = React.useState(false);

	const showToast = (errorMessage?: string) => {
		Toast.show({
			preset: "error",
			title: "Por favor, preencha os campos corretamente.",
			description:
				errorMessage || "Não foi possível adicionar o cliente.",
		});
	};

	const bottomSheetCloseHandler = useCallback(() => {
		BottomSheet.close("clientEditBottomSheet");
	}, []);

	const lastBottomSheetOpenHandler = useCallback(() => {
		BottomSheet.expand(lastBottomSheet);
	}, []);

	async function handleUpdate(updatedClient: ClientModel) {
		try {
			await database.write(async () => {
				await client.update((clientToUpdate: any) => {
					if (updatedClient.name) {
						clientToUpdate.name = updatedClient.name;
					}
					if (updatedClient.contact) {
						clientToUpdate.contact = updatedClient.contact;
					}
					if (updatedClient.address) {
						clientToUpdate.address = updatedClient.address;
					}
				});
			});
			if (order) {
				await scheduleOrderNotification(
					order,
					order?.products.length,
					uporderient?.name
				);
			}
		} catch (error) {
			console.log(error);
		}
	}

	// Form
	const {
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<ClientFormValues>({
		defaultValues: {
			name: client.name,
			contact: client.contact!,
			address: client.address ?? undefined,
		},
		resolver: zodResolver(clientSchema),
		mode: "onBlur",
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
	});

	const newClientAddress = useRef<string | undefined>(undefined);

	const onSubmit: SubmitHandler<ClientFormValues> = (data) => {
		const updatedClient = {
			name: data.name,
			contact: data.contact,
			address: newClientAddress.current ?? data.address,
		};
		//console.log(updatedClient)
		Toast.hide();

		// Inserimos o novo cliente no banco de dados
		handleUpdate(updatedClient as unknown as ClientModel);
		reset();

		bottomSheetCloseHandler();
		lastBottomSheetOpenHandler();
	};

	const onError: SubmitErrorHandler<ClientFormValues> = (errors, e) => {
		//console.log(errors)
		showToast(
			Object.values(errors)
				.map((error) => error.message)
				.join("\n")
		);
	};

	return (
		<BottomSheet height={"60%"} id={"clientEditBottomSheet"}>
			<View
				className="flex flex-1 gap-y-5"
				style={{
					paddingLeft: 24,
					paddingRight: 24,
					paddingBottom: 12,
				}}
			>
				<BottomSheet.Title>Editar cliente</BottomSheet.Title>
				<ScrollView
					className="flex flex-1 relative"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						paddingBottom: 16,
					}}
				>
					<View className="gap-y-5 w-full items-center justify-center">
						<View className="rounded-full w-24 h-24 flex items-center justify-center bg-gray-100 mr-4 mb-8">
							<MaterialIcons
								name="person"
								size={48}
								color={colors.text[100]}
							/>
						</View>
						<ClientDataForm control={control} errors={errors} />
						<SubActionButton
							label="Remover cliente"
							icon="delete"
							onPress={() => {
								bottomSheetCloseHandler();
								setDeleteModalVisible(true);
							}}
							borderColor={colors.red}
							preset="dashed"
						/>
					</View>
				</ScrollView>
				<ActionButton
					label="Editar cliente"
					style={{ backgroundColor: colors.blue }}
					icon="edit"
					onPress={handleSubmit(onSubmit, onError)}
				/>
			</View>
			<ClientDeleteModal
				isVisible={isDeleteModalVisible}
				setVisible={() => setDeleteModalVisible(false)}
				client={client}
			/>
		</BottomSheet>
	);
}
