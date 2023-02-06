import React, { useRef, useState, useCallback } from 'react';
import { View, Text } from "react-native";
import DatePicker from 'react-native-date-picker';

import { useColorScheme } from 'nativewind';
import colors from 'global/colors';

// Components
import Modal from 'components/Modal';
import Input from 'components/Input';
import AddSubService from '../Forms/AddSubService';
import SectionBottomSheet from '../SectionBottomSheet';
import { CalendarDate, StaticCalendar } from 'components/Calendar';
import { MARGIN, NextButton, Section, SubSectionWrapper } from '../SubSectionWrapper';
import { SubActionButton } from 'components/ActionButton';
import { ServicePreview } from 'components/ServicePreview';

// Types
import type { SubServiceModel } from 'database/models/subServiceModel';
import type { MaterialModel } from 'database/models/materialModel';

export default function Section0({ bottomSheetRef, updateHandler }: Section) {
    const { colorScheme } = useColorScheme();

    const currentDate = new Date();
    const name = useRef('');

    const [subServices, setSubServices] = useState<SubServiceModel[]>([]);
    const [selectedDate, setSelectedDate] = useState<CalendarDate | undefined>(undefined);
    const [hourAndMinute, setHourAndMinute] = useState(new Date())
    const additionalInfo = useRef('');
    const [materials, setMaterials] = useState<MaterialModel[]>([]);

    const dateModalRef = useRef<any>(null);

    const serviceBottomSheetRef = useRef<any>(null);
    const serviceBottomSheetOpenHandler = useCallback(() => {
        serviceBottomSheetRef.current.expand();
    }, [])

    return (
        <SectionBottomSheet bottomSheetRef={bottomSheetRef} expanded={true}>
            <Input
                label='Nome do Serviço'
                placeholder={`Serviço ${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`}
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
                style={{ marginBottom: MARGIN }}
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
        </SectionBottomSheet>
    )
}