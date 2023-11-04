import React, { memo, useCallback, useReducer, useRef, useState } from "react";
import { View, Text } from "react-native";
import { z } from "zod";

import { useColorScheme } from "nativewind";
import colors from "global/colors";

// Icons
import CurrencyExchangeIcon from "src/assets/icons/currency_exchange.svg";
import WarrantyIcon from "src/assets/icons/warranty.svg";

// Components
import SectionBottomSheet from "components/Form/SectionBottomSheet";
import ToggleGroup, {
    ToggleGroupWithManualValue,
    ToggleGroupWithManualValueRef,
} from "components/ToggleGroup";
import { SubSectionWrapper } from "components/Form/SectionWrapper";
import { CheckboxesGroup, checkboxesGroupReducer } from "components/Checkbox";

// Forms
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    PaymentCondition,
    RemainingValue,
    SECTION_PREFIX,
    SectionProps,
    SplitMethod,
    WarrantyPeriod,
} from "../@types";
import { useNavigation } from "@react-navigation/native";

const schema = z.object({
    splitInitialValue: z.string().max(10),
    splitValue: z.string().max(10),
    installmentsAmount: z.string().regex(/^[0-9]+x$/),
});

interface FormData {
    splitValue: string;
    splitRemaining: string;
    warrantyDetails: string;
    warrantyPeriod_days: string;
    warrantyPeriod_months: string;
    warrantyPeriod_years: string;
}

const paymentMethods = [
    "Boleto",
    "Dinheiro",
    "Transferência Bancária",
    "Cartão de Crédito",
    "Cartão de Débito",
    "Pix",
];

