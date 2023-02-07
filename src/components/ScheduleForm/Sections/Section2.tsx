import React, { useState } from 'react';
import { View, Text, ViewStyle } from "react-native";

import { useColorScheme } from 'nativewind';
import colors from 'global/colors';
import clsx from 'clsx';

import PaymentMethodsIcon from 'assets/icons/currency_exchange.svg';

// Components
import SectionBottomSheet from '../SectionBottomSheet';
import { MARGIN, NextButton, Section, SubSection, SubSectionWrapper, SubSectionWrapperProps } from '../SubSectionWrapper';
import Label from 'components/Label';

interface ReviewSectionProps {
    wrapperProps: SubSectionWrapperProps;
    value: string;
    multiline?: boolean;
}

const ReviewSection = ({ wrapperProps, value, multiline }: ReviewSectionProps) => (
    <SubSectionWrapper {...wrapperProps} >
        {/* <View className='flex-col items-start justify-center mb-5' {...rest}>
            <Label>
                {label}
            </Label>
            
        </View> */}
        <View className={clsx("w-full px-4 py-3 mt-2 rounded-lg border border-gray-300 bg-black dark:bg-gray-300", {
            "min-h-[100px] pt-4": multiline,
        })}>
            <Text className='text-text-100'>
                {value}
            </Text>
        </View>
    </SubSectionWrapper>
)

export default function Section2({ bottomSheetRef, updateHandler }: Section) {
    return (
        <SectionBottomSheet bottomSheetRef={bottomSheetRef}>
            <View className='flex-col w-full items-start justify-center mb-5'>
                <Text className='font-titleBold text-start text-2xl text-black dark:text-white'>
                    Confira se as informações abaixo estão corretas.
                </Text>
                <Text className='text-sm text-start mt-1 text-black dark:text-white'>
                    Caso não, volte aos passos anteriores para corrigir.
                </Text>
            </View>

            <ReviewSection
                wrapperProps={{ header: { title: "Nome do Serviço" } }}
                value={"---"}
            />
            <View className='flex-row w-full'>
                <ReviewSection
                    wrapperProps={{
                        header: { title: "Data" },
                        style: { flex: 1, marginRight: 10 },
                    }}
                    value={"---"}
                />
                <ReviewSection
                    wrapperProps={{
                        header: { title: "Hora" },
                        style: { flex: 1 },
                    }}
                    value={"---"}
                />
            </View>

            <ReviewSection
                wrapperProps={{
                    header: { title: "Condições	de Pagamento", icon: "credit-card" },
                    style: { flex: 1 },
                }}
                value={"---"}
            />

            <ReviewSection
                wrapperProps={{
                    header: { title: "Métodos de Pagamento", customIcon: PaymentMethodsIcon as any },
                    style: { flex: 1 },
                }}
                value={"---"}
            />

            <NextButton section={2} updateHandler={updateHandler} />
        </SectionBottomSheet>
    )
}