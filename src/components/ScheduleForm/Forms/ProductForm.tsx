import React, { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import colors from "global/colors";

// Form
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Controller,
    SubmitErrorHandler,
    SubmitHandler,
    useForm,
} from "react-hook-form";
import * as z from "zod";

// Utils
import { v4 as uuidv4 } from "uuid";

// Components
import { ActionButton } from "components/Button";
import BottomSheet from "components/BottomSheet";
import Label from "components/Label";
import Input, { borderErrorStyle } from "components/Input";
import {
    TagObject,
    TagsSelector,
    TagsSelectorRef,
} from "components/TagsSelector";
import Toast from "components/Toast";

// Types
import type { ProductModel } from "database/models/product.model";
import type { CategoryModel } from "database/models/category.model";

interface FormValues {
    description: string;
    details: string;
    price: string;
    amount: string;
}

const schema = z.object({
    description: z.string({
        required_error:
            "É necessário inserir uma descrição para o subserviço ser adicionado.",
    }),
    details: z.string(),
    price: z.string().default("0"),
    amount: z.string(),
});

interface Props {
    onSubmitForm?: (data: Partial<ProductModel>) => void;
    initialData?: Partial<ProductModel>;
    toCatalog?: boolean;
}

export default function ProductForm({
    onSubmitForm,
    initialData,
    toCatalog,
}: Props) {
    const showToast = (errorMessage?: string) => {
        Toast.show({
            preset: "error",
            title: "Por favor, preencha os campos corretamente.",
            description:
                errorMessage || "Não foi possível adicionar o produto.",
        });
    };

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            description: "",
            details: "",
            price: "0",
            amount: "1",
        },
        resolver: zodResolver(schema),
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        },
        mode: "onBlur",
    });

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        const newProduct = {
            id: initialData ? initialData.id : uuidv4(),
            description: data.description,
            details: data.details,
            price: (data.price ? parseFloat(data.price) : 0) ?? 0,
            amount: parseInt(data.amount),
            types: selectedTags.current,
        };
        //console.log(newProduct)

        if (toCatalog) {
            // If the order is being added to the saved items, we mark it as such.
            Toast.show({
                preset: "success",
                title: "Serviço adicionado aos Itens Salvos.",
                description:
                    "Você poderá acessá-lo a qualquer momento nos Itens Salvos após o agendamento.",
            });
        } else if (initialData?.project?.id!!) {
            // If the order is being removed from the saved items, we mark it as such.
            Toast.show({
                preset: "success",
                title: "Serviço removido dos Itens Salvos.",
                description:
                    "Você pode adicioná-lo novamente a qualquer momento.",
            });
        } else {
            // In the case of some previous input error, we hide the modal.
            Toast.hide();
        }

        BottomSheet.close("subOrderBottomSheet");

        onSubmitForm && onSubmitForm(newProduct as unknown as ProductModel);
        reset();
    };

    const onError: SubmitErrorHandler<FormValues> = (errors, e) => {
        showToast(
            Object.values(errors)
                .map((error) => error.message)
                .join("\n")
        );
    };

    const selectedTags = useRef<TagObject[]>([]);
    const tagsPickerRef = useRef<TagsSelectorRef>(null);

    useEffect(() => {
        if (initialData) {
            //console.log("Dados de edição inseridos.")
            selectedTags.current = initialData.categories ?? [];
            tagsPickerRef.current?.setTags(initialData.categories ?? []);

            reset({
                description: initialData.description,
                details: initialData.details ?? "",
                price: initialData.price?.toString(),
                amount: initialData.amount?.toString(),
            });
        } else {
            reset({
                description: "",
                details: "",
                price: "",
                amount: "1",
            });

            selectedTags.current = [];
            tagsPickerRef.current?.clearTags();
        }
    }, [initialData]);

    const [categories, setCategories] = React.useState<
        CategoryModel[] | undefined
    >(undefined);

    useEffect(() => {
        const getBusinessData = async () => {
            /* const data = (await database.localStorage.get(
                "businessData"
            )) as BusinessData;
            if (data) {
                //console.log("Dados obtidos com sucesso.", data)
                setBusinessData(data);
            } else {
                setBusinessData(undefined);
            } */
        };

        getBusinessData();
    }, []);

    return (
        <>
            <View
                className="flex flex-1 gap-y-5"
                style={{
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingBottom: 12,
                }}
            >
                <BottomSheet.Title>
                    {initialData ? "Editar Serviço" : "Adicionar Serviço"}
                </BottomSheet.Title>
                <ScrollView
                    className="flex flex-1 relative"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 16,
                        rowGap: 20,
                    }}
                >
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Descrição do Serviço"
                                onBlur={onBlur}
                                onChangeText={(value) => onChange(value)}
                                value={value}
                                style={!!errors.description && borderErrorStyle}
                                placeholder="Ex: Aplicação de silicone em box de banheiro"
                                pallette="dark"
                                required
                            />
                        )}
                        name="description"
                        rules={{ required: true }}
                    />
                    <View className="flex-col w-full" style={{ rowGap: 20 }}>
                        <Controller
                            control={control}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <Input
                                    label="Detalhes do Serviço"
                                    style={[
                                        { minHeight: 100, paddingTop: 15 },
                                        !!errors.details && borderErrorStyle,
                                    ]}
                                    multiline
                                    onBlur={onBlur}
                                    onChangeText={(value) => onChange(value)}
                                    value={value}
                                    pallette="dark"
                                    textAlignVertical={"top"}
                                    placeholder="Ex: O box precisa estar totalmente seco e limpo para a execução do serviço"
                                />
                            )}
                            name="details"
                            rules={{ required: false }}
                        />
                        <View className="flex-row w-full items-center justify-between">
                            <View className="flex-1 mr-3">
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
                                            style={
                                                !!errors.price &&
                                                borderErrorStyle
                                            }
                                            label="Preço Unitário"
                                            placeholder="R$"
                                            pallette="dark"
                                            keyboardType={"number-pad"}
                                            required
                                        />
                                    )}
                                    name="price"
                                    rules={{ required: true }}
                                />
                            </View>
                            <View className="flex-1">
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
                                            style={
                                                !!errors.amount &&
                                                borderErrorStyle
                                            }
                                            value={value}
                                            label="Quantidade"
                                            pallette="dark"
                                            keyboardType={"number-pad"}
                                        />
                                    )}
                                    name="amount"
                                    rules={{ required: true }}
                                />
                            </View>
                        </View>
                    </View>
                    <View className="flex-col align-top justify-start">
                        <Label>Categorias</Label>
                        <View className="my-2 flex items-start justify-center w-full">
                            {categories && categories.length > 0 && (
                                <TagsSelector
                                    ref={tagsPickerRef}
                                    tags={categories ?? []}
                                    onSelectTags={(newTags) => {
                                        selectedTags.current = newTags;
                                        //setSelectedTags(newTags);
                                    }}
                                    height={40}
                                    pallette="dark"
                                />
                            )}
                        </View>
                        <Text className="text-sm text-gray-100 text-center">
                            Para adicionar categorias, vá em "Seu Negócio" e
                            acesse a seção "Categorias"
                        </Text>
                    </View>
                </ScrollView>
                <View className="flex-row w-full items-center justify-between">
                    <View className="flex-1 mr-3">
                        <ActionButton
                            label={
                                initialData
                                    ? "Editar serviço"
                                    : "Adicionar serviço"
                            }
                            icon={initialData ? "edit" : "add"}
                            style={{
                                backgroundColor: initialData
                                    ? colors.blue
                                    : colors.primary,
                            }}
                            onPress={handleSubmit(onSubmit, onError)}
                        />
                    </View>
                </View>
            </View>
        </>
    );
}