function Section1({ initialValue, updateHandler }: SectionProps) {
    const navigation = useNavigation();

    // Warranty
    const [warrantyPeriodType, setWarrantyPeriodType] =
        useState<WarrantyPeriod>("DAYS");

    const warrantyPeriodRef = useRef<ToggleGroupWithManualValueRef | null>(
        null
    );

    const {
        control,
        getValues,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            splitValue: initialValue?.splitValue ?? "",
            splitRemaining: initialValue?.splitRemaining ?? "",
            warrantyDetails: initialValue?.warrantyDetails ?? "",
            warrantyPeriod_days: initialValue?.warrantyPeriod?.toString() ?? "",
            warrantyPeriod_months: initialValue?.warrantyPeriod
                ? (initialValue?.warrantyPeriod / 30).toString()
                : "",
            warrantyPeriod_years: initialValue?.warrantyPeriod
                ? (initialValue?.warrantyPeriod / 365).toString()
                : "",
        },
        resolver: zodResolver(schema),
    });

    const hasInstallments =
        paymentCondition === "INSTALLMENTS" ||
        (paymentCondition === "AGREEMENT" &&
            remainingValue === "WITH_INSTALLMENTS");

    const handleSubmit = useCallback(() => {
        const splitInitialValueFromInput =
            splitInitialValueRef.current?.getSelected();

        const splitInitialPercentageFromInput =
            splitInitialPercentageRef.current?.getSelected();

        const splitValue =
            paymentCondition === "INSTALLMENTS"
                ? installmentsAmountRef.current?.getSelected()
                : paymentCondition === "AGREEMENT" && splitMethod === "MONEY"
                ? splitInitialValueFromInput
                : splitInitialPercentageFromInput;

        const splitRemaining = hasInstallments
            ? installmentsAmountRef.current?.getSelected()
            : "REMAINING";

        const warrantyPeriod = warrantyPeriodRef.current?.getSelected();

        const formDays = warrantyPeriod
            ? parseInt(warrantyPeriod) ||
              (parseInt(getValues(`warrantyPeriod_${warrantyPeriodType}`)) ??
                  90)
            : 90;

        const warrantyDays =
            warrantyPeriodType === "DAYS"
                ? formDays
                : warrantyPeriodType === "MONTHS"
                ? formDays * 30
                : formDays * 360;

        const warrantyDetails = getValues("warrantyDetails");

        /* return {
            paymentCondition,
            checkedPaymentMethods,
            splitValue,
            splitRemaining,
            warrantyDays,
            warrantyDetails,
        }; */

        updateHandler(2);
    }, [
        checkedPaymentMethods,
        hasInstallments,
        paymentCondition,
        warrantyPeriodType,
    ]);

    return (
        <SectionBottomSheet id={SECTION_PREFIX + "1"} height="76%">
            <PaymentConditionsForm
                paymentCondition={paymentCondition}
                setPaymentCondition={setPaymentCondition}
                splitMethod={splitMethod}
                setSplitMethod={setSplitMethod}
                remainingValue={remainingValue}
                setRemainingValue={setRemainingValue}
                hasInstallments={hasInstallments}
                splitInitialPercentageRef={splitInitialPercentageRef}
                splitInitialValueRef={splitInitialValueRef}
                installmentsAmountRef={installmentsAmountRef}
                initialValue={initialValue}
                control={control}
            />
            <SubSectionWrapper
                headerProps={{
                    title: "Métodos de Pagamento",
                    icon: CurrencyExchangeIcon as any,
                }}
            >
                <CheckboxesGroup
                    data={paymentMethods}
                    checked={checkedPaymentMethods}
                    dispatch={dispatch}
                />
            </SubSectionWrapper>

            {/* <SubSectionWrapper
                headerProps={{
                    title: "Garantia",
                    icon: WarrantyIcon as any,
                }}
            >
                <View className="flex-col w-full" style={{ rowGap: 10 }}>
                    <View>
                        <ToggleGroup
                            data={[
                                {
                                    label: "dias",
                                    value: "DAYS",
                                },
                                {
                                    label: "meses",
                                    value: "months",
                                },
                                {
                                    label: "anos",
                                    value: "years",
                                },
                            ]}
                            selected={warrantyPeriodType}
                            updateState={(value) =>
                                setWarrantyPeriodType(value as WarrantyPeriod)
                            }
                        />
                    </View>
                    {warrantyPeriodType === "DAYS" && (
                        <ToggleGroupWithManualValue
                            data={[
                                {
                                    label: "30 dias",
                                    value: "30",
                                },
                                {
                                    label: "90 dias",
                                    value: "90",
                                },
                            ]}
                            ref={warrantyPeriodRef}
                            defaultValue={
                                initialValue?.warrantyPeriod
                                    ? initialValue.warrantyPeriod.toString()
                                    : "90"
                            }
                            manualValue={{
                                inputProps: {
                                    placeholder: "Outro (dias)",
                                    keyboardType: "number-pad",
                                },
                                unit: {
                                    label: " dias",
                                    position: "end",
                                },
                            }}
                            control={control}
                            name="warrantyPeriod_days"
                        />
                    )}
                    {warrantyPeriodType === "months" && (
                        <ToggleGroupWithManualValue
                            data={[
                                {
                                    label: "1 mês",
                                    value: "1",
                                },
                                {
                                    label: "2 meses",
                                    value: "2",
                                },
                            ]}
                            ref={warrantyPeriodRef}
                            defaultValue={"2"}
                            manualValue={{
                                inputProps: {
                                    placeholder: "Outro (meses)",
                                    keyboardType: "number-pad",
                                },
                                unit: {
                                    label: " meses",
                                    position: "end",
                                },
                            }}
                            control={control}
                            name="warrantyPeriod_months"
                        />
                    )}
                    {warrantyPeriodType === "years" && (
                        <ToggleGroupWithManualValue
                            data={[
                                {
                                    label: "1 ano",
                                    value: "1",
                                },
                                {
                                    label: "2 anos",
                                    value: "2",
                                },
                            ]}
                            ref={warrantyPeriodRef}
                            defaultValue={"1"}
                            manualValue={{
                                inputProps: {
                                    placeholder: "Outro (anos)",
                                    keyboardType: "number-pad",
                                },
                                unit: {
                                    label: " anos",
                                    position: "end",
                                },
                            }}
                            control={control}
                            name="warrantyPeriod_years"
                        />
                    )}
                </View>
                <Text className="text-center text-gray-100 text-sm w-full mb-4">
                    O prazo de garantia legal para serviços e produtos duráveis
                    estabelecido por lei é de{" "}
                    <Text className="font-bold">90 dias</Text>.
                </Text>

                <View className="w-full">
                    <SubSectionWrapper
                        headerProps={{ title: "Condições da Garantia" }}
                    >
                        <View className="w-full">
                            <Controller
                                control={control}
                                render={({
                                    field: { onChange, onBlur, value },
                                }) => (
                                    <Input
                                        onBlur={onBlur}
                                        onChangeText={(value) =>
                                            onChange(value)
                                        }
                                        value={value}
                                        placeholder="Ex: A garantia não acoberta problemas que envolvam o desgaste dos materiais"
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
                label="Próximo"
                onPress={handleSubmit}
                preset="next"
            /> */}
        </SectionBottomSheet>
    );
}

