import React, { useCallback, useEffect, useRef } from 'react';
import { BackHandler, Keyboard, TouchableOpacity, TouchableWithoutFeedback, View, Text } from "react-native";
import { useSharedValue, withSpring } from 'react-native-reanimated';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Toast from 'components/Toast';
import SectionBottomSheet from 'components/ScheduleForm/SectionBottomSheet';
import { SectionsNavigator } from 'components/SectionsNavigator';

// Database
import { database } from 'database/index.native';

// Types
import type { BottomSheetActions } from 'components/BottomSheet';

export default function Register() {
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

    useEffect(() => {
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
            <View className='flex-1 px-6 pt-12' style={{ rowGap: 20 }}>
                <TouchableOpacity className='flex-row bg-gray-200 items-center justify-center gap-y-[5px] p-[5px]'>
                    <MaterialIcons name='close' size={14} color={colors.white} />
                    <Text className='text-white text-sm'>Cancelar</Text>
                </TouchableOpacity>
                <View className='flex-col items-center justify-center' style={{ rowGap: 15 }}>
                    <Text className='font-logoRegular leading-[95%] text-4xl text-white'>
                        Vamos começar com o básico.
                    </Text>
                    <Text className='text-white text-sm font-semibold text-center'>
                        Insira os dados básicos que caracterizam sua empresa.
                    </Text>
                </View>
                <SectionsNavigator
                    selectedId={selectedSectionId}
                    sections={[
                        {
                            id: 0,
                            title: "Sua Empresa",
                            onPress: () => selectedSectionId.value !== 0 && updateHandler(0)
                        },
                        {
                            id: 1,
                            title: "Dados",
                            onPress: () => selectedSectionId.value !== 1 && updateHandler(1)
                        },
                        {
                            id: 2,
                            title: "Pagamentos",
                            onPress: () => selectedSectionId.value !== 2 && updateHandler(2)
                        }
                    ]}
                />

                <SectionBottomSheet bottomSheetRef={section0BottomSheetRef} expanded={false}>

                </SectionBottomSheet>

                <Toast
                    toastPosition="top"
                    maxDragDistance={65}
                    toastOffset={"20%"}
                />
            </View>
        </TouchableWithoutFeedback>
    )
}