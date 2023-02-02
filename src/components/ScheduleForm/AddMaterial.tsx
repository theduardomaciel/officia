import React, { useRef, useCallback, Dispatch, SetStateAction } from 'react';
import { View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';

// Utils
import { v4 as uuidv4 } from 'uuid';

// Types
import type { SubService } from 'utils/data';
import type { Tag } from 'components/TagsSelector';

// Components
import BottomSheet from 'components/BottomSheet';
import Input from 'components/Input';
import Dropdown from 'components/Dropdown';
import ActionButton from 'components/ActionButton';
import Title from 'components/Title';

type FormValues = {
    description: string;
    details: string;
    price: number;
    amount: number;
};

export default function AddMaterial({ setSubServices, serviceBottomSheetRef }: { serviceBottomSheetRef: React.MutableRefObject<any>, setSubServices: Dispatch<SetStateAction<SubService[]>> }) {
    const [preServiceAvailability, setPreServiceAvailability] = React.useState("unavailable");
    const selectedTags = useRef<Tag[] | null>(null);

    const serviceBottomSheetCloseHandler = useCallback(() => {
        serviceBottomSheetRef.current.close();
    }, [])

    const { register, setValue, handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            description: '',
            details: '',
            price: 0,
            amount: 1,
        },
    });

    const onSubmit: SubmitHandler<FormValues> = data => {
        const newSubService = {
            id: uuidv4(),
            description: data.description,
            details: data.details,
            price: data.price,
            amount: data.amount,
            types: selectedTags.current as any
        } as SubService;
        serviceBottomSheetCloseHandler();
        setSubServices((previousValue: SubService[]) => [...previousValue, newSubService]);
        reset();
    };

    const onChange = (arg: any) => {
        return {
            value: arg.nativeEvent.text,
        };
    };

    return (
        <BottomSheet
            height={"65%"}
            ref={serviceBottomSheetRef}
        >
            <View
                className='flex flex-1 gap-y-5'
                style={{
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingBottom: 12
                }}
            >
                <Title>
                    Adicionar material
                </Title>
                <ScrollView className='flex flex-1 gap-y-5 relative' showsVerticalScrollIndicator={false} contentContainerStyle={{
                    paddingBottom: 16
                }}>


                    <View className='flex-row w-full items-center justify-between'>
                        <View className='flex-1 mr-3'>
                            <Input label='Margem de Lucro' pallette='dark' keyboardType={"number-pad"} />
                        </View>
                        <View className='flex-1'>
                            <Dropdown
                                label='Disponibilidade'
                                bottomSheetHeight={"20%"}
                                setSelected={setPreServiceAvailability}
                                selected={preServiceAvailability}
                                pallette='dark'
                                data={[
                                    { label: "Disponível", value: "available" },
                                    { label: "Indisponível", value: "unavailable" }
                                ]} />
                        </View>
                    </View>
                </ScrollView>
                <ActionButton
                    label='Adicionar serviço'
                    icon='add'
                    onPress={handleSubmit(onSubmit)}
                />
            </View>
        </BottomSheet>
    )
}