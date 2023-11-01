import React, {
    useRef,
    useState,
    useCallback,
    useEffect,
    memo,
    useMemo,
    forwardRef,
    useImperativeHandle,
} from "react";
import { View, Text } from "react-native";
import DatePicker from "react-native-date-picker";
import { useNavigation } from "@react-navigation/native";

import { useColorScheme } from "nativewind";
import colors from "global/colors";

// Components
import Modal from "components/Modal";
import Input, { Trigger } from "components/Input";
import BottomSheet from "components/BottomSheet";
import Calendar, { CalendarDate } from "components/Calendar";

import { Section, SubSectionWrapper } from "../../Form/SectionWrapper";
import { ActionButton, SubActionButton } from "components/Button";
import { Preview } from "components/Preview";

// Types
import { ProductModel } from "database/models/product.model";
import { MaterialModel } from "database/models/material.model";

// Forms
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import ProductForm from "../Forms/ProductForm";
import MaterialForm from "../Forms/MaterialForm";
import SavedItemsView from "components/CatalogView";
import { loggedNavigation } from "utils/planHandler";

const schema = z.object({
    name: z.string().max(30),
    additionalInfo: z.string().max(200),
    discount: z.string().max(3),
});

type SchemaType = z.infer<typeof schema>;

const Section0 = forwardRef(({ updateHandler, initialValue }: Section, ref) => {
    const navigation = useNavigation();
    const { colorScheme } = useColorScheme();

    const [products, setProducts] = useState<Partial<ProductModel>[]>(
        initialValue?.products ?? []
    );
    const [materials, setMaterials] = useState<Partial<MaterialModel>[]>(
        initialValue?.materials ?? []
    );

    const currentDate = new Date();
    const [date, setDate] = useState<CalendarDate | undefined>(
        initialValue?.order?.date
            ? {
                  date: initialValue.order?.date.getDate(),
                  month: initialValue.order?.date.getMonth(),
              }
            : { date: currentDate.getDate(), month: currentDate.getMonth() }
    );

    const [time, setTime] = useState(initialValue?.order?.date ?? undefined);

    const [isTimeModalVisible, setTimeModalVisible] = useState(false);
    const TimePickerModal = useCallback(() => {
        const newDate = useRef(new Date());

        const onDateChange = useCallback((date: Date) => {
            newDate.current = date;
        }, []);

        const onConfirm = () => {
            setTimeModalVisible(false);
            setTime(newDate.current);
        };

        const onClean = () => {
            setTimeModalVisible(false);
            setTime(undefined);
        };

        return (
            <Modal
                isVisible={isTimeModalVisible}
                toggleVisibility={() => setTimeModalVisible(false)}
                title={"Selecione o horário"}
                icon="calendar-today"
                buttons={[
                    {
                        label: "Limpar",
                        onPress: onClean,
                        closeOnPress: true,
                        color: colors.red,
                    },
                    {
                        label: "Confirmar",
                        onPress: onConfirm,
                        closeOnPress: true,
                    },
                ]}
            >
                <View className="flex flex-1 w-full items-center justify-center">
                    <DatePicker
                        date={newDate.current}
                        onDateChange={onDateChange}
                        fadeToColor={
                            colorScheme === "light"
                                ? colors.white
                                : colors.gray[200]
                        }
                        androidVariant="nativeAndroid"
                        minuteInterval={15}
                        mode="time"
                        /* is24hourSource='locale' */
                    />
                </View>
            </Modal>
        );
    }, [isTimeModalVisible, time, setTimeModalVisible, setTime]);

    const {
        reset,
        control,
        getValues,
        formState: { errors },
    } = useForm<SchemaType>({
        defaultValues: {
            name: initialValue?.order?.name ?? "",
            additionalInfo:
                (initialValue?.order?.additionalInfo
                    ? initialValue?.order.additionalInfo
                    : "") ?? "",
            discount: initialValue?.order?.discount
                ? `${initialValue?.order?.discount?.toString()}%`
                : "0%",
        },
        resolver: zodResolver(schema),
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        },
    });

    useImperativeHandle(
        ref,
        () => ({
            getData: () => {
                const name = getValues("name");
                const additionalInfo = getValues("additionalInfo");
                const discount = parseInt(
                    getValues("discount").replace("%", "")
                );

                console.log(name, additionalInfo, discount);

                return {
                    name,
                    products,
                    materials,
                    discount,
                    date,
                    time,
                    additionalInfo,
                };
            },
        }),
        [products, materials, date, time]
    );

    const [productData, setProductData] = useState<
        Partial<ProductModel> | undefined
    >(undefined);
    const [materialData, setMaterialData] = useState<
        Partial<MaterialModel> | undefined
    >(undefined);

    return (
        <>
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label="Nome do Serviço"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder={`Serviço ${currentDate.getDate()}-${
                            currentDate.getMonth() + 1
                        }-${currentDate.getFullYear()}`}
                    />
                )}
                name="name"
            />

            <SubSectionWrapper
                headerProps={{
                    title: "Serviços",
                    children: products && products?.length > 0 && (
                        <Text className="font-medium text-red text-xs opacity-80">
                            Arraste para excluir
                        </Text>
                    ),
                }}
            >
                <View className="w-full">
                    {products && products?.length === 0 && (
                        <Text className="text-sm text-center text-black dark:text-white mb-6">
                            Nenhum serviço adicionado.
                        </Text>
                    )}
                    {products.map((product, index) => (
                        <View className="mb-4" key={index.toString()}>
                            <Preview
                                product={product}
                                onDelete={() => {
                                    setProducts((prev) =>
                                        prev.filter((s) => s.id !== product.id)
                                    );
                                }}
                                onEdit={() => {
                                    setProductData(product);
                                    BottomSheet.expand("productBottomSheet");
                                }}
                            />
                        </View>
                    ))}
                </View>
                <View className="flex-row w-full items-center justify-between">
                    <View className="flex-1 mr-3">
                        <SubActionButton
                            onPress={() => {
                                setProductData(undefined);
                                BottomSheet.expand("productBottomSheet");
                            }}
                            label="Adicionar serviço"
                        />
                    </View>
                    <View className="w-14">
                        <ActionButton
                            onPress={() =>
                                loggedNavigation(navigation, "catalog")
                            }
                            style={{ flex: 1, paddingTop: 6, paddingBottom: 6 }}
                            icon="bookmark-multiple-outline"
                            iconFamily="MaterialCommunityIcons"
                        />
                    </View>
                </View>
            </SubSectionWrapper>

            <SubSectionWrapper
                headerProps={{
                    title: "Materiais",
                }}
            >
                <View className="w-full">
                    {materials && materials?.length === 0 && (
                        <Text className="text-sm text-center text-black dark:text-white mb-6">
                            Nenhum material adicionado.
                        </Text>
                    )}
                    {materials.map((material, index) => (
                        <View className="mb-4" key={index.toString()}>
                            <Preview
                                material={material}
                                onDelete={() => {
                                    setMaterials((prev) =>
                                        prev.filter((m) => m.id !== material.id)
                                    );
                                }}
                                onEdit={() => {
                                    setMaterialData(material);
                                    BottomSheet.expand("materialBottomSheet");
                                }}
                            />
                        </View>
                    ))}
                </View>
                <View className="flex-row w-full items-center justify-between">
                    <View className="flex-1 mr-3">
                        <SubActionButton
                            onPress={() => {
                                setMaterialData(undefined);
                                BottomSheet.expand("materialBottomSheet");
                            }}
                            label="Adicionar material"
                        />
                    </View>
                    <View className="w-14">
                        <ActionButton
                            onPress={() => {
                                loggedNavigation(navigation, "catalog");
                            }}
                            style={{ flex: 1, paddingTop: 6, paddingBottom: 6 }}
                            icon="bookmark-multiple-outline"
                            iconFamily="MaterialCommunityIcons"
                        />
                    </View>
                </View>
            </SubSectionWrapper>

            <SubSectionWrapper headerProps={{ title: "Data" }}>
                <Calendar
                    isStatic
                    selectedDate={date}
                    setSelectedDate={setDate}
                    style={{ padding: 16, backgroundColor: colors.gray[600] }}
                />
            </SubSectionWrapper>

            <Trigger
                label="Horário"
                onPress={() => setTimeModalVisible(true)}
                value={
                    time
                        ? `${time?.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                          })}`
                        : "Indeterminado"
                }
            />

            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label="Desconto"
                        onFocus={() =>
                            onChange(value.toString().replace("%", ""))
                        }
                        onBlur={() => {
                            if (parseInt(value) > 100) {
                                onChange(100);
                            }
                            onChange(`${value}%`);
                            onBlur();
                        }}
                        onChangeText={onChange}
                        keyboardType="numeric"
                        value={value.toString()}
                        placeholder="0%"
                    />
                )}
                name="discount"
            />

            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label="Informações Adicionais"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="Ex: O serviço deve ser realizado na sala 2, no 2º andar."
                        textAlignVertical="top"
                        multiline
                    />
                )}
                name="additionalInfo"
            />

            <ActionButton
                label="Próximo"
                onPress={() => updateHandler && updateHandler(1)}
                preset="next"
            />

            <TimePickerModal />

            <BottomSheet height={"78%"} id={"materialBottomSheet"}>
                <MaterialForm
                    initialData={materialData}
                    onSubmitForm={(data) => {
                        if (materialData) {
                            setMaterials((prev) =>
                                prev.map((oldMaterial) =>
                                    oldMaterial.id === data.id
                                        ? data
                                        : oldMaterial
                                )
                            );
                        } else {
                            setMaterials((prev) => [...prev, data]);
                        }
                    }}
                />
            </BottomSheet>

            <BottomSheet height={"62%"} id={"productBottomSheet"}>
                <ProductForm
                    initialData={productData}
                    onSubmitForm={(data) => {
                        if (productData) {
                            setProducts((prev) =>
                                prev.map((oldOrder) =>
                                    oldOrder.id === data.id ? data : oldOrder
                                )
                            );
                        } else {
                            setProducts((prev) => [...prev, data]);
                        }
                    }}
                />
            </BottomSheet>
        </>
    );
});

export default Section0;
