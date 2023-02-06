import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, useWindowDimensions, TouchableOpacity } from "react-native";
import { useSharedValue, withSpring } from 'react-native-reanimated';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

import Header from 'components/Header';
import Input from 'components/Input';
import { SectionsNavigator } from 'components/SectionsNavigator';
import { CalendarDate, StaticCalendar } from 'components/Calendar';

import BottomSheet, { animProps } from 'components/BottomSheet';
import AddSubService from 'components/ScheduleForm/AddSubService';

import { ServicePreview } from 'components/ServicePreview';
import { MARGIN, SubSection, SubSectionWrapper } from 'components/ScheduleForm/SubSectionWrapper';

import type { Material, SubService } from 'types/service';
import { SubActionButton } from 'components/ActionButton';
import Modal from 'components/Modal';
import DatePicker from 'react-native-date-picker';
import { useColorScheme } from 'nativewind';
import { database } from 'database';
import { ServiceModel } from 'database/models/serviceModel';
import Label from 'components/Label';
import ToggleGroup from 'components/ToggleGroup';

export default function ScheduleForm() {
    const { height } = useWindowDimensions();

    const [section, setSection] = React.useState(0);
    const selectedSectionId = useSharedValue(section);

    const bottomSheetRef = useRef<any>(null);
    const updateHandler = useCallback((id: number) => {
        selectedSectionId.value = withSpring(id, animProps);
        bottomSheetRef.current.update(() => setSection(id));
    }, [])

    return (
        <View className='flex-1 min-h-full px-6 pt-12 gap-y-5'>
            {/* <StatusBar backgroundColor={colors.gray[300]} barStyle={"light-content"} /> */}
            <View>
                <Header
                    title='Agendamento'
                    cancelButton={section === 0}
                    returnButton={section !== 0 ? () => updateHandler(section - 1) : undefined}
                />
            </View>
            <SectionsNavigator
                selectedId={selectedSectionId}
                sections={[
                    {
                        id: 0,
                        title: "Básico",
                        onPress: () => section !== 0 && updateHandler(0)
                    },
                    {
                        id: 1,
                        title: "Detalhes",
                        onPress: () => section !== 1 && updateHandler(1)
                    },
                    {
                        id: 2,
                        title: "Revisão",
                        onPress: () => section !== 2 && updateHandler(2)
                    }
                ]}
            />
            <BottomSheet
                ref={bottomSheetRef}
                defaultValues={{
                    expanded: true,
                    suppressBackdrop: true,
                    suppressHandle: true,
                    suppressPortal: true
                }}
                height={"76%"}
                canDismiss={false}
                heightLimitBehaviour="contentHeight"
                colors={{
                    background: colors.gray[500],
                }}
            >
                <View
                    className="flex flex-1"
                    style={{
                        paddingTop: 24,
                        paddingLeft: 24,
                        paddingRight: 24,
                        paddingBottom: 12
                    }}
                >
                    {
                        section === 0 ? (
                            <Section0 updateHandler={updateHandler} />
                        ) : section === 1 ? (
                            <Section1 updateHandler={updateHandler} />
                        ) : (
                            <Section2 updateHandler={updateHandler} />
                        )
                    }
                </View>
            </BottomSheet>
        </View>
    )
}

type updateHandler = (id: number) => void;
interface Section {
    updateHandler: updateHandler;
}

async function getServiceNumber() {
    const servicesCollection = database.get<ServiceModel>('services');
    const count = await servicesCollection.query().fetchCount();
    return count;
}

