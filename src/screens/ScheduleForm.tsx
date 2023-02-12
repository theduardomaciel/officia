import React, { useRef, useCallback } from 'react';
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useSharedValue, withSpring } from 'react-native-reanimated';

import Header from 'components/Header';
import { SectionsNavigator } from 'components/SectionsNavigator';

import Section0 from 'components/ScheduleForm/Sections/Section0';
import Section1 from 'components/ScheduleForm/Sections/Section1';
import Section2 from 'components/ScheduleForm/Sections/Section2';
import Form from 'components/ScheduleForm/Forms/Form';

export default function ScheduleForm() {
    const selectedSectionId = useSharedValue(0);

    const section0BottomSheetRef = useRef<any>(null);
    const section1BottomSheetRef = useRef<any>(null);
    const section2BottomSheetRef = useRef<any>(null);

    const sections = [section0BottomSheetRef, section1BottomSheetRef, section2BottomSheetRef];

    const updateHandler = useCallback((id: number) => {
        if (sections[selectedSectionId.value] && sections[id]) {
            sections[selectedSectionId.value].current.close();
            selectedSectionId.value = withSpring(id, {
                damping: 100,
                stiffness: 400
            });
            sections[id].current.expand();
        }
    }, [])

    const section0Ref = useRef<any>(null);
    const section1Ref = useRef<any>(null);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className='flex-1 min-h-full px-6 pt-12 gap-y-5'>
                <View>
                    <Header
                        title='Agendamento'
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
                <Section0 bottomSheetRef={section0BottomSheetRef} ref={section0Ref} updateHandler={updateHandler} />
                <Section1 bottomSheetRef={section1BottomSheetRef} ref={section1Ref} updateHandler={updateHandler} />
                <Section2 bottomSheetRef={section2BottomSheetRef} formRefs={{ section0Ref, section1Ref }} />
                <Form type='material' />
                <Form type='subService' />
            </View>
        </TouchableWithoutFeedback>
    )
}