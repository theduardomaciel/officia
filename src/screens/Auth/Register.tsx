import React, { useCallback, useEffect, useRef } from 'react';
import { BackHandler, Keyboard, TouchableOpacity, TouchableWithoutFeedback, View, Text } from "react-native";
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Container from 'components/Container';
import Toast from 'components/Toast';
import ImagePicker from 'components/ImagePicker';
import SectionBottomSheet from 'components/ScheduleForm/SectionBottomSheet';
import { SectionsNavigator } from 'components/SectionsNavigator';

import { BasicInfo } from 'screens/Main/Business/screens/BasicInfo';
import { ContactAndAddress } from 'screens/Main/Business/screens/ContactAndAddress';
import { ActionButton } from 'components/Button';

// Form
import { SubmitErrorHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { basicInfoScheme, BasicInfoSchemeType, BusinessData, contactAndAddressScheme, ContactAndAddressSchemeType } from 'screens/Main/Business/@types';
import { updateData } from 'screens/Main/Business';

import { useAuth } from 'context/AuthContext';
import BottomSheet from 'components/BottomSheet';

export default function Register({ route, navigation }: any) {
    const { email } = route.params;
    const { signIn } = useAuth();
    const selectedSectionId = useSharedValue(0);

    const section0BottomSheet = "registerSection0BottomSheet"
    const section1BottomSheet = "registerSection1BottomSheet"
    const section2BottomSheet = "registerSection2BottomSheet"

    const sections = [section0BottomSheet, section1BottomSheet, section2BottomSheet];

    const [newBusinessData, setNewBusinessData] = React.useState<Partial<BusinessData> | undefined>(undefined);

    const updateHandler = useCallback((id: number) => {
        if (sections[selectedSectionId.value] && sections[id] && id >= 0) {
            BottomSheet.close(sections[selectedSectionId.value]);
            selectedSectionId.value = withSpring(id, {
                damping: 100,
                stiffness: 400
            });
            BottomSheet.expand(sections[id]);
        } else {
            navigation.goBack();
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

        BottomSheet.expand(section0BottomSheet);

        return () => backHandler.remove();
    }, [])

    const { handleSubmit: section0HandleSubmit, control: section0Control, formState: { errors: section0Errors } } = useForm<BasicInfoSchemeType>({
        mode: 'onSubmit',
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        },
        resolver: zodResolver(basicInfoScheme)
    });

    const { handleSubmit: section1HandleSubmit, control: section1Control, formState: { errors: section1Errors }, setValue } = useForm<ContactAndAddressSchemeType>({
        mode: 'onSubmit',
        defaultValues: {
            email: email ?? undefined,
        },
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        },
        resolver: zodResolver(contactAndAddressScheme)
    });

    const onError: SubmitErrorHandler<BasicInfoSchemeType & ContactAndAddressSchemeType> = (errors, e) => {
        console.log(errors)
        //setFocus(Object.keys(errors)[0] as unknown as keyof BasicInfoSchemeType)
        Toast.show({
            preset: "error",
            title: "Algo está errado com os dados inseridos.",
            message: Object.values(errors).map(error => error.message).join('\n')
        })
    }

    const submitSection0Data = section0HandleSubmit(async (data) => {
        setNewBusinessData(prevState => ({ ...prevState, ...data }))
        updateHandler(1);
    }, onError);

    const submitSection1Data = section1HandleSubmit(async (data) => {
        //setNewBusinessData(prevState => ({ ...prevState, ...data }))
        const fullData = { ...newBusinessData, ...data }
        const result = await updateData(fullData, {})
        if (result) {
            signIn(result)
        } else {
            Toast.show({
                preset: "error",
                title: "Algo deu errado.",
                message: "Não foi possível criar sua empresa. Tente novamente mais tarde."
            })
        }
    }, onError);

    return (
        <Container style={{ rowGap: 10 }}>
            <View className='w-full flex-col items-center justify-center'>
                <TouchableOpacity
                    className='flex-row bg-gray-200 items-center justify-center rounded-sm p-[5px]'
                    style={{ columnGap: 5 }}
                    onPress={() => selectedSectionId.value >= 0 && updateHandler(selectedSectionId.value - 1)}
                >
                    {/* {
                        selectedSectionId.value === 0 ? (
                            <>
                                <MaterialIcons name='close' size={14} color={colors.white} />
                                <Text className='text-white text-sm'>Cancelar</Text>
                            </>
                        ) : (
                            <>
                                
                            </>
                        )
                    } */}
                    <MaterialIcons name='arrow-back' size={14} color={colors.white} />
                    <Text className='text-white text-sm'>Voltar</Text>
                </TouchableOpacity>
            </View>

            <View className='flex-col items-center justify-center' style={{ rowGap: 10 }}>
                <Text className='font-logoRegular leading-[95%] text-4xl text-white text-center w-5/6'>
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
                    },
                    {
                        id: 1,
                        title: "Orçamentos",
                    }/* ,
                    {
                        id: 2,
                        title: "Sua Conta",
                    } */
                ]}
            />

            <SectionBottomSheet
                bottomSheet={section0BottomSheet}
                expanded={false}
                bottomSheetHeight={"67%"}
            >
                {/* <ImagePicker
                    businessData={newBusinessData}
                    onUpdate={async (updatedBusinessData) => {
                        setNewBusinessData(prevState => ({ ...prevState, ...updatedBusinessData }))
                    }}
                /> */}
                <BasicInfo control={section0Control} errors={section0Errors} />
                <ActionButton onPress={submitSection0Data} preset="next" label='Próximo' />
            </SectionBottomSheet>

            <SectionBottomSheet
                bottomSheet={section1BottomSheet}
                expanded={false}
                bottomSheetHeight={"67%"}
            >
                <ContactAndAddress
                    control={section1Control}
                    errors={section1Errors}
                    businessData={newBusinessData!}
                    onAddressFetch={(addressText) => {
                        setValue("address", "")
                        setNewBusinessData({ ...newBusinessData, geocodedAddress: addressText })
                    }}
                />
                <ActionButton
                    onPress={submitSection1Data}
                    preset="next"
                    style={{ backgroundColor: colors.primary.green }}
                    label='Concluir'
                />
            </SectionBottomSheet>

            <Toast
                toastPosition="top"
                maxDragDistance={65}
                toastOffset={"20%"}
            />
        </Container>
    )
}