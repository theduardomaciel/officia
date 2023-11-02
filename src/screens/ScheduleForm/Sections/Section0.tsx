import React, {
    useRef,
    useState,
    useCallback,
    memo,
    Fragment,
    SetStateAction,
} from "react";
import { View, Text } from "react-native";
import DatePicker from "react-native-date-picker";

import { useColorScheme } from "nativewind";
import colors from "global/colors";

// Components
import Modal from "components/Modal";
import Input, { Trigger } from "components/Input";
import BottomSheet from "components/BottomSheet";
import SectionBottomSheet from "components/Form/SectionBottomSheet";
import Calendar, { CalendarDate } from "components/Calendar";

import { SubSectionWrapper } from "components/Form/SectionWrapper";
import { ActionButton, SubActionButton } from "components/Button";
import { Preview } from "components/Preview";

// Types
import type { ProductModel } from "database/models/product.model";
import type { MaterialModel } from "database/models/material.model";

import type { SectionProps } from "../@types";

// Forms
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import ProductForm from "../Forms/ProductForm";
import MaterialForm from "../Forms/MaterialForm";

// Utils
import { loggedNavigation } from "utils/planHandler";
import { SECTION_PREFIX } from "../@types";
import { useNavigation } from "@react-navigation/native";
import { OrderModel } from "database/models/order.model";

const schema = z.object({
    name: z.string().max(30),
    additionalInfo: z.string().max(200),
    discount: z.string().max(3),
});

type SchemaType = z.infer<typeof schema>;

function Section0({ initialValue, updateHandler }: SectionProps) {
    const navigation = useNavigation();
    const [data, setData] = useState<Partial<OrderModel> | undefined>(
        undefined
    );

    const {
        reset,
        control,
        getValues,
        formState: { errors },
    } = useForm<SchemaType>({
        defaultValues: {
            name: initialValue?.name ?? "",
            additionalInfo: initialValue?.additionalInfo ?? "",
            discount: initialValue?.discount
                ? `${initialValue?.discount?.toString()}%`
                : "0%",
        },
        resolver: zodResolver(schema),
    });

    const handleSubmit = useCallback(() => {
        const name = getValues("name");
        const additionalInfo = getValues("additionalInfo");
        const discount = parseInt(getValues("discount").replace("%", ""));

        setData((prev) => ({
            ...prev,
            name,
            additionalInfo,
            discount,
        }));

        console.log("DATA - 0: ", data);

        updateHandler(1);
    }, [data]);

    return (
        <SectionBottomSheet
            id={SECTION_PREFIX + "0"}
            height="76%"
            defaultValues={{
                expanded: !initialValue,
            }}
        >
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label="Nome do Serviço"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder={`Serviço 1`}
                    />
                )}
                name="name"
            />

            <ProductsHub
                setData={setData}
                navigation={navigation}
                initialValue={initialValue?.products}
            />

            <MaterialsHub
                setData={setData}
                navigation={navigation}
                initialValue={initialValue?.materials}
            />

            <CalendarHub setData={setData} initialValue={initialValue?.date} />
            <TimeHub setData={setData} initialValue={initialValue?.date} />

            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label="Desconto"
                        onFocus={() => onChange("")}
                        onBlur={() => {
                            if (!value || parseInt(value) < 0) {
                                onChange("0%");
                            } else if (parseInt(value) > 100) {
                                onChange("100%");
                            } else {
                                onChange(`${Number(value)}%`);
                            }
                            onBlur();
                        }}
                        onChangeText={onChange}
                        keyboardType="numeric"
                        value={value.toString()}
                        placeholder={
                            initialValue?.discount
                                ? `${initialValue?.discount?.toString()}%`
                                : "0%"
                        }
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
                onPress={handleSubmit}
                preset="next"
            />
        </SectionBottomSheet>
    );
}

const Section0Form = memo(Section0);

export default Section0Form;

interface ProductsHubProps {
    navigation: any;
    initialValue?: ProductModel[];
    setData: React.Dispatch<
        React.SetStateAction<Partial<OrderModel> | undefined>
    >;
}

