import React, { useCallback, useState } from 'react';
import { View, Text, ViewStyle } from "react-native";

import { useColorScheme } from 'nativewind';
import colors from 'global/colors';
import clsx from 'clsx';

import PaymentMethodsIcon from 'assets/icons/currency_exchange.svg';
import WarrantyIcon from 'assets/icons/warranty.svg';

// Components
import SectionBottomSheet from '../SectionBottomSheet';
import { MARGIN, NextButton, Section, SubSection, SubSectionWrapper, SubSectionWrapperProps } from '../SubSectionWrapper';
import Loading from 'components/Loading';

// Utils
import { database } from 'database';

// Functions

async function getServiceNumber() {
    const servicesCollection = database.get<ServiceModel>('services');
    const count = await servicesCollection.query().fetchCount();
    return count + 1;
}

function daysToMonthsOrYears(days: number) {
    console.log(days)
    if (days < 30) {
        return `${days} dia${days > 1 ? 's' : ''}`;
    }
    if (days < 365) {
        return `${Math.floor(days / 30)} ${Math.floor(days / 30) > 1 ? 'meses' : 'mês'}`;
    }
    return `${Math.floor(days / 360)} ano${Math.floor(days / 360) > 1 ? 's' : ''}`;
}

// Types
import type { Section0Props, Section0RefProps, Section1Props, Section1RefProps } from '../types';
import type { ServiceModel } from 'database/models/serviceModel';
import { PreviewStatic } from 'components/Preview';

interface ReviewSectionProps {
    wrapperProps: SubSectionWrapperProps;
    value: string;
    multiline?: boolean;
}

const ReviewSection = ({ wrapperProps, value, multiline }: ReviewSectionProps) => (
    <SubSectionWrapper {...wrapperProps} >
        <View className={clsx("w-full px-4 py-3 mt-2 rounded-lg border border-gray-300 bg-black dark:bg-gray-300", {
            "min-h-[100px] pt-4": multiline,
        })}>
            <Text className='text-text-100'>
                {value}
            </Text>
        </View>
    </SubSectionWrapper>
)

interface Section2Props extends Section {
    formRefs: {
        section0Ref: React.RefObject<Section0RefProps>;
        section1Ref: React.RefObject<Section1RefProps>;
    }
}

export default function Section2({ bottomSheetRef, formRefs }: Section2Props) {
    const { section0Ref, section1Ref } = formRefs;

    const currentDate = new Date();
    const [data, setData] = useState<Section0Props & Section1Props & { serviceId: number } | undefined | null>(undefined);

    const onExpanded = async () => {
        if (formRefs) {
            const section0Data = section0Ref.current?.getData();
            const section1Data = section1Ref.current?.getData();
            console.log({
                ...section0Data,
                ...section1Data,
            })

            const serviceId = await getServiceNumber();

            if (section0Data && section1Data) {
                setData({
                    ...section0Data,
                    ...section1Data,
                    serviceId,
                })
            }
        }
    }

    const onDismissed = useCallback(() => {
        setData(undefined) // voltamos ao estado de carregamento
    }, [])

    return (
        <SectionBottomSheet bottomSheetRef={bottomSheetRef} onExpanded={onExpanded} onDismissed={onDismissed}>
            {
                data ? (
                    <>
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
                            value={data.name || `Serviço n.0${data.serviceId}-${currentDate.getFullYear()}`}
                        />

                        <ReviewSection
                            wrapperProps={{ header: { title: "Informações Adicionais" } }}
                            value={data.additionalInfo ?? "[vazio]"}
                        />

                        <View className='flex-row w-full'>
                            <ReviewSection
                                wrapperProps={{
                                    header: { title: "Data" },
                                    style: { flex: 1, marginRight: 10 },
                                }}
                                value={new Date(`${currentDate.getFullYear()}-${data.date?.month! + 1}-${data.date?.date}T00:00:00Z`).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                })}
                            />
                            <ReviewSection
                                wrapperProps={{
                                    header: { title: "Hora" },
                                    style: { flex: 1 },
                                }}
                                value={`${data.time?.getHours()}:${data.time?.getMinutes()}${data.time.getMinutes() < 10 ? '0' : ''}`}
                            />
                        </View>

                        <ReviewSection
                            wrapperProps={{
                                header: { title: "Condições	de Pagamento", icon: "credit-card" },
                                style: { flex: 1 },
                            }}
                            value={data.installments ? `${data.installments} parcelas`
                                : data.agreement ? `${data.agreement.splitMethod === "percentage" ? `${data.agreement.agreementInitialValue}%` : `R% ${data.agreement.agreementInitialValue}`} antecipado e o valor restante ${data.agreement.remainingValue === "afterCompletion" ? "após a conclusão do serviço" : `dividido em ${data.installments} parcelas`}`
                                    : "À vista"
                            }
                        />

                        <ReviewSection
                            wrapperProps={{
                                header: { title: "Métodos de Pagamento", customIcon: PaymentMethodsIcon as any },
                                style: { flex: 1 },
                            }}
                            value={data?.checkedPaymentMethods?.length ? data?.checkedPaymentMethods.join(', ') : "---"}
                        />

                        <ReviewSection
                            wrapperProps={{
                                header: { title: "Garantia", customIcon: WarrantyIcon as any },
                                style: { flex: 1 },
                            }}
                            value={data.warrantyDays ? daysToMonthsOrYears(data.warrantyDays) : "---"}
                        />

                        {
                            data.subServices && data.subServices.length > 0 && (
                                <SubSectionWrapper
                                    style={{ flex: 1 }}
                                    header={{ title: "Serviços" }}
                                >
                                    <View className='w-full'>
                                        {
                                            data.subServices.map((subService, index) => (
                                                <View className='mb-4' key={index.toString()}>
                                                    <PreviewStatic subService={subService} />
                                                </View>
                                            ))
                                        }
                                    </View>
                                </SubSectionWrapper>
                            )
                        }

                        {
                            data.materials && data.materials.length > 0 && (
                                <SubSectionWrapper
                                    style={{ flex: 1 }}
                                    header={{ title: "Materiais" }}
                                >
                                    <View className='w-full'>
                                        {
                                            data.materials.map((material, index) => (
                                                <View className='mb-4' key={index.toString()}>
                                                    <PreviewStatic material={material} />
                                                </View>
                                            ))
                                        }
                                    </View>
                                </SubSectionWrapper>
                            )
                        }

                        <NextButton
                            isLastButton
                        />
                    </>
                ) : <Loading message='Aguarde enquanto verificamos os dados do agendamento...' /> /* : (
                    <View className='flex-col w-full items-center justify-center'>
                        <View className='flex-col w-full items-start justify-center mb-5'>
                            <Text className='font-titleBold text-start text-2xl text-black dark:text-white'>
                                Ainda há dados a serem preenchidos.
                            </Text>
                            <Text className='text-sm text-start mt-1 text-black dark:text-white'>
                                Por favor, volte aos passos anteriores para corrigir.
                            </Text>
                        </View>
                        <Text>
                            <Text className='font-titleBold text-start text-2xl text-black dark:text-white'>
                                O que falta?
                            </Text>
                        </Text>
                    </View>
                ) */
            }
        </SectionBottomSheet>
    )
}