const Section0 = ({ updateHandler }: Section) => {
    const { colorScheme } = useColorScheme();

    const currentDate = new Date();
    const name = useRef('');

    const [subServices, setSubServices] = useState<SubService[]>([]);
    const [selectedDate, setSelectedDate] = useState<CalendarDate | undefined>(undefined);
    const [hourAndMinute, setHourAndMinute] = useState(new Date())
    const additionalInfo = useRef('');
    const [materials, setMaterials] = useState<Material[]>([]);

    const dateModalRef = useRef<any>(null);
    const serviceBottomSheetRef = useRef<any>(null);

    const serviceBottomSheetOpenHandler = useCallback(() => {
        serviceBottomSheetRef.current.expand();
    }, [])

    return (
        <>
            <Input
                label='Nome do Serviço'
                placeholder={`Serviço n.${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`}
                style={{ marginBottom: MARGIN }}
                onChange={(e) => {
                    name.current = e.nativeEvent.text;
                }}
            />

            <SubSectionWrapper
                header={{
                    title: "Serviços",
                    children: subServices && subServices?.length > 0 && <Text className='font-medium text-primary-red text-xs opacity-80'>
                        Arraste para excluir
                    </Text>
                }}
            >
                <View className='w-full'>
                    {
                        subServices && subServices?.length === 0 && (
                            <Text className='text-sm text-center text-black dark:text-white mb-6'>
                                Nenhum serviço adicionado.
                            </Text>
                        )
                    }
                    {
                        subServices.map((subService, index) => (
                            <View className='mb-4' key={index.toString()}>
                                <ServicePreview subService={subService} setSubServices={setSubServices} />
                            </View>
                        ))
                    }
                </View>
                <SubActionButton
                    onPress={serviceBottomSheetOpenHandler}
                    label='Adicionar serviço'
                />
            </SubSectionWrapper>

            <SubSectionWrapper header={{ title: "Data" }}>
                <StaticCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} style={{ padding: 16, backgroundColor: colors.gray[600] }} />
            </SubSectionWrapper>

            <Input
                onPress={() => dateModalRef.current.open()}
                label='Horário'
                editable={false}
                value={`${hourAndMinute.getHours()}:${hourAndMinute.getMinutes()}`}
                style={{ marginBottom: MARGIN }}
            />

            <Input
                label='Informações Adicionais'
                textAlignVertical='top'
                style={{ marginBottom: MARGIN, minHeight: 100, paddingTop: 15 }}
                multiline
                onChange={(e) => {
                    additionalInfo.current = e.nativeEvent.text;
                }}
                placeholder='Ex: O serviço deve ser realizado na sala 2, no 2º andar.'
            />

            <NextButton section={0} updateHandler={updateHandler} />

            <AddSubService
                serviceBottomSheetRef={serviceBottomSheetRef}
                setSubServices={setSubServices}
                materials={materials}
                setMaterials={setMaterials}
            />
            <Modal ref={dateModalRef}
                title={"Selecione o horário"}
                icon="calendar-today"
                buttons={[
                    {
                        label: "Confirmar",
                        onPress: () => { },
                        closeOnPress: true,
                    }
                ]}
                cancelButton
            >
                <View className='flex flex-1 w-full items-center justify-center'>
                    <DatePicker
                        date={hourAndMinute}
                        onDateChange={setHourAndMinute}
                        fadeToColor={colorScheme === "light" ? colors.white : colors.gray[200]}
                        androidVariant="nativeAndroid"
                        minuteInterval={15}
                        mode='time'
                        locale='en'
                        is24hourSource='locale'
                    />
                </View>
            </Modal>
        </>
    )
}

type PaymentMethod = 'full' | 'installments' | 'agreement';

const Section1 = ({ updateHandler }: Section) => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('full');

    return (
        <>
            <SubSectionWrapper header={{ title: "Condições de Pagamento", icon: "credit-card" }}>
                <View className='flex-col w-full gap-y-2'>
                    <View>
                        <ToggleGroup
                            data={[
                                {
                                    label: 'à vista',
                                    value: 'full',
                                },
                                {
                                    label: 'parcelado',
                                    value: 'installments',
                                },
                                {
                                    label: "acordo",
                                    value: 'agreement',
                                }
                            ]}
                            onSelectedChange={(value) => setPaymentMethod(value as PaymentMethod)}
                        />
                    </View>
                    <View>
                        <ToggleGroup
                            data={[
                                {
                                    label: '%',
                                    value: 'percentage',
                                },
                                {
                                    label: 'R$',
                                    value: 'money',
                                },
                            ]}
                            onSelectedChange={(value) => console.log(value)}
                        />
                    </View>
                </View>
                {
                    paymentMethod === "agreement" ? (
                        <View>
                            <SubSection header={{ title: "Qual o percentual do acordo?" }}>
                                <View>
                                    <ToggleGroup
                                        data={[
                                            {
                                                label: '30%',
                                                value: '30',
                                            },
                                            {
                                                label: '50%',
                                                value: '50',
                                            },
                                        ]}
                                        manualValue={{
                                            placeholder: "Outro (%)",
                                            onChange: (value) => console.log(value),
                                        }}
                                        onSelectedChange={(value) => console.log(value)}
                                    />
                                </View>
                            </SubSection>
                        </View>
                    ) : null
                }
                <View>
                    <SubSection header={{ title: "Como o valor restante será pago?" }}>
                        <View>
                            <ToggleGroup
                                data={[
                                    {
                                        label: 'após a conclusão',
                                        value: 'after completion',
                                    },
                                    {
                                        label: 'em parcelas',
                                        value: 'in installments',
                                    },
                                ]}
                                onSelectedChange={(value) => console.log(value)}
                            />
                        </View>
                    </SubSection>
                </View>
            </SubSectionWrapper>

            <NextButton section={1} updateHandler={updateHandler} />
        </>
    )
}

const Section2 = ({ updateHandler }: Section) => {
    return (
        <>

            <NextButton section={2} updateHandler={updateHandler} />
        </>
    )
}

const NextButton = ({ section, updateHandler }: { section: number, updateHandler: updateHandler }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            className='flex-row items-center justify-center w-full py-4 rounded'
            onPress={section === 2 ? () => updateHandler(0) : () => updateHandler(section + 1)}
            style={{
                backgroundColor: section === 2 ? colors.primary.green : colors.gray[200],
            }}
        >
            <Text className='font-bold text-white text-base'>
                {section === 2 ? "Agendar" : "Próximo"}
            </Text>
        </TouchableOpacity>
    )
}