function ProductsHub({ navigation, initialValue, setData }: ProductsHubProps) {
    const [products, setProducts] = useState<ProductModel[]>(
        initialValue ?? []
    );

    const [productData, setProductData] = useState<
        Partial<ProductModel> | undefined
    >(undefined);

    return (
        <Fragment>
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
                                loggedNavigation(navigation, "Catalog")
                            }
                            style={{ flex: 1, paddingTop: 6, paddingBottom: 6 }}
                            icon="bookmark-multiple-outline"
                            iconFamily="MaterialCommunityIcons"
                        />
                    </View>
                </View>
            </SubSectionWrapper>

            <BottomSheet height={"62%"} id={"productBottomSheet"}>
                <ProductForm
                    initialData={productData}
                    onSubmitForm={(data) => {
                        if (productData) {
                            setData((prev) => ({
                                ...prev,
                                products: products.map((oldProduct) =>
                                    oldProduct.id === data.id
                                        ? data
                                        : oldProduct
                                ),
                            }));

                            setProducts((prev) =>
                                prev.map((oldProduct) =>
                                    oldProduct.id === data.id
                                        ? data
                                        : oldProduct
                                )
                            );
                        } else {
                            setData((prev) => ({
                                ...prev,
                                products: [...products, data],
                            }));

                            setProducts((prev) => [...prev, data]);
                        }
                    }}
                />
            </BottomSheet>
        </Fragment>
    );
}

interface MaterialsHubProps {
    navigation: any;
    setData: React.Dispatch<
        React.SetStateAction<Partial<OrderModel> | undefined>
    >;
    initialValue?: MaterialModel[];
}

function MaterialsHub({
    navigation,
    initialValue,
    setData,
}: MaterialsHubProps) {
    const [materials, setMaterials] = useState<MaterialModel[]>(
        initialValue ?? []
    );

    const [materialData, setMaterialData] = useState<
        Partial<MaterialModel> | undefined
    >(undefined);

    return (
        <Fragment>
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
            <BottomSheet height={"78%"} id={"materialBottomSheet"}>
                <MaterialForm
                    initialData={materialData}
                    onSubmitForm={(data) => {
                        if (materialData) {
                            setData((prev) => ({
                                ...prev,
                                materials: materials.map((oldMaterial) =>
                                    oldMaterial.id === data.id
                                        ? data
                                        : oldMaterial
                                ),
                            }));

                            setMaterials((prev) =>
                                prev.map((oldMaterial) =>
                                    oldMaterial.id === data.id
                                        ? data
                                        : oldMaterial
                                )
                            );
                        } else {
                            setData((prev) => ({
                                ...prev,
                                materials: [...materials, data],
                            }));

                            setMaterials((prev) => [...prev, data]);
                        }
                    }}
                />
            </BottomSheet>
        </Fragment>
    );
}

interface CalendarHubProps {
    setData: React.Dispatch<
        React.SetStateAction<Partial<OrderModel> | undefined>
    >;
    initialValue?: Date;
}

function CalendarHub({ setData, initialValue }: CalendarHubProps) {
    const currentDate = new Date();
    const [date, setDate] = useState<CalendarDate | undefined>(
        initialValue
            ? {
                  date: initialValue?.getDate(),
                  month: initialValue?.getMonth(),
              }
            : { date: currentDate.getDate(), month: currentDate.getMonth() }
    );

    return (
        <SubSectionWrapper headerProps={{ title: "Data" }}>
            <Calendar
                isStatic
                selectedDate={date}
                setSelectedDate={(calendarDate) => {
                    setDate(calendarDate);
                    setData((prev) => ({
                        ...prev,
                        date: new Date(
                            currentDate.getFullYear(),
                            calendarDate.month,
                            calendarDate.date
                        ),
                    }));
                }}
                style={{ padding: 16, backgroundColor: colors.gray[600] }}
            />
        </SubSectionWrapper>
    );
}

interface TimeHubProps {
    setData: React.Dispatch<
        React.SetStateAction<Partial<OrderModel> | undefined>
    >;
    initialValue?: Date;
}

function TimeHub({ setData, initialValue }: TimeHubProps) {
    const { colorScheme } = useColorScheme();
    const newDate = useRef(new Date());

    const [time, setTime] = useState(initialValue ?? undefined);
    const [isTimeModalVisible, setTimeModalVisible] = useState(false);

    const onDateChange = useCallback((date: Date) => {
        newDate.current = date;
    }, []);

    const onConfirm = () => {
        setTimeModalVisible(false);

        console.log("Data: ", newDate.current);
        setData((prev) => ({
            ...prev,
            date: newDate.current,
        }));
        setTime(newDate.current);
    };

    const onClean = () => {
        setTimeModalVisible(false);

        setData((prev) => ({
            ...prev,
            date: undefined,
        }));
        setTime(undefined);
    };

    return (
        <Fragment>
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
        </Fragment>
    );
}
