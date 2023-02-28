import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useSharedValue, withSpring } from 'react-native-reanimated';

import Header from 'components/Header';
import { SectionsNavigator } from 'components/SectionsNavigator';

import Section0 from 'components/ScheduleForm/Sections/Section0';
import Section1 from 'components/ScheduleForm/Sections/Section1';
import Section2 from 'components/ScheduleForm/Sections/Section2';

// Components
import Container from 'components/Container';
import Form from 'components/ScheduleForm/Forms/Form';
import Toast from 'components/Toast';
import { Loading } from 'components/StatusMessage';

// Database
import { database } from 'database/index.native';

// Types
import type { BottomSheetActions } from 'components/BottomSheet';
import type { ServiceModel } from 'database/models/serviceModel';

export default function ScheduleForm({ route }: any) {
    const selectedSectionId = useSharedValue(0);

    const section0BottomSheetRef = useRef<BottomSheetActions>(null);
    const section1BottomSheetRef = useRef<BottomSheetActions>(null);
    const section2BottomSheetRef = useRef<BottomSheetActions>(null);

    const sections = [section0BottomSheetRef, section1BottomSheetRef, section2BottomSheetRef];

    const updateHandler = useCallback((id: number) => {
        if (sections[selectedSectionId.value] && sections[id]) {
            sections[selectedSectionId.value].current?.close();
            selectedSectionId.value = withSpring(id, {
                damping: 100,
                stiffness: 400
            });
            sections[id].current?.expand();
        }
    }, [])

    const section0Ref = useRef<any>(null);
    const section1Ref = useRef<any>(null);

    const [initialValue, setInitialValue] = useState<any | undefined>(undefined);

    async function setInitialState(id: string) {
        try {
            const service = await database
                .get<ServiceModel>('services')
                .find(id) as any;

            if (service) {
                const subServices = await service.subServices.fetch();
                const materials = await service.materials.fetch();

                /* console.log({
                    service,
                    subServices,
                    materials
                }) */

                if (subServices && materials) {
                    setInitialValue({
                        service,
                        subServices,
                        materials
                    })
                    section0BottomSheetRef.current?.expand();
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (route.params?.serviceId) {
            setInitialState(route.params?.serviceId)
        }

        const backAction = () => {
            if (selectedSectionId.value !== 0) {
                updateHandler(selectedSectionId.value - 1);
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, [])

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Container>
                <View>
                    <Header
                        title={route.params?.serviceId ? "Editar serviço" : "Agendamento"}
                        cancelButton={selectedSectionId.value === 0}
                        returnButton={selectedSectionId.value !== 0 ? () => updateHandler(selectedSectionId.value - 1) : undefined}
                    />
                </View>
                <SectionsNavigator
                    selectedId={selectedSectionId}
                    sections={[
                        {
                            id: 0,
                            title: "Básico",
                            onPress: () => selectedSectionId.value !== 0 && updateHandler(0)
                        },
                        {
                            id: 1,
                            title: "Detalhes",
                            onPress: () => selectedSectionId.value !== 1 && updateHandler(1)
                        },
                        {
                            id: 2,
                            title: "Revisão",
                            onPress: () => selectedSectionId.value !== 2 && updateHandler(2)
                        }
                    ]}
                />

                {
                    (!route.params?.serviceId || route.params?.serviceId && initialValue) ? (
                        <>
                            <Section0
                                bottomSheetRef={section0BottomSheetRef}
                                initialValue={initialValue}
                                ref={section0Ref}
                                updateHandler={updateHandler}
                            />

                            <Section1
                                bottomSheetRef={section1BottomSheetRef}
                                initialValue={initialValue}
                                ref={section1Ref}
                                updateHandler={updateHandler}
                            />

                            <Section2
                                bottomSheetRef={section2BottomSheetRef}
                                initialValue={initialValue}
                                formRefs={{ section0Ref, section1Ref }}
                            />
                        </>
                    ) : <Loading />
                }

                <Form type='material' />
                <Form type='subService' />
                <Toast
                    toastPosition="top"
                    maxDragDistance={65}
                    toastOffset={"20%"}
                />
            </Container>
        </TouchableWithoutFeedback>
    )
}