const Section1Form = memo(Section1, () => true);
export default Section1Form;

/* 
// Payment Condition - FULL, CARD or AGREEMENT
    const [paymentCondition, setPaymentCondition] = useState<PaymentCondition>(
        (initialValue?.paymentCondition as PaymentCondition) ?? "FULL"
    );

    const [checkedPaymentMethods, dispatch] = useReducer(
        checkboxesGroupReducer,
        initialValue?.paymentMethods ?? []
    );

    // Split Method (for AGREEMENT)
    // pode ser:
    // 1. parcelas: do cartão quando NÃO há valor restante do acordo (splitRemaining)
    // 2. valor inicial do acordo em dinheiro: quando NÃO HÁ símbolos no valor (ex: número inteiro ['462'], '1/3' ou '1/2')
    // 3. valor inicial do acordo em porcentagem: quando há o símbolo de (%) no valor

    const [splitMethod, setSplitMethod] = useState<SplitMethod | null>(
        initialValue?.splitValue?.includes("%") ? "PERCENTAGE" : "MONEY"
    );

    // Agreement Initial Value - MONEY (ex: número inteiro ['462'], '1/3' ou '1/2')
    const splitInitialPercentageRef =
        useRef<ToggleGroupWithManualValueRef | null>(null);

    // Agreement Initial Value - percentage (ex: 25%, 65%)
    const splitInitialValueRef = useRef<ToggleGroupWithManualValueRef | null>(
        null
    );

    // Remaining Value - pode ser 'parcelas' (ex: 2x, 3x) ou 'valor restante do acordo' ('REMAINING')
    const [remainingValue, setRemainingValue] = useState<RemainingValue>(
        (initialValue?.splitRemaining === "REMAINING"
            ? "afterCompletion"
            : "WITH_INSTALLMENTS") as RemainingValue
    );

    // Installments
    const installmentsAmountRef = useRef<ToggleGroupWithManualValueRef | null>(
        null
    );
*/

interface DefaultProps {
    control: any;
}

interface PaymentConditionsState {
    paymentCondition: PaymentCondition;
    splitMethod?: SplitMethod;
    splitValue?: SplitMethod;
    remainingValue: RemainingValue;
}

interface PaymentConditionsAction {
    type: string;
    payload: any;
}

function paymentConditionsReducer(
    state: PaymentConditionsState,
    action: PaymentConditionsAction
): PaymentConditionsState {
    switch (action.type) {
        case "SET_PAYMENT_CONDITION":
            return {
                ...state,
                paymentCondition: action.payload,
            };
        case "SET_SPLIT_METHOD":
            return {
                ...state,
                splitMethod: action.payload,
            };
        case "SET_REMAINING_VALUE":
            return {
                ...state,
                remainingValue: action.payload,
            };
        default:
            return state;
    }
}

