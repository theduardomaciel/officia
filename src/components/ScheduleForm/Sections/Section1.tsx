import React, { forwardRef, useImperativeHandle, useMemo, useReducer, useRef, useState } from 'react';
import { View, Text } from "react-native";
import { z } from 'zod';

import { useColorScheme } from 'nativewind';
import colors from 'global/colors';

// Icons
import CurrencyExchangeIcon from 'src/assets/icons/currency_exchange.svg';
import WarrantyIcon from 'src/assets/icons/warranty.svg';

// Components
import SectionBottomSheet from '../SectionBottomSheet';
import { NextButton, Section, SubSection, SubSectionWrapper } from '../SubSectionWrapper';
import ToggleGroup, { ToggleGroupWithManualValue } from 'components/ToggleGroup';
import CheckboxesGroups from 'components/CheckboxesGroup';

// Forms
import Input from 'components/Input';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
    agreementInitialPercentage: z.number().int().lte(100),
    agreementInitialValue: z.string().max(10),
    installmentsAmount: z.string().regex(/^[0-9]+x$/),
});

interface FormData {
    agreementInitialPercentage: string,
    agreementInitialValue: string,
    installmentsAmount: string,
    warrantyDetails: string,
    warrantyPeriod_days: string,
    warrantyPeriod_months: string,
    warrantyPeriod_years: string,
};

// Types
type PaymentCondition = 'full' | 'installments' | 'agreement';
type SplitMethod = 'percentage' | 'money';
type RemainingValue = 'afterCompletion' | 'withInstallments'
type WarrantyPeriod = 'days' | 'months' | 'years';

const paymentMethods = ['Boleto', 'Dinheiro', 'Transferência Bancária', 'Cartão de Crédito', 'Cartão de Débito', 'Pix']

function checkedPaymentsReducer(state: any, action: any) {
    switch (action.type) {
        case 'add':
            return [...state, action.payload];
        case 'remove':
            return state.filter((item: any) => item !== action.payload);
        default:
            return state;
    }
}

