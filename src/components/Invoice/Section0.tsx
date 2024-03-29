import { forwardRef, useImperativeHandle, useState } from "react";
import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";

import colors from "global/colors";

// Components
import Input from "components/Input";
import { Checkbox } from "components/Checkbox";
import { PreviewStatic } from "components/Preview";
import {
    PaymentMethodsReview,
    ReviewSection,
    WarrantyReview,
} from "screens/ScheduleForm/Sections/Section2";
import SectionWrapper, {
    SubSectionWrapper,
} from "components/Form/SectionWrapper";
import { ActionButton } from "components/Button";

// Utils
import { InvoiceSectionProps } from "./@types";
import { Config, getPaymentCondition } from "utils/pdfHandler";

export interface Section0Handles {
    getValidity(): string;
    getSelectedOptions(): Config;
}

const Section0 = forwardRef(({ onSubmit, order }: InvoiceSectionProps, ref) => {
    const { navigate } = useNavigation();

    const [validity, setValidity] = useState("15 dias");

    const [selectedOptions, setSelectedOptions] = useState<Config>({
        showLogo: true,
        showInvoiceName: true,
        showDigitalSignature: true,
        showSubtotals: true,
        showProductsDetails: true,
        showMaterialsDetails: true,
        showMaterialsImages: true,
    });

    useImperativeHandle(
        ref,
        () => ({
            getValidity() {
                return validity;
            },
            getSelectedOptions() {
                return selectedOptions;
            },
        }),
        [validity, selectedOptions]
    );

    return (
        <>
            <Input
                onChangeText={setValidity}
                value={validity}
                onFocus={() => {
                    const replacedValue = validity.replaceAll(" dias", "");
                    setValidity(replacedValue);
                }}
                onBlur={() => {
                    setValidity(`${validity} dias`);
                }}
                keyboardType="numeric"
                defaultValue={"15 dias"}
                pallette="dark"
                label="Validade do Orçamento"
                icon={{ name: "event", family: "MaterialIcons" }}
                style={{
                    paddingHorizontal: 0,
                    flex: 1,
                    borderWidth: 1,
                    borderTopColor: colors.gray[200],
                    borderBottomColor: colors.gray[200],
                    borderColor: colors.gray[200],
                }}
            />

            <SectionWrapper
                headerProps={{
                    title: "Detalhes",
                }}
            >
                <View className="w-full">
                    <Checkbox
                        title="Mostrar logotipo da empresa"
                        checked={selectedOptions.showLogo}
                        onPress={() =>
                            setSelectedOptions({
                                ...selectedOptions,
                                showLogo: !selectedOptions.showLogo,
                            })
                        }
                        inverted
                        customKey={"checkbox_5"}
                    />
                    <Checkbox
                        title="Mostrar nome do orçamento"
                        checked={selectedOptions.showInvoiceName}
                        onPress={() =>
                            setSelectedOptions({
                                ...selectedOptions,
                                showInvoiceName:
                                    !selectedOptions.showInvoiceName,
                            })
                        }
                        inverted
                        customKey={"checkbox_4"}
                    />
                    <Checkbox
                        title="Mostrar assinatura digital"
                        checked={selectedOptions.showDigitalSignature}
                        onPress={() =>
                            setSelectedOptions({
                                ...selectedOptions,
                                showDigitalSignature:
                                    !selectedOptions.showDigitalSignature,
                            })
                        }
                        inverted
                        customKey={"checkbox_6"}
                    />
                    <Checkbox
                        title="Mostrar subtotal de serviços e materiais"
                        checked={selectedOptions.showSubtotals}
                        onPress={() =>
                            setSelectedOptions({
                                ...selectedOptions,
                                showSubtotals: !selectedOptions.showSubtotals,
                            })
                        }
                        inverted
                        customKey={"checkbox_1"}
                    />
                    <Checkbox
                        title="Mostrar detalhes de serviços"
                        checked={selectedOptions.showProductsDetails}
                        onPress={() =>
                            setSelectedOptions({
                                ...selectedOptions,
                                showProductsDetails:
                                    !selectedOptions.showProductsDetails,
                            })
                        }
                        inverted
                        customKey={"checkbox_2"}
                    />
                    <Checkbox
                        title="Mostrar detalhes de materiais"
                        checked={selectedOptions.showMaterialsDetails}
                        onPress={() =>
                            setSelectedOptions({
                                ...selectedOptions,
                                showMaterialsDetails:
                                    !selectedOptions.showMaterialsDetails,
                            })
                        }
                        inverted
                        customKey={"checkbox_3"}
                    />
                    <Checkbox
                        title="Mostrar imagens dos materiais"
                        checked={selectedOptions.showMaterialsImages}
                        onPress={() =>
                            setSelectedOptions({
                                ...selectedOptions,
                                showMaterialsImages:
                                    !selectedOptions.showMaterialsDetails,
                            })
                        }
                        inverted
                        customKey={"checkbox_7"}
                    />
                </View>
            </SectionWrapper>

            <View className="w-full items-center justify-center gap-y-8 mb-5">
                <View className="w-3/5 h-[0px] border-dashed border-t border-gray-100" />

                <Text className="text-center text-gray-100 text-sm w-full">
                    As informações abaixo só podem ser alteradas ao{" "}
                    <Text
                        className="font-bold underline"
                        onPress={() =>
                            navigate("Schedule", { orderId: order.id })
                        }
                    >
                        editar o serviço.
                    </Text>
                </Text>
            </View>

            <ReviewSection
                wrapperProps={{
                    header: {
                        title: "Condições de Pagamento",
                        icon: "credit-card",
                    },
                    style: { flex: 1 },
                }}
                value={getPaymentCondition(order)}
            />

            <PaymentMethodsReview
                value={
                    order.paymentMethods.join(", ").length > 0
                        ? order.paymentMethods.join(", ")
                        : "[nenhum método informado]"
                }
            />

            <WarrantyReview
                value={`${order.warrantyPeriod} dia${
                    order.warrantyPeriod !== 1 ? "s" : ""
                }`}
            />

            {order.warrantyDetails && (
                <ReviewSection
                    wrapperProps={{
                        header: { title: "Condições da Garantia" },
                        preset: "subSection",
                    }}
                    value={order.warrantyDetails ?? "[vazio]"}
                />
            )}

            <ActionButton onPress={onSubmit} label="Próximo" preset="next" />
        </>
    );
});

export default Section0;