function PaymentConditions({
    initialValue,
    control,
}: DefaultProps & { initialValue?: PaymentConditionsState }) {
    const [data, dispatch] = useReducer(paymentConditionsReducer, initialValue);

    return (
        <SubSectionWrapper
            headerProps={{
                title: "Condições de Pagamento",
                icon: "credit-card",
            }}
        >
            <View className="flex flex-1" style={{ rowGap: 20 }}>
                <View className="flex-col w-full" style={{ rowGap: 10 }}>
                    <ToggleGroup
                        data={[
                            {
                                label: "à vista",
                                value: "cash",
                            },
                            {
                                label: "parcelado",
                                value: "INSTALLMENTS",
                            },
                            {
                                label: "acordo",
                                value: "AGREEMENT",
                            },
                        ]}
                        selected={data.paymentCondition}
                        setSelected={(value) =>
                            dispatch({
                                type: "SET_PAYMENT_CONDITION",
                                payload: value,
                            })
                        }
                    />
                    {data.paymentCondition === "AGREEMENT" && (
                        <ToggleGroup
                            data={[
                                {
                                    label: "%",
                                    value: "percentage",
                                },
                                {
                                    label: "R$",
                                    value: "MONEY",
                                },
                            ]}
                            selected={data.splitMethod as string}
                            setSelected={(value) =>
                                dispatch({
                                    type: "SET_SPLIT_METHOD",
                                    payload: value,
                                })
                            }
                        />
                    )}
                </View>
                {data.paymentCondition === "AGREEMENT" &&
                    (data.splitMethod === "PERCENTAGE" ? (
                        <SubSectionWrapper
                            headerProps={{
                                title: `Qual o percentual do acordo?`,
                            }}
                        >
                            <ToggleGroupWithManualValue
                                key={"agreementInitialPercentage"}
                                data={[
                                    {
                                        label: "30%",
                                        value: "30%",
                                    },
                                    {
                                        label: "50%",
                                        value: "50%",
                                    },
                                ]}
                                defaultValue={initialValue?.remainingValue}
                                manualValue={{
                                    inputProps: {
                                        placeholder: "Outro (%)",
                                        keyboardType: "number-pad",
                                    },
                                    maxValue: 100,
                                    unit: {
                                        label: "%",
                                        position: "end",
                                    },
                                }}
                                control={control}
                                name="agreementInitialPercentage"
                            />
                        </SubSectionWrapper>
                    ) : (
                        <SubSectionWrapper
                            headerProps={{
                                title: `Qual o valor inicial a ser pago com o acordo?`,
                            }}
                        >
                            <ToggleGroupWithManualValue
                                key={"agreementInitialValue"}
                                data={[
                                    {
                                        label: "um terço",
                                        value: "1/3",
                                    },
                                    {
                                        label: "metade",
                                        value: "1/2",
                                    },
                                ]}
                                defaultValue={
                                    (initialValue?.splitValue as SplitMethod) ??
                                    "1/2"
                                }
                                manualValue={{
                                    inputProps: {
                                        placeholder: "Outro (R$)",
                                        keyboardType: "number-pad",
                                    },
                                    unit: {
                                        label: "R$ ",
                                        position: "start",
                                    },
                                }}
                                control={control}
                                name="agreementInitialValue"
                            />
                        </SubSectionWrapper>
                    ))}
                {data.paymentCondition === "AGREEMENT" && (
                    <SubSectionWrapper
                        headerProps={{
                            title: "Como o valor restante será pago?",
                        }}
                    >
                        <ToggleGroup
                            data={[
                                {
                                    label: "após a conclusão",
                                    value: "afterCompletion",
                                },
                                {
                                    label: "em parcelas",
                                    value: "WITH_INSTALLMENTS",
                                },
                            ]}
                            selected={data.remainingValue}
                            setSelected={(value) =>
                                dispatch({
                                    type: "SET_REMAINING_VALUE",
                                    payload: value,
                                })
                            }
                        />
                    </SubSectionWrapper>
                )}
                {hasInstallments && (
                    <SubSectionWrapper
                        headerProps={{
                            title: "Em quantas parcelas o valor será dividido?",
                        }}
                    >
                        <ToggleGroupWithManualValue
                            key={"installmentsAmount"}
                            data={[
                                {
                                    label: "2x",
                                    value: "2x",
                                },
                                {
                                    label: "3x",
                                    value: "3x",
                                },
                            ]}
                            defaultValue={
                                initialValue?.splitValue
                                    ? `${initialValue?.splitValue}x`
                                    : "2x"
                            }
                            manualValue={{
                                name: "installmentsAmount",
                                inputProps: {
                                    placeholder: "Outro (parcelas)",
                                    keyboardType: "number-pad",
                                },
                                unit: {
                                    label: "x",
                                    position: "end",
                                },
                            }}
                            control={control}
                        />
                    </SubSectionWrapper>
                )}
            </View>
        </SubSectionWrapper>
    );
}

const PaymentConditionsForm = memo(PaymentConditions);
