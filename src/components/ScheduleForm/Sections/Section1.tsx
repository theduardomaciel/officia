import React, { useRef, useState } from 'react';
import { View, Text } from "react-native";

import { useColorScheme } from 'nativewind';
import colors from 'global/colors';
import CurrencyExchangeIcon from 'src/assets/icons/currency_exchange.svg';

// Components
import SectionBottomSheet from '../SectionBottomSheet';
import { NextButton, Section, SubSection, SubSectionWrapper } from '../SubSectionWrapper';
import ToggleGroup, { RefProps, StaticToggleGroup } from 'components/ToggleGroup';
import CheckboxesGroups from 'components/CheckboxesGroup';
import Input from 'components/Input';
import { useScheduleFormSection1Context } from 'components/contexts/Section1Context';

// Types
type PaymentCondition = 'full' | 'installments' | 'agreement';
type SplitMethod = 'percentage' | 'money';
type RemainingValue = 'afterCompletion' | 'withInstallments'
type WarrantyPeriod = 'days' | 'months' | 'years';

const paymentMethods = ['Boleto', 'Dinheiro', 'Transferência Bancária', 'Cartão de Crédito', 'Cartão de Débito', 'Pix']

export default function Section1({ bottomSheetRef, updateHandler }: Section) {
    /* const [paymentCondition, setPaymentCondition] = useState<PaymentCondition>('full');
    const [splitMethod, setSplitMethod] = useState<SplitMethod | null>('percentage');

    const [agreementInitialPercentage, setAgreementInitialPercentage] = useState<string>("50");
    const [agreementInitialValue, setAgreementInitialValue] = useState<string>("0");

    const [remainingValue, setRemainingValue] = useState<RemainingValue>("afterCompletion");
    const [installmentsAmount, setInstallmentsAmount] = useState<string>("2x");

    const checkedPaymentMethodsRef = useRef<string[]>([]);

    const [warrantyPeriodType, setWarrantyPeriodType] = useState<WarrantyPeriod>('days');
    const [warrantyPeriod, setWarrantyPeriod] = useState<string>("30"); */

    const {
        data: {
            paymentCondition,
            splitMethod,
            agreementInitialPercentage,
            agreementInitialValue,
            remainingValue,
            checkedPaymentMethods,
            installmentsAmount,
            warrantyPeriodType,
            warrantyPeriod
        },
        setData: {
            setPaymentCondition,
            setSplitMethod,
            setAgreementInitialPercentage,
            setAgreementInitialValue,
            setRemainingValue,
            setInstallmentsAmount,
            setWarrantyPeriodType,
            setWarrantyPeriod
        }
    } = useScheduleFormSection1Context();

    return (
        <SectionBottomSheet bottomSheetRef={bottomSheetRef}>
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
                            selected={paymentCondition}
                            setSelected={(value) => setPaymentCondition(value as PaymentCondition)}
                        />
                    </View>
                    {
                        paymentCondition === "agreement" && (
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
                                    selected={splitMethod}
                                    setSelected={(value) => setSplitMethod(value as SplitMethod)}
                                />
                            </View>
                        )
                    }
                </View>
                <View>
                    {
                        paymentCondition === "agreement" && (
                            splitMethod === "percentage" ? (
                                <SubSection header={{ title: `Qual o percentual do acordo?` }}>
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
                                                inputProps: {
                                                    placeholder: "Outro (%)",
                                                    keyboardType: "number-pad"
                                                },
                                                maxValue: 100
                                            }}
                                            selected={agreementInitialPercentage}
                                            setSelected={(value) => setAgreementInitialPercentage(value as string)}
                                        />
                                    </View>
                                </SubSection>
                            ) : <SubSection header={{ title: `Qual o valor inicial a ser pago com o acordo?` }}>
                                <View>
                                    <ToggleGroup
                                        data={[
                                            {
                                                label: 'metade',
                                                value: '50',
                                            },
                                        ]}
                                        manualValue={{
                                            inputProps: {
                                                placeholder: "Outro (R$)",
                                                keyboardType: "number-pad"
                                            }
                                        }}
                                        selected={agreementInitialValue}
                                        setSelected={(value) => setAgreementInitialValue(value as string)}
                                    />
                                </View>
                            </SubSection>
                        )
                    }
                </View>
                {
                    paymentCondition === "agreement" && (
                        <SubSection header={{ title: "Como o valor restante será pago?" }}>
                            <View>
                                <ToggleGroup
                                    data={[
                                        {
                                            label: 'após a conclusão',
                                            value: 'afterCompletion',
                                        },
                                        {
                                            label: 'em parcelas',
                                            value: 'withInstallments',
                                        },
                                    ]}
                                    selected={remainingValue}
                                    setSelected={(value) => setRemainingValue(value as RemainingValue)}
                                />
                            </View>
                        </SubSection>
                    )
                }
                {
                    (paymentCondition === "installments" || paymentCondition === "agreement" && remainingValue === "withInstallments") && (
                        <SubSection header={{ title: "Em quantas parcelas o valor será dividido?" }}>
                            <View>
                                <ToggleGroup
                                    data={[
                                        {
                                            label: '2x',
                                            value: '2x',
                                        },
                                        {
                                            label: '3x',
                                            value: '3x',
                                        },
                                    ]}
                                    manualValue={{
                                        inputProps: {
                                            placeholder: "Outro (parcelas)",
                                            keyboardType: "number-pad"
                                        }
                                    }}
                                    selected={installmentsAmount}
                                    setSelected={(value) => setInstallmentsAmount(value as string)}
                                />
                            </View>
                        </SubSection>
                    )
                }
            </SubSectionWrapper>

            <SubSectionWrapper
                header={{
                    title: "Métodos de Pagamento",
                    customIcon: CurrencyExchangeIcon as any,
                }}
            >
                <View>
                    <CheckboxesGroups
                        data={paymentMethods}
                        ref={checkedPaymentMethods}
                    /* checked={checkedPaymentMethods}
                    setChecked={setCheckedPaymentMethods} */
                    />
                </View>
            </SubSectionWrapper>

            <SubSectionWrapper
                header={{
                    title: "Métodos de Pagamento",
                    customIcon: CurrencyExchangeIcon as any,
                }}
            >
                <View className='flex-col w-full gap-y-2'>
                    <View>
                        <ToggleGroup
                            data={[
                                {
                                    label: "dias",
                                    value: "days",
                                },
                                {
                                    label: "meses",
                                    value: "months",
                                },
                                {
                                    label: "anos",
                                    value: "years",
                                }
                            ]}
                            selected={warrantyPeriodType}
                            setSelected={(value) => setWarrantyPeriodType(value as WarrantyPeriod)}
                        />
                    </View>
                    {
                        warrantyPeriodType === "days" ? (
                            <View>
                                <ToggleGroup
                                    data={[
                                        {
                                            label: '30 dias',
                                            value: '30',
                                        },
                                        {
                                            label: '60 dias',
                                            value: '60',
                                        },
                                    ]}
                                    manualValue={{
                                        inputProps: {
                                            placeholder: "Outro (dias)",
                                            keyboardType: "number-pad"
                                        }
                                    }}
                                    selected={warrantyPeriod}
                                    setSelected={(value) => setWarrantyPeriod(value as string)}
                                />
                            </View>
                        ) : warrantyPeriodType === "months" ? (
                            <View>
                                <ToggleGroup
                                    data={[
                                        {
                                            label: '1 mês',
                                            value: '30',
                                        },
                                        {
                                            label: '2 meses',
                                            value: '60',
                                        },
                                    ]}
                                    manualValue={{
                                        inputProps: {
                                            placeholder: "Outro (meses)",
                                            keyboardType: "number-pad"
                                        }
                                    }}
                                    selected={warrantyPeriod}
                                    setSelected={(value) => setWarrantyPeriod(value as string)}
                                />
                            </View>
                        ) : (
                            <View>
                                <ToggleGroup
                                    data={[
                                        {
                                            label: '1 ano',
                                            value: '360',
                                        },
                                        {
                                            label: '2 anos',
                                            value: '720',

                                        },
                                    ]}
                                    manualValue={{
                                        inputProps: {
                                            placeholder: "Outro (anos)",
                                            keyboardType: "number-pad"
                                        }
                                    }}
                                    selected={warrantyPeriod}
                                    setSelected={(value) => setWarrantyPeriod(value as string)}
                                />
                            </View>
                        )
                    }
                </View>
                <Text className='text-center text-gray-100 text-sm w-full'>
                    O prazo de garantia legal para serviços e produtos duráveis estabelecido por lei é de <Text className='font-bold'>90 dias</Text>.
                </Text>

                <View className='w-full'>
                    <SubSection header={{ title: "Condições da Garantia" }}>
                        <View className='w-full'>
                            <Input
                                placeholder='Ex: A garantia não acoberta problemas que envolvam o desgaste dos materiais'
                                style={{ width: "100%" }}
                                multiline
                            />
                        </View>
                    </SubSection>
                </View>
            </SubSectionWrapper>

            <NextButton section={1} updateHandler={updateHandler} />
        </SectionBottomSheet>
    )
}