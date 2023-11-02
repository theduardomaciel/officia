import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useSharedValue, withSpring } from "react-native-reanimated";

import Header from "components/Header";
import { SectionsNavigator } from "components/SectionsNavigator";

import Section0Form from "screens/ScheduleForm/Sections/Section0";

// Components
import { Loading } from "components/StatusMessage";
import Container from "components/Container";
import BottomSheet from "components/BottomSheet";
import ConfirmExitModal from "components/Business/ConfirmExitModal";

// Database
import { database } from "database/index.native";

// Types
import type { OrderModel } from "database/models/order.model";
import { SECTION_PREFIX } from "./ScheduleForm/@types";
import Section1Form from "./ScheduleForm/Sections/Section1";

export default function ScheduleForm({ route, navigation }: any) {
    const orderId = route.params?.orderId;
    const selectedSectionId = useSharedValue(0);

    const updateHandler = useCallback((id: number) => {
        if (id >= 0 && id <= 2) {
            BottomSheet.close(SECTION_PREFIX + selectedSectionId.value);
            selectedSectionId.value = withSpring(id, {
                damping: 100,
                stiffness: 400,
            });
            BottomSheet.expand(SECTION_PREFIX + id);
        } else {
            navigation.goBack();
        }
    }, []);

    const [initialValue, setInitialValue] = useState<any | undefined>(
        undefined
    );

    async function fetchInitialData(id: string) {
        try {
            const order = (await database
                .get<OrderModel>("orders")
                .find(id)) as any;

            if (order) {
                const products = await order.products.fetch();
                const materials = await order.materials.fetch();

                if (products && materials) {
                    setInitialValue({
                        order,
                        products,
                        materials,
                    });
                    BottomSheet.expand(SECTION_PREFIX + "0");
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const [isConfirmExitModalVisible, setConfirmExitModalVisible] =
        React.useState(false);

    const backAction = useCallback(() => {
        if (selectedSectionId.value === 0) {
            setConfirmExitModalVisible(true);
            return true;
        } else {
            updateHandler(selectedSectionId.value - 1);
            return true;
        }
    }, []);

    useEffect(() => {
        if (orderId) {
            fetchInitialData(orderId);
        }

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
                    <Header
                        title={orderId ? "Editar serviço" : "Agendamento"}
                        returnButton={() => {
                            if (selectedSectionId.value !== 0) {
                                updateHandler(selectedSectionId.value - 1);
                            } else {
                                setConfirmExitModalVisible(true);
                            }
                        }}
                    />
                    <SectionsNavigator
                        selectedId={selectedSectionId}
                        sections={[
                            {
                                id: 0,
                                title: "Básico",
                            },
                            {
                                id: 1,
                                title: "Detalhes",
                            },
                            {
                                id: 2,
                                title: "Revisão",
                            },
                        ]}
                    />

                    {!orderId || (orderId && initialValue) ? (
                        <>
                            <Section0Form updateHandler={updateHandler} />
                            <Section1Form updateHandler={updateHandler} />
                            {/* 
                            <Section2
                                bottomSheet={section2BottomSheet}
                                initialValue={initialValue}
                                formRefs={{ section0Ref, section1Ref }}
                            /> */}
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
