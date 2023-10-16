import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	BackHandler,
	Keyboard,
	Platform,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { useSharedValue, withSpring } from "react-native-reanimated";

import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";

import colors from "global/colors";

// Components
import Container from "components/Container";
import Header from "components/Header";
import Modal from "components/Modal";
import SectionBottomSheet from "components/Form/SectionBottomSheet";
import { Loading } from "components/StatusMessage";
import { SectionsNavigator } from "components/SectionsNavigator";

import { updateData } from "./Main/Business";

// Database
import { database } from "database/index.native";

// Types
import type { ClientModel } from "database/models/client.model";
import type { MaterialModel } from "database/models/material.model";
import type { OrderModel } from "database/models/order.model";
import type { ProductModel } from "database/models/product.model";
import type { BusinessData } from "./Main/Business/@types";

// PDF
import FileViewer from "react-native-file-viewer";

import { getPDFString } from "utils/pdfHandler";
import BottomSheet from "components/BottomSheet";
import Section1, { Section0Handles } from "components/Invoice/Section0";
import Section2 from "components/Invoice/Section1";

export default function Invoice({ route, navigation }: any) {
	const [modalProps, setModalProps] = useState<{
		status: "success" | "error" | false;
		data?: string;
	}>({ status: false });

	const selectedSectionId = useSharedValue(0);
	const sections = [
		"invoiceSection0BottomSheet",
		"invoiceSection1BottomSheet",
	];

	const updateHandler = useCallback((id: number) => {
		if (sections[selectedSectionId.value] && sections[id] && id >= 0) {
			BottomSheet.close(sections[selectedSectionId.value]);
			selectedSectionId.value = withSpring(id, {
				damping: 100,
				stiffness: 400,
			});
			BottomSheet.expand(sections[id]);
		} else {
			navigation.goBack();
		}
	}, []);

	const [invoiceData, setInvoiceData] = useState<
		| {
				order: OrderModel;
				products: ProductModel[];
				materials: MaterialModel[];
				client: ClientModel;
		  }
		| undefined
	>(undefined);

	async function setInitialState(id: string) {
		try {
			const order = (await database
				.get<OrderModel>("orders")
				.find(id)) as any;

			if (order) {
				const products = await order.products.fetch();
				const materials = await order.materials.fetch();
				const client = (await order.client.fetch()) ?? undefined;

				if (products && materials) {
					setInvoiceData({
						order,
						products,
						materials,
						client,
					});
					BottomSheet.expand(sections[0]);
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		if (route.params?.orderId) {
			setInitialState(route.params?.orderId);
		}

		const backAction = () => {
			if (selectedSectionId.value !== 0) {
				updateHandler(selectedSectionId.value - 1);
				return true;
			}
			return false;
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);

		return () => backHandler.remove();
	}, []);

	async function requestExternalWritePermission() {
		try {
			createPDF();
			/* const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                createPDF();
            } else {
                setModalProps({
                    status: 'error',
                    data: 'Você precisa permitir o acesso ao armazenamento externo para gerar o documento.'
                })
            } */
		} catch (err) {
			setModalProps({
				status: "error",
				data: "Um erro desconhecido nos impediu de gerar o documento.\nCaso o problema persista, entre em contato conosco.",
			});
		}
	}

	const onSubmit = async () => {
		if (Platform.OS === "android") {
			requestExternalWritePermission();
		} else {
			createPDF();
		}
	};

	const [isLoading, setIsLoading] = useState(false);
	const section0Ref = useRef<Section0Handles>(null);

	async function createPDF() {
		setIsLoading(true);
		const data = (await database.localStorage.get(
			"businessData"
		)) as BusinessData;

		if (!data) {
			setModalProps({
				status: "error",
				data: "Você precisa preencher os dados da sua empresa antes de gerar o documento.",
			});
			return;
		}

		if (!invoiceData || !invoiceData?.order) {
			setModalProps({
				status: "error",
				data: "Um erro desconhecido nos impediu de gerar o documento.",
			});
			return;
		}

		const PDFString = await getPDFString(
			data,
			invoiceData?.order!,
			invoiceData?.products,
			invoiceData?.materials,
			invoiceData?.client,
			section0Ref.current?.getValidity() ?? "15",
			section0Ref.current?.getSelectedOptions()!
		);

		const { uri } = await Print.printToFileAsync({ html: PDFString });

		if (data.invoiceUri) {
			await FileSystem.deleteAsync(data.invoiceUri, { idempotent: true });
		}

		updateData({ invoiceUri: uri }, data, true);

		setIsLoading(false);
		setModalProps({
			status: "success",
			data: uri,
		});
	}

	const openFile = (filepath: string) => {
		FileViewer.open(filepath) // absolute-path-to-my-local-file.
			.then(() => {
				// success
			})
			.catch((error) => {
				setModalProps({
					status: "error",
					data: "Um erro desconhecido nos impediu de abrir o documento.",
				});
			});
	};

	return (
		<>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<Container>
					<View>
						<Header
							title={"Orçamento"}
							returnButton={() =>
								updateHandler(selectedSectionId.value - 1)
							}
						/>
					</View>
					<SectionsNavigator
						selectedId={selectedSectionId}
						sections={[
							{
								id: 0,
								title: "Visão Geral",
								onPress: () =>
									selectedSectionId.value !== 0 &&
									updateHandler(0),
							},
							{
								id: 1,
								title: "Revisão",
								onPress: () =>
									selectedSectionId.value !== 1 &&
									updateHandler(1),
							},
						]}
					/>

					{route.params?.orderId && invoiceData ? (
						<>
							<SectionBottomSheet
								bottomSheet={sections[0]}
								expanded={false}
							>
								<Section1
									onSubmit={() =>
										updateHandler && updateHandler(1)
									}
									ref={section0Ref}
									order={invoiceData.order}
								/>
							</SectionBottomSheet>

							<SectionBottomSheet
								bottomSheet={sections[1]}
								expanded={false}
							>
								<Section2
									onSubmit={onSubmit}
									isLoading={isLoading}
									order={invoiceData.order}
									products={invoiceData.products}
									materials={invoiceData.materials}
								/>
							</SectionBottomSheet>
						</>
					) : (
						<Loading />
					)}
				</Container>
			</TouchableWithoutFeedback>
			<Modal
				isVisible={modalProps.status === "success"}
				toggleVisibility={() => setModalProps({ status: false })}
				title={"O orçamento foi criado com sucesso."}
				description={`Compartilhe-o com seu cliente clicando no botão Visualizar.`}
				icon="article"
				buttons={[
					{
						label: "Visualizar",
						onPress: () => {
							modalProps.data && openFile(modalProps.data);
						},
						color: colors.primary,
						closeOnPress: true,
					},
				]}
				cancelButton
			/>
			<Modal
				isVisible={modalProps.status === "error"}
				toggleVisibility={() => setModalProps({ status: false })}
				title={"Não foi possível gerar o orçamento."}
				description={`${modalProps.data}`}
				icon="error"
				cancelButton
			/>
		</>
	);
}