const Section1 = forwardRef(({ bottomSheetRef, updateHandler, initialValue }: Section, ref) => {
    // General
    const [paymentCondition, setPaymentCondition] = useState<PaymentCondition>(initialValue?.service?.paymentCondition as PaymentCondition ?? 'full');
    /* const checkedPaymentMethods = useRef<string[]>([]); */
    const [checkedPaymentMethods, dispatch] = useReducer(checkedPaymentsReducer, initialValue?.service?.paymentMethods ?? [])

    // Agreement
    const [splitMethod, setSplitMethod] = useState<SplitMethod | null>((initialValue?.service?.splitMethod as SplitMethod) ?? 'percentage');
    const [agreementInitialPercentage, setAgreementInitialPercentage] = useState<string>((initialValue?.service?.agreementInitialValue as SplitMethod) ?? '50');

    const [agreementInitialValue, setAgreementInitialValue] = useState<string>((initialValue?.service?.agreementInitialValue as SplitMethod) ?? "half");
    const [remainingValue, setRemainingValue] = useState<RemainingValue>((initialValue?.service?.paymentCondition === "agreement" ? (initialValue?.service?.installmentsAmount ? "withInstallments" : 'afterCompletion') : 'afterCompletion') as RemainingValue);

    // Installments
    const [installmentsAmount, setInstallmentsAmount] = useState<string>(initialValue?.service?.installmentsAmount ? (`${initialValue?.service?.installmentsAmount}x`) : "2x");

    // Warranty
    const [warrantyPeriodType, setWarrantyPeriodType] = useState<WarrantyPeriod>('days');
    const [warrantyPeriod, setWarrantyPeriod] = useState<string | null>(initialValue?.service?.warrantyPeriod ? null : "90");

    const { handleSubmit, control, getValues, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            agreementInitialPercentage: initialValue?.service?.agreementInitialValue ?? "",
            agreementInitialValue: initialValue?.service?.agreementInitialValue ?? "",
            installmentsAmount: initialValue?.service?.installmentsAmount?.toString() ?? "",
            warrantyDetails: initialValue?.service?.warrantyDetails ?? "",
            warrantyPeriod_days: initialValue?.service?.warrantyPeriod?.toString() ?? "",
            warrantyPeriod_months: initialValue?.service?.warrantyPeriod ? (initialValue?.service?.warrantyPeriod / 30).toString() : "",
            warrantyPeriod_years: initialValue?.service?.warrantyPeriod ? (initialValue?.service?.warrantyPeriod / 365).toString() : "",
        },
        resolver: zodResolver(schema),
    });

    /* const onSubmit = handleSubmit((data) => {
        updateHandler && updateHandler(2)
    }); */

    const SubSection1 = () => {
        return (
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
                            updateState={setPaymentCondition}
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
                                    updateState={setSplitMethod}
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
                                        <ToggleGroupWithManualValue
                                            key={"agreementInitialPercentage"}
                                            data={[
                                                {
                                                    label: '30%',
                                                    value: '30%',
                                                },
                                                {
                                                    label: '50%',
                                                    value: '50%',
                                                },
                                            ]}
                                            manualValue={{
                                                inputProps: {
                                                    placeholder: "Outro (%)",
                                                    keyboardType: "number-pad"
                                                },
                                                maxValue: 100,
                                                unit: {
                                                    label: '%',
                                                    position: "end"
                                                }
                                            }}
                                            selected={agreementInitialPercentage}
                                            setSelected={setAgreementInitialPercentage}
                                            control={control}
                                            name="agreementInitialPercentage"
                                        />
                                    </View>
                                </SubSection>
                            ) : <SubSection header={{ title: `Qual o valor inicial a ser pago com o acordo?` }}>
                                <View>
                                    <ToggleGroupWithManualValue
                                        key={"agreementInitialValue"}
                                        data={[
                                            {
                                                label: 'metade',
                                                value: 'half',
                                            },
                                        ]}
                                        manualValue={{
                                            inputProps: {
                                                placeholder: "Outro (R$)",
                                                keyboardType: "number-pad",
                                            },
                                            unit: {
                                                label: 'R$ ',
                                                position: "start"
                                            }
                                        }}
                                        selected={agreementInitialValue}
                                        setSelected={setAgreementInitialValue}
                                        control={control}
                                        name="agreementInitialValue"
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
                                    updateState={setRemainingValue}
                                />
                            </View>
                        </SubSection>
                    )
                }
                {
                    (paymentCondition === "installments" || paymentCondition === "agreement" && remainingValue === "withInstallments") && (
                        <SubSection header={{ title: "Em quantas parcelas o valor será dividido?" }}>
                            <View>
                                <ToggleGroupWithManualValue
                                    key={"installmentsAmount"}
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
                                        },
                                        unit: {
                                            label: 'x',
                                            position: "end"
                                        }
                                    }}
                                    selected={installmentsAmount}
                                    setSelected={setInstallmentsAmount}
                                    control={control}
                                    name="installmentsAmount"
                                />
                            </View>
                        </SubSection>
                    )
                }
            </SubSectionWrapper>
        )
    };

    const SubSection2 = () => {
        return (
            <SubSectionWrapper
                header={{
                    title: "Garantia",
                    customIcon: WarrantyIcon as any,
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
                            updateState={(value) => setWarrantyPeriodType(value as WarrantyPeriod)}
                        />
                    </View>
                    {
                        warrantyPeriodType === "days" ? (
                            <View>
                                <ToggleGroupWithManualValue
                                    data={[
                                        {
                                            label: '30 dias',
                                            value: '30',
                                        },
                                        {
                                            label: '90 dias',
                                            value: '90',
                                        },
                                    ]}
                                    defaultValue="90"
                                    manualValue={{
                                        inputProps: {
                                            placeholder: "Outro (dias)",
                                            keyboardType: "number-pad"
                                        },
                                        unit: {
                                            label: ' dias',
                                            position: "end"
                                        }
                                    }}
                                    selected={warrantyPeriod}
                                    setSelected={setWarrantyPeriod}
                                    control={control}
                                    name="warrantyPeriod_days"
                                />
                            </View>
                        ) : warrantyPeriodType === "months" ? (
                            <View>
                                <ToggleGroupWithManualValue
                                    data={[
                                        {
                                            label: '1 mês',
                                            value: '1',
                                        },
                                        {
                                            label: '2 meses',
                                            value: '2',
                                        },
                                    ]}
                                    manualValue={{
                                        inputProps: {
                                            placeholder: "Outro (meses)",
                                            keyboardType: "number-pad"
                                        },
                                        unit: {
                                            label: ' meses',
                                            position: "end"
                                        }
                                    }}
                                    selected={warrantyPeriod}
                                    setSelected={setWarrantyPeriod}
                                    control={control}
                                    name="warrantyPeriod_months"
                                />
                            </View>
                        ) : (
                            <View>
                                <ToggleGroupWithManualValue
                                    data={[
                                        {
                                            label: '1 ano',
                                            value: '1',
                                        },
                                        {
                                            label: '2 anos',
                                            value: '2',

                                        },
                                    ]}
                                    manualValue={{
                                        inputProps: {
                                            placeholder: "Outro (anos)",
                                            keyboardType: "number-pad"
                                        },
                                        unit: {
                                            label: ' anos',
                                            position: "end"
                                        }
                                    }}
                                    selected={warrantyPeriod}
                                    setSelected={setWarrantyPeriod}
                                    control={control}
                                    name="warrantyPeriod_years"
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
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        onBlur={onBlur}
                                        onChangeText={value => onChange(value)}
                                        value={value}
                                        placeholder='Ex: A garantia não acoberta problemas que envolvam o desgaste dos materiais'
                                        style={{ width: "100%" }}
                                        multiline
                                    />
                                )}
                                name="warrantyDetails"
                                rules={{ required: true }}
                            />
                        </View>
                    </SubSection>
                </View>
            </SubSectionWrapper>
        )
    };

    useImperativeHandle(ref, () => ({
        getData: () => {
            const agreement = paymentCondition === "agreement" ? {
                splitMethod,
                agreementInitialValue: splitMethod === "money" ? parseInt(getValues("agreementInitialValue")) ?? "half" : (agreementInitialPercentage ?? "30"),
                remainingValue,
            } : undefined;

            const installments = paymentCondition === "installments" || paymentCondition === "agreement" && remainingValue === "withInstallments" ? parseInt(installmentsAmount)
                || (parseInt(getValues("installmentsAmount").split('x')[0]) ?? 2)
                : undefined;

            const formDays = warrantyPeriod ? (parseInt(warrantyPeriod) || (parseInt(getValues(`warrantyPeriod_${warrantyPeriodType}`)) ?? 90)) : 90;
            const warrantyDays = warrantyPeriodType === "days" ? formDays : warrantyPeriodType === "months" ? formDays * 30 : formDays * 360;
            const warrantyDetails = getValues("warrantyDetails");

            return {
                paymentCondition,
                checkedPaymentMethods: checkedPaymentMethods,
                agreement,
                installments,
                warrantyDays,
                warrantyDetails
            }
        }
    }));

    return (
        <SectionBottomSheet bottomSheetRef={bottomSheetRef}>
            <SubSection1 />

            <SubSectionWrapper
                header={{
                    title: "Métodos de Pagamento",
                    customIcon: CurrencyExchangeIcon as any,
                }}
            >
                <View>
                    <CheckboxesGroups
                        data={paymentMethods}
                        /* ref={checkedPaymentMethods} */
                        checked={checkedPaymentMethods}
                        dispatch={dispatch}
                    />
                </View>
            </SubSectionWrapper>

            <SubSection2 />
            <NextButton onPress={() => updateHandler && updateHandler(2)} />
        </SectionBottomSheet>
    )
});

export default Section1;