import React, { SetStateAction, useEffect, useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

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
import colors from "global/colors";

// Components
import { ActionButton } from "components/Button";
import BottomSheet from "components/BottomSheet";
import Dropdown from "components/Dropdown";
import Input, { borderErrorStyle } from "components/Input";
import Toast from "components/Toast";
import ImagePicker from "components/ImagePicker";

// Types
import type { MaterialModel } from "database/models/material.model";

const schema = z.object({
    name: z.string({
        required_error:
            "É necessário inserir um nome para o material ser adicionado.",
    }),
    description: z.string(),
    price: z.string().default("0"),
    amount: z.string(),
    profitMargin: z.string(),
});

interface FormValues {
    name: string;
    description: string;
    price: string;
    amount: string;
    profitMargin: string;
}

interface Props {
    onSubmitForm?: (data: MaterialModel) => void;
    initialData?: Partial<MaterialModel>;
    toCatalog?: boolean;
}

export default function MaterialForm({
    onSubmitForm,
    initialData = undefined,
    toCatalog = false,
}: Props) {
    const [responsibility, setResponsibility] = useState(
        initialData?.responsibility
    );
    const [materialImage, setMaterialImage] = useState(
        initialData?.image_url ?? undefined
    );

    const showToast = (errorMessage?: string) => {
        Toast.show({
            preset: "error",
            title: "Por favor, preencha os campos corretamente.",
            description:
                errorMessage || "Não foi possível adicionar o serviço.",
        });
    };

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
            price: initialData?.price?.toString() ?? "",
            amount: initialData?.amount?.toString() ?? "1",
            profitMargin: initialData?.profitMargin?.toString() ?? "",
        },
        resolver: zodResolver(schema),
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        },
        mode: "onBlur",
    });

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        const newMaterial = {
            id: initialData ? initialData.id : uuidv4(),
            name: data.name,
            description: data.description,
            price: data.price.length > 0 ? parseFloat(data.price) : 0,
            amount: data.amount ? parseFloat(data.amount) : 1,
            profitMargin: data.profitMargin ? parseFloat(data.profitMargin) : 0,
            availability: responsibility,
            image_url: materialImage,
            responsibility: responsibility,
        } as Partial<MaterialModel>;
        //console.log(newMaterial)

        if (toCatalog) {
            // If the order is being added to the catalog, we mark it as such.
            Toast.show({
                preset: "success",
                title: "Material adicionado ao Catálogo",
                description:
                    "Você poderá acessá-lo a qualquer momento no Catálogo após o agendamento.",
            });
        } else if (initialData?.project?.id!!) {
            // If the order is being removed from the catalog, we mark it as such.
            Toast.show({
                preset: "success",
                title: "Material removido dos Itens Salvos.",
                description:
                    "Você pode adicioná-lo novamente a qualquer momento.",
            });
        } else {
            // In the case of some previous input error, we hide the modal.
            Toast.hide();
        }

        BottomSheet.close("materialBottomSheet");

        setMaterialImage(undefined);
        onSubmitForm && onSubmitForm(newMaterial as MaterialModel);
        reset();
    };

    const onError: SubmitErrorHandler<FormValues> = (errors, e) => {
        //console.log(errors)
        showToast(
            Object.values(errors)
                .map((error) => error.message)
                .join("\n")
        );
    };

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                description: initialData.description ?? undefined,
                price: initialData.price?.toString(),
                amount: initialData.amount?.toString() ?? "1",
                profitMargin: initialData.profitMargin?.toString() ?? "",
            });
            setMaterialImage(initialData?.image_url ?? undefined);
            setResponsibility(initialData?.responsibility);
        } else {
            reset({
                name: "",
                description: "",
                price: "",
                amount: "1",
                profitMargin: "",
            });
            setMaterialImage(undefined);
            setResponsibility("COSTUMER");
        }
    }, [initialData]);

    return (
        <>
            <View
                className="flex flex-1"
                style={{
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingBottom: 12,
                    rowGap: 20,
                }}
            >
                <BottomSheet.Title>
                    {initialData ? "Editar" : "Adicionar"} material
                </BottomSheet.Title>
                <ScrollView
                    className="flex flex-1 flex-col relative"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 16,
                        rowGap: 20,
                    }}
                >
                    <ImagePicker
                        imageUri={materialImage}
                        onUpdate={(imageUri) => setMaterialImage(imageUri)}
                        label="Adicionar imagem do produto"
                    />
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Material"
                                onBlur={onBlur}
                                onChangeText={(value) => onChange(value)}
                                value={value}
                                style={[!!errors.name && borderErrorStyle]}
                                placeholder="Painel LED de sobreposição, etc..."
                                pallette="dark"
                                required
                            />
                        )}
                        name="name"
                        rules={{ required: true }}
                    />
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Descrição"
                                onBlur={onBlur}
                                onChangeText={(value) => onChange(value)}
                                value={value}
                                style={[
                                    !!errors.description && borderErrorStyle,
                                ]}
                                placeholder="Marca Tigre, 12mm, etc..."
                                pallette="dark"
                            />
                        )}
                        name="description"
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
                                        label="Preço Unitário"
                                        onBlur={onBlur}
                                        onChangeText={(value) =>
                                            onChange(value)
                                        }
                                        value={value}
                                        style={
                                            !!errors.price && borderErrorStyle
                                        }
                                        placeholder="R$"
                                        keyboardType="number-pad"
                                        pallette="dark"
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
                                        label="Quantidade"
                                        onBlur={onBlur}
                                        onChangeText={(value) =>
                                            onChange(value)
                                        }
                                        value={value}
                                        style={
                                            !!errors.amount && borderErrorStyle
                                        }
                                        placeholder="1 item"
                                        keyboardType="number-pad"
                                        pallette="dark"
                                        required
                                    />
                                )}
                                name="amount"
                                rules={{ required: true }}
                            />
                        </View>
                    </View>
                    <View className="flex-row w-full items-center justify-between">
                        <View className="flex-1 mr-3">
                            <Controller
                                control={control}
                                render={({
                                    field: { onChange, onBlur, value },
                                }) => (
                                    <Input
                                        label="Margem de Lucro"
                                        onBlur={onBlur}
                                        onChangeText={(value) =>
                                            onChange(value)
                                        }
                                        value={value}
                                        style={
                                            !!errors.profitMargin &&
                                            borderErrorStyle
                                        }
                                        placeholder="0%"
                                        keyboardType="number-pad"
                                        pallette="dark"
                                    />
                                )}
                                name="profitMargin"
                                rules={{ required: false }}
                            />
                        </View>
                        <View className="flex-1">
                            <Dropdown
                                label="Tipo"
                                bottomSheetLabel=""
                                bottomSheetHeight={"20%"}
                                setSelected={
                                    setResponsibility as React.Dispatch<
                                        SetStateAction<string>
                                    >
                                }
                                selected={responsibility as string}
                                pallette="dark"
                                data={[
                                    {
                                        label: "Custo próprio",
                                        value: "available",
                                    },
                                    {
                                        label: "Custo do cliente",
                                        value: "unavailable",
                                    },
                                ]}
                            />
                        </View>
                    </View>
                </ScrollView>
                <View className="flex-row w-full items-center justify-between">
                    <View className="flex-1 mr-3">
                        <ActionButton
                            label={`${
                                initialData ? "Editar" : "Adicionar"
                            } material`}
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
