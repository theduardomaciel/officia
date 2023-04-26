import React, { useCallback } from "react";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

// Form
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import colors from "global/colors";

// Types
import type { OrderModel } from "database/models/orderModel";
import type { ClientModel } from "database/models/clientModel";

// Components
import BottomSheet from "components/BottomSheet";
import { ActionButton, SubActionButton } from "components/Button";
import Toast from "components/Toast";
import ClientSelect from "./ClientSelect";

import { database } from "database/index.native";
import ClientDataForm, {
	ClientFormValues,
	clientSchema,
} from "./ClientDataForm";

import { scheduleOrderNotification } from "utils/notificationHandler";

interface Props {
	order: OrderModel;
	onSubmitForm?: (data: ClientModel) => void;
}

export default function ClientAdd({ order, onSubmitForm }: Props) {
	const showToast = (errorMessage?: string) => {
		Toast.show({
			preset: "error",
			title: "Por favor, preencha os campos corretamente.",
			message: errorMessage || "Não foi possível adicionar o cliente.",
		});
	};

	// Bottom Sheets and Dropdowns
	const clientSelectBottomSheetOpenHandler = useCallback(() => {
		BottomSheet.expand("clientSelectBottomSheet");
	}, []);

	const bottomSheetCloseHandler = useCallback(() => {
		BottomSheet.close("clientAddBottomSheet");
	}, []);

	async function handleCreate(client: ClientModel) {
		try {
			await database.write(async () => {
				const newClient = await database
					.get("clients")
					.create((newClient: any) => {
						newClient.name = client.name;
						newClient.contact = client.contact;
						newClient.address = client.address;
					});
				await order.update((order: any) => {
					order.client.set(newClient);
				});
			});
			await scheduleOrderNotification(
				order,
				order.products.length,
				client?.name
			);
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
			name: "",
			contact: "",
			address: "",
		},
		resolver: zodResolver(clientSchema),
		mode: "onBlur",
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
	});

	const onSubmit: SubmitHandler<ClientFormValues> = (data) => {
		const newClient = {
			name: data.name,
			contact: data.contact,
			address: data.address,
		};
		//console.log(newClient)
		Toast.hide();

		// Inserimos o novo cliente no banco de dados
		handleCreate(newClient as unknown as ClientModel);

		bottomSheetCloseHandler();

		/* onSubmitForm && onSubmitForm(newClient as unknown as ClientModel); */
		reset();
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
		<BottomSheet height={"55%"} id={"clientAddBottomSheet"}>
			<View
				className="flex flex-1 gap-y-5"
				style={{
					paddingLeft: 24,
					paddingRight: 24,
					paddingBottom: 12,
				}}
			>
				<BottomSheet.Title>
					Adicionar dados do cliente
				</BottomSheet.Title>
				<ScrollView
					className="flex flex-1 relative"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						paddingBottom: 16,
					}}
				>
					<View className="gap-y-5">
						<SubActionButton
							label="Selecionar cliente existente"
							onPress={() => {
								clientSelectBottomSheetOpenHandler();
								bottomSheetCloseHandler();
							}}
							borderColor={colors.primary}
							preset="dashed"
						/>
						<View className="w-full flex items-center justify-center mb-4">
							<Text className="text-black dark:text-white text-sm">
								ou
							</Text>
						</View>
						<ClientDataForm control={control} errors={errors} />
					</View>
				</ScrollView>
				<ActionButton
					label="Adicionar cliente"
					icon="add"
					onPress={handleSubmit(onSubmit, onError)}
				/>
			</View>
			<ClientSelect
				order={order}
				lastBottomSheet={"clientAddBottomSheet"}
			/>
		</BottomSheet>
	);
}
