import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	BackHandler,
	Keyboard,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { useSharedValue, withSpring } from "react-native-reanimated";

import Header from "components/Header";
import { SectionsNavigator } from "components/SectionsNavigator";

import Section0 from "components/ScheduleForm/Sections/Section0";
import Section1 from "components/ScheduleForm/Sections/Section1";
import Section2 from "components/ScheduleForm/Sections/Section2";

// Components
import Container from "components/Container";
import Toast from "components/Toast";
import { Loading } from "components/StatusMessage";

// Database
import { database } from "database/index.native";

// Types
import type { OrderModel } from "database/models/order.model";
import BottomSheet from "components/BottomSheet";
import ConfirmExitModal from "components/Business/ConfirmExitModal";
import SectionBottomSheet from "components/Form/SectionBottomSheet";

export default function ScheduleForm({ route, navigation }: any) {
	const selectedSectionId = useSharedValue(0);

	const section0BottomSheet = "scheduleFormSection0BottomSheet";
	const section1BottomSheet = "scheduleFormSection1BottomSheet";
	const section2BottomSheet = "scheduleFormSection2BottomSheet";

	const sections = [
		section0BottomSheet,
		section1BottomSheet,
		section2BottomSheet,
	];

	const updateHandler = useCallback((id: number) => {
		if (sections[selectedSectionId.value] && sections[id]) {
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

	const section0Ref = useRef<any>(null);
	const section1Ref = useRef<any>(null);

	const [initialValue, setInitialValue] = useState<any | undefined>(
		undefined
	);

	async function setInitialState(id: string) {
		try {
			const order = (await database
				.get<OrderModel>("orders")
				.find(id)) as any;

			if (order) {
				const products = await order.products.fetch();
				const materials = await order.materials.fetch();

				/* console.log({
                    order,
                    products,
                    materials
                }) */

				if (products && materials) {
					setInitialValue({
						order,
						products,
						materials,
					});
					BottomSheet.expand(section0BottomSheet);
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	const [isConfirmExitModalVisible, setConfirmExitModalVisible] =
		React.useState(false);

	useEffect(() => {
		if (route.params?.orderId) {
			setInitialState(route.params?.orderId);
		}

		const backAction = () => {
			if (selectedSectionId.value !== 0) {
				updateHandler(selectedSectionId.value - 1);
				return true;
			} else {
				setConfirmExitModalVisible(true);
				return true;
			}
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);

		return () => backHandler.remove();
	}, []);

	return (
		<>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<Container>
					<View>
						<Header
							title={
								route.params?.orderId
									? "Editar serviço"
									: "Agendamento"
							}
							returnButton={() => {
								if (selectedSectionId.value !== 0) {
									updateHandler(selectedSectionId.value - 1);
								} else {
									setConfirmExitModalVisible(true);
								}
							}}
						/>
					</View>
					<SectionsNavigator
						selectedId={selectedSectionId}
						sections={[
							{
								id: 0,
								title: "Básico",
								onPress: () =>
									selectedSectionId.value !== 0 &&
									updateHandler(0),
							},
							{
								id: 1,
								title: "Detalhes",
								onPress: () =>
									selectedSectionId.value !== 1 &&
									updateHandler(1),
							},
							{
								id: 2,
								title: "Revisão",
								onPress: () =>
									selectedSectionId.value !== 2 &&
									updateHandler(2),
							},
						]}
					/>

					{!route.params?.orderId ||
					(route.params?.orderId && initialValue) ? (
						<>
							<SectionBottomSheet
								id={section0BottomSheet}
								height="76%"
								defaultValues={{
									expanded: !initialValue,
								}}
							>
								<Section0
									initialValue={initialValue}
									ref={section0Ref}
									updateHandler={updateHandler}
								/>
							</SectionBottomSheet>

							<SectionBottomSheet
								id={section1BottomSheet}
								height="76%"
							>
								<Section1
									initialValue={initialValue}
									ref={section1Ref}
									updateHandler={updateHandler}
								/>
							</SectionBottomSheet>

							<Section2
								bottomSheet={section2BottomSheet}
								initialValue={initialValue}
								formRefs={{ section0Ref, section1Ref }}
							/>
						</>
					) : (
						<Loading />
					)}
				</Container>
			</TouchableWithoutFeedback>
			<ConfirmExitModal
				isVisible={isConfirmExitModalVisible}
				toggleVisibility={() => setConfirmExitModalVisible(false)}
				onExitConfirmation={() => {
					setConfirmExitModalVisible(false);
					navigation.goBack();
				}}
			/>
		</>
	);
}
