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
import ToggleGroup, { ToggleGroupWithManualValue, ToggleGroupWithManualValueRef } from 'components/ToggleGroup';
import { Section, SubSectionWrapper } from '../SubSectionWrapper';
import { ActionButton } from 'components/Button';
import { CheckboxesGroup } from 'components/Checkbox';

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
type PaymentCondition = 'cash' | 'installments' | 'agreement';
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

const Section1 = forwardRef(({ updateHandler, initialValue }: Section, ref) => {
    // General
    const [paymentCondition, setPaymentCondition] = useState<PaymentCondition>(initialValue?.service?.paymentCondition as PaymentCondition ?? 'cash');
    /* const checkedPaymentMethods = useRef<string[]>([]); */
    const [checkedPaymentMethods, dispatch] = useReducer(checkedPaymentsReducer, initialValue?.service?.paymentMethods ?? [])

    // Agreement
    const [splitMethod, setSplitMethod] = useState<SplitMethod | null>((initialValue?.service?.splitMethod as SplitMethod) ?? 'percentage');
    const agreementInitialPercentageRef = useRef<ToggleGroupWithManualValueRef | null>(null);

    const agreementInitialValueRef = useRef<ToggleGroupWithManualValueRef | null>(null);
    const [remainingValue, setRemainingValue] = useState<RemainingValue>((initialValue?.service?.paymentCondition === "agreement" ? (initialValue?.service?.installmentsAmount ? "withInstallments" : 'afterCompletion') : 'afterCompletion') as RemainingValue);

    // Installments
    const installmentsAmountRef = useRef<ToggleGroupWithManualValueRef | null>(null);

    // Warranty
    const [warrantyPeriodType, setWarrantyPeriodType] = useState<WarrantyPeriod>('days');
    const warrantyPeriodRef = useRef<ToggleGroupWithManualValueRef | null>(null);

    const { control, getValues, formState: { errors } } = useForm<FormData>({
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
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        }
    });

    useImperativeHandle(ref, () => ({
        getData: () => {
            const agreementInitialValue = agreementInitialValueRef.current?.getSelected();
            const installmentsAmount = installmentsAmountRef.current?.getSelected();
            const warrantyPeriod = warrantyPeriodRef.current?.getSelected();

            const agreement = paymentCondition === "agreement" ? {
                splitMethod,
                agreementInitialValue: splitMethod === "money" ? (agreementInitialValue === "half" ?
                    "half" : agreementInitialValue?.split(' ')[1]) :
                    (agreementInitialPercentageRef.current?.getSelected() ?? "30"),
                remainingValue,
            } : undefined;

            const installments = (paymentCondition === "installments") || (paymentCondition === "agreement" && remainingValue === "withInstallments" && installmentsAmount) ? parseInt(installmentsAmount!)
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
        <>
            <SubSectionWrapper header={{ title: "Condições de Pagamento", icon: "credit-card" }}>
                <View className='flex-col w-full' style={{ rowGap: 10 }}>
                    <ToggleGroup
                        data={[
                            {
                                label: 'à vista',
                                value: 'cash',
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
                    {
                        paymentCondition === "agreement" && (
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
                        )
                    }
                </View>
                {
                    paymentCondition === "agreement" && (
                        splitMethod === "percentage" ? (
                            <SubSectionWrapper header={{ title: `Qual o percentual do acordo?` }} preset="subSection">
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
                                    ref={agreementInitialPercentageRef}
                                    defaultValue={initialValue?.service?.discountPercentage ? `${initialValue?.service?.discountPercentage}%` : "50%"}
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
                                    control={control}
                                    name="agreementInitialPercentage"
                                />
                            </SubSectionWrapper>
                        ) : <SubSectionWrapper header={{ title: `Qual o valor inicial a ser pago com o acordo?` }} preset="subSection">
                            <ToggleGroupWithManualValue
                                key={"agreementInitialValue"}
                                data={[
                                    {
                                        label: 'metade',
                                        value: 'half',
                                    },
                                ]}
                                ref={agreementInitialValueRef}
                                defaultValue={initialValue?.service?.agreementInitialValue as SplitMethod ?? '50'}
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
                                control={control}
                                name="agreementInitialValue"
                            />
                        </SubSectionWrapper>
                    )
                }
                {
                    paymentCondition === "agreement" && (
                        <SubSectionWrapper header={{ title: "Como o valor restante será pago?" }} preset="subSection">
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
                        </SubSectionWrapper>
                    )
                }
                {
                    (paymentCondition === "installments" || paymentCondition === "agreement" && remainingValue === "withInstallments") && (
                        <SubSectionWrapper header={{ title: "Em quantas parcelas o valor será dividido?" }} preset="subSection">
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
                                ref={installmentsAmountRef}
                                defaultValue={initialValue?.service?.installmentsAmount ? (`${initialValue?.service?.installmentsAmount}x`) : "2x"}
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
                                control={control}
                                name="installmentsAmount"
                            />
                        </SubSectionWrapper>
                    )
                }
            </SubSectionWrapper>

            <SubSectionWrapper
                header={{
                    title: "Métodos de Pagamento",
                    customIcon: CurrencyExchangeIcon as any,
                }}
            >
                <CheckboxesGroup
                    data={paymentMethods}
                    checked={checkedPaymentMethods}
                    dispatch={dispatch}
                />
            </SubSectionWrapper>

            <SubSectionWrapper
                header={{
                    title: "Garantia",
                    customIcon: WarrantyIcon as any,
                }}
            >
                <View className='flex-col w-full' style={{ rowGap: 10 }}>
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
                                    ref={warrantyPeriodRef}
                                    defaultValue={initialValue?.service?.warrantyPeriod ? initialValue.service.warrantyPeriod.toString() : "90"}
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
                                    ref={warrantyPeriodRef}
                                    defaultValue={"2"}
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
                                    ref={warrantyPeriodRef}
                                    defaultValue={"1"}
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
                                    control={control}
                                    name="warrantyPeriod_years"
                                />
                            </View>
                        )
                    }
                </View>
                <Text className='text-center text-gray-100 text-sm w-full mb-4'>
                    O prazo de garantia legal para serviços e produtos duráveis estabelecido por lei é de <Text className='font-bold'>90 dias</Text>.
                </Text>

                <View className='w-full'>
                    <SubSectionWrapper header={{ title: "Condições da Garantia" }} preset="subSection">
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
                    </SubSectionWrapper>
                </View>
            </SubSectionWrapper>

            <ActionButton
                label='Próximo'
                onPress={() => updateHandler && updateHandler(2)}
                preset="next"
            />
        </>
    )
});

export default Section1;