import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";

import clsx from "clsx";
import colors from "global/colors";

import PaymentMethodsIcon from "assets/icons/currency_exchange.svg";
import WarrantyIcon from "assets/icons/warranty.svg";

// Components
import SectionBottomSheet from "../../../components/Form/SectionBottomSheet";
import { Loading } from "components/StatusMessage";
import { PreviewStatic } from "components/Preview";
import {
    Section,
    SubSectionWrapper,
    WrapperProps,
} from "../../../components/Form/SectionWrapper";
import { ActionButton } from "components/Button";

// Utils
import { database } from "database/index.native";

// Functions

async function getOrderNumber() {
    const ordersCollection = database.get<OrderModel>("orders");
    const count = await ordersCollection.query().fetchCount();
    return count + 1;
}

// Types
import type { MaterialModel } from "database/models/material.model";
import type { OrderModel } from "database/models/order.model";
import type { ProductModel } from "database/models/product.model";
import type {
    Section0Props,
    Section0RefProps,
    Section1Props,
    Section1RefProps,
} from "../@types";

// Utils
import { Q } from "@nozbe/watermelondb";
import { scheduleOrderNotification } from "utils/notificationHandler";
import { getPaymentCondition } from "utils/pdfHandler";

interface ReviewSectionProps {
    wrapperProps: WrapperProps;
    value: string;
    multiline?: boolean;
}

export const ReviewSection = ({
    wrapperProps,
    value,
    multiline,
}: ReviewSectionProps) => (
    <SubSectionWrapper {...wrapperProps}>
        <View
            className={clsx(
                "w-full px-4 py-3 rounded-lg border border-gray-300 bg-black dark:bg-gray-300",
                {
                    "min-h-[100px] pt-4": multiline,
                }
            )}
        >
            <Text className="text-text-100">{value}</Text>
        </View>
    </SubSectionWrapper>
);

export const PaymentMethodsReview = ({ value }: { value: string }) => (
    <ReviewSection
        wrapperProps={{
            headerProps: {
                title: "Métodos de Pagamento",
                icon: PaymentMethodsIcon,
            },
            style: { flex: 1 },
        }}
        value={value}
    />
);

export const WarrantyReview = ({ value }: { value?: string }) => (
    <ReviewSection
        wrapperProps={{
            headerProps: { title: "Garantia", icon: WarrantyIcon },
            style: { flex: 1 },
        }}
        value={value ?? "---"}
    />
);

interface Section2Props extends Section {
    bottomSheet: string;
    formRefs: {
        section0Ref: React.RefObject<Section0RefProps>;
        section1Ref: React.RefObject<Section1RefProps>;
    };
}

const updateFilter = (databaseArray: Array<any>, newArray: Array<any>) => {
    return databaseArray.filter((databaseItem) =>
        newArray.some((newItem) => newItem.id === databaseItem.id)
    );
};

const deleteFilter = (databaseArray: Array<any>, newArray: Array<any>) => {
    return databaseArray.filter(
        (databaseItem) =>
            !newArray.some((newItem) => newItem.id === databaseItem.id)
    );
};

const createFilter = (databaseArray: Array<any>, newArray: Array<any>) => {
    return newArray.filter(
        (newItem) =>
            !databaseArray.some(
                (databaseItem) => databaseItem.id === newItem.id
            )
    );
};

export default function Section2({
    bottomSheet,
    formRefs,
    initialValue,
}: Section2Props) {
    const { navigate } = useNavigation();
    const { section0Ref, section1Ref } = formRefs;

    const currentDate = new Date();
    const [data, setData] = useState<
        (Section0Props & Section1Props & { orderId: number }) | undefined | null
    >(undefined);
    const [isLoading, setLoading] = useState(false);

    const onExpanded = async () => {
        if (formRefs) {
            const section0Data = section0Ref.current?.getData();
            const section1Data = section1Ref.current?.getData();

            if (section0Data && section1Data) {
                const orderId = await getOrderNumber();
                const newData = {
                    ...section0Data,
                    ...section1Data,
                    orderId,
                };

                setData(newData);
            }
        }
    };

    const onSubmit = useCallback(async () => {
        const serviceDate = data?.date
            ? new Date(
                  currentDate.getFullYear(),
                  data.date.month,
                  data.date.date,
                  data.time?.getHours() ?? 0,
                  data.time?.getMinutes() ?? 0,
                  data.time?.getSeconds() ?? 0
              )
            : currentDate;

        if (data) {
            setLoading(true);
            const formattedData = {
                name:
                    data.name ||
                    `Serviço n.0${data.orderId}-${currentDate.getFullYear()}`,
                date: serviceDate,
                status: "scheduled",
                discount: data.discount,
                additionalInfo: data.additionalInfo,
                paymentCondition: data.paymentCondition,
                paymentMethods: data.checkedPaymentMethods,
                splitValue: data.splitValue,
                splitRemaining: data.splitRemaining,
                warrantyPeriod: data.warrantyDays,
                warrantyDetails: data.warrantyDetails,
            } as OrderModel;

            if (initialValue) {
                const { order, productsAmount, client } = await database.write(
                    async () => {
                        const updatedOrder = await initialValue.order.update(
                            (order) => {
                                order.name = formattedData.name;
                                order.date = formattedData.date;
                                order.status = formattedData.status;
                                order.discount = formattedData.discount;
                                order.additionalInfo =
                                    formattedData.additionalInfo;
                                order.paymentCondition =
                                    formattedData.paymentCondition;
                                order.paymentMethods =
                                    formattedData.paymentMethods;
                                order.splitRemaining =
                                    formattedData.splitRemaining;
                                order.splitValue = formattedData.splitValue;
                                order.warrantyPeriod =
                                    formattedData.warrantyPeriod;
                                order.warrantyDetails =
                                    formattedData.warrantyDetails;
                            }
                        );

                        // Sub orders
                        const productsToUpdate = updateFilter(
                            initialValue.products,
                            data.products
                        ) as ProductModel[];
                        const batchProductsToUpdate = productsToUpdate.map(
                            (product) => {
                                const newData = data.products.find(
                                    (newProduct) => newProduct.id === product.id
                                );
                                if (newData) {
                                    const updatedProduct =
                                        product.prepareUpdate(
                                            (subOrderToUpdate) => {
                                                subOrderToUpdate.description =
                                                    newData.description;
                                                subOrderToUpdate.details =
                                                    newData.details;
                                                subOrderToUpdate.price =
                                                    newData.price;
                                                subOrderToUpdate.types =
                                                    newData.types;
                                            }
                                        );
                                    return updatedProduct;
                                }
                            }
                        );

                        //console.log(batchProductsToUpdate)

                        const productsToDelete = deleteFilter(
                            initialValue.products,
                            data.products
                        );
                        const batchProductsToDelete = productsToDelete.map(
                            (product) => {
                                const deletedProduct =
                                    product.prepareDestroyPermanently();
                                return deletedProduct;
                            }
                        );

                        const productsModel =
                            await database.collections.get<ProductModel>(
                                "orders"
                            );

                        const productsToCreate = createFilter(
                            initialValue.products,
                            data.products
                        );
                        const batchProductsToCreate = productsToCreate.map(
                            (product) => {
                                const newProduct = productsModel.prepareCreate(
                                    (subOrderToCreate: any) => {
                                        subOrderToCreate.order.set(
                                            updatedOrder
                                        );
                                        subOrderToCreate.description =
                                            product.description;
                                        subOrderToCreate.details =
                                            product.details;
                                        subOrderToCreate.types = product.types;
                                        subOrderToCreate.amount =
                                            product.amount;
                                        subOrderToCreate.price = product.price;
                                    }
                                );
                                return newProduct;
                            }
                        );

                        // Materials
                        const materialsToUpdate = updateFilter(
                            initialValue.materials,
                            data.materials
                        ) as MaterialModel[];
                        const batchMaterialsToUpdate = materialsToUpdate.map(
                            (material) => {
                                const newData = data.materials.find(
                                    (newMaterial) =>
                                        newMaterial.id === material.id
                                );
                                if (newData) {
                                    const updatedMaterial =
                                        material.prepareUpdate(
                                            (materialToUpdate) => {
                                                materialToUpdate.name =
                                                    newData.name;
                                                materialToUpdate.description =
                                                    newData.description;
                                                materialToUpdate.image_url =
                                                    newData.image_url;
                                                materialToUpdate.price =
                                                    newData.price;
                                                materialToUpdate.amount =
                                                    newData.amount;
                                                materialToUpdate.profitMargin =
                                                    newData.profitMargin;
                                                materialToUpdate.availability =
                                                    newData.availability;
                                            }
                                        );
                                    return updatedMaterial;
                                }
                            }
                        );
                        //console.log(batchMaterialsToUpdate.length, "materialsToUpdate")

                        const materialsToDelete = deleteFilter(
                            initialValue.materials,
                            data.materials
                        );
                        const batchMaterialsToDelete = materialsToDelete.map(
                            (material) => {
                                const deletedMaterial =
                                    material.prepareDestroyPermanently();
                                return deletedMaterial;
                            }
                        );
                        //console.log(batchMaterialsToDelete.length, "batchMaterialsToDelete")

                        const materialsModel =
                            await database.collections.get<MaterialModel>(
                                "materials"
                            );

                        const materialsToCreate = createFilter(
                            initialValue.materials,
                            data.materials
                        );
                        const batchMaterialsToCreate = materialsToCreate.map(
                            (material) => {
                                const newMaterial =
                                    materialsModel.prepareCreate(
                                        (materialToCreate: any) => {
                                            materialToCreate.order.set(
                                                updatedOrder
                                            );
                                            materialToCreate.name =
                                                material.name;
                                            materialToCreate.description =
                                                material.description;
                                            materialToCreate.image_url =
                                                material.image_url;
                                            materialToCreate.price =
                                                material.price;
                                            materialToCreate.amount =
                                                material.amount;
                                            materialToCreate.profitMargin =
                                                material.profitMargin;
                                            materialToCreate.availability =
                                                material.availability;
                                        }
                                    );
                                return newMaterial;
                            }
                        );
                        //console.log(batchMaterialsToCreate.length, "batchMaterialsToCreate")

                        // Adicionamos os subserviços e os materiais ao serviço
                        await database.batch([
                            ...batchProductsToUpdate,
                            ...batchProductsToDelete,
                            ...batchProductsToCreate,
                            ...batchMaterialsToUpdate,
                            ...batchMaterialsToDelete,
                            ...batchMaterialsToCreate,
                        ]);

                        const productsAmount = await database
                            .get<ProductModel>(`orders`)
                            .query(Q.where("order_id", updatedOrder.id))
                            .fetchCount();
                        const typedUpdateOrder = updatedOrder as any;
                        const client = await typedUpdateOrder.client.fetch();

                        return {
                            order: updatedOrder,
                            productsAmount,
                            client,
                        };
                    }
                );

                await scheduleOrderNotification(
                    order,
                    productsAmount,
                    client?.name
                );

                setLoading(false);
                console.log(
                    "Order updated successfully (with products and materials)."
                );
                navigate("order", {
                    orderId: initialValue.order.id,
                    updated: true,
                });
            } else {
                const serviceOnDatabase = await database.write(async () => {
                    const newOrder = await database
                        .get<OrderModel>("orders")
                        .create((order) => {
                            order.name = formattedData.name;
                            order.date = formattedData.date;
                            order.status = formattedData.status;
                            order.additionalInfo = formattedData.additionalInfo;
                            order.paymentCondition =
                                formattedData.paymentCondition;
                            order.paymentMethods = formattedData.paymentMethods;
                            order.splitValue = formattedData.splitValue;
                            order.splitRemaining = formattedData.splitRemaining;
                            order.warrantyPeriod = formattedData.warrantyPeriod;
                            order.warrantyDetails =
                                formattedData.warrantyDetails;
                        });

                    const batchProducts = await Promise.all(
                        data.products.map(async (product) => {
                            const newProduct = await database
                                .get<ProductModel>("orders")
                                .prepareCreate((sub_service_db: any) => {
                                    sub_service_db.order.set(newOrder);
                                    sub_service_db.description =
                                        product.description;
                                    sub_service_db.details = product.details;
                                    sub_service_db.types = product.types;
                                    sub_service_db.price = product.price;
                                    sub_service_db.amount = product.amount;
                                });
                            return newProduct;
                        })
                    );

                    const batchMaterials = await Promise.all(
                        data.materials.map(async (material) => {
                            const newMaterial = await database
                                .get<MaterialModel>("materials")
                                .prepareCreate((material_db: any) => {
                                    material_db.order.set(newOrder);
                                    material_db.name = material.name;
                                    material_db.description =
                                        material.description;
                                    material_db.image_url = material.image_url;
                                    material_db.price = material.price;
                                    material_db.amount = material.amount;
                                    material_db.profitMargin =
                                        material.profitMargin;
                                    material_db.availability =
                                        material.availability;
                                });
                            return newMaterial;
                        })
                    );

                    // Adicionamos os subserviços e os materiais ao serviço
                    await database.batch([...batchProducts, ...batchMaterials]);

                    return newOrder;
                });

                if (serviceDate > new Date()) {
                    await scheduleOrderNotification(
                        serviceOnDatabase,
                        data.products.length
                    );
                }

                //console.log("Order created successfully (with products and materials).")
                navigate("Home", { order: "created" });
            }
        }
    }, [data]);

    const onDismissed = useCallback(() => {
        setData(undefined); // voltamos ao estado de carregamento
    }, []);

    return (
        <SectionBottomSheet
            id={bottomSheet}
            height="67%"
            onExpanded={onExpanded}
            onDismissed={onDismissed}
        >
            {data ? (
                <>
                    <View className="flex-col w-full items-start justify-center">
                        <Text className="font-titleBold text-start text-2xl text-black dark:text-white">
                            Confira se as informações abaixo estão corretas.
                        </Text>
                        <Text className="text-sm text-start mt-1 text-black dark:text-white">
                            Caso não, volte aos passos anteriores para corrigir.
                        </Text>
                    </View>

                    <ReviewSection
                        wrapperProps={{
                            headerProps: { title: "Nome do Serviço" },
                        }}
                        value={
                            data.name ||
                            `Serviço n.0${
                                data.orderId
                            }-${currentDate.getFullYear()}`
                        }
                    />

                    {data.additionalInfo && (
                        <ReviewSection
                            wrapperProps={{
                                headerProps: {
                                    title: "Informações Adicionais",
                                },
                            }}
                            value={data.additionalInfo ?? "[vazio]"}
                        />
                    )}

                    <View className="flex-row w-full">
                        <ReviewSection
                            wrapperProps={{
                                headerProps: { title: "Data" },
                                style: { flex: 1, marginRight: 10 },
                            }}
                            value={new Date(
                                `${currentDate.getFullYear()}-${
                                    data.date?.month! + 1
                                }-${data.date?.date! + 1}T00:00:00Z`
                            ).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            })}
                        />
                        <ReviewSection
                            wrapperProps={{
                                headerProps: { title: "Hora" },
                                style: { flex: 1 },
                            }}
                            value={
                                data.time
                                    ? `${data.time?.getHours()}:${data.time?.getMinutes()}${
                                          data.time.getMinutes() < 10 ? "0" : ""
                                      }`
                                    : "Indeterminado"
                            }
                        />
                    </View>

                    <ReviewSection
                        wrapperProps={{
                            headerProps: {
                                title: "Desconto",
                                icon: "money-off",
                            },
                            style: { flex: 1 },
                        }}
                        value={data.discount ? `${data.discount}%` : "Nenhum"}
                    />

                    <ReviewSection
                        wrapperProps={{
                            headerProps: {
                                title: "Condições de Pagamento",
                                icon: "credit-card",
                            },
                            style: { flex: 1 },
                        }}
                        value={getPaymentCondition(
                            data.paymentCondition,
                            data.splitValue,
                            data.splitRemaining
                        )}
                    />

                    <PaymentMethodsReview
                        value={
                            data?.checkedPaymentMethods?.length
                                ? data?.checkedPaymentMethods.join(", ")
                                : "---"
                        }
                    />

                    <WarrantyReview
                        value={`${data.warrantyDays} dia${
                            data.warrantyDays !== 1 ? "s" : ""
                        }`}
                    />

                    {data.warrantyDetails && (
                        <ReviewSection
                            wrapperProps={{
                                headerProps: { title: "Condições da Garantia" },
                            }}
                            value={data.warrantyDetails ?? "[vazio]"}
                        />
                    )}

                    {data.products && data.products.length > 0 && (
                        <SubSectionWrapper
                            style={{ flex: 1 }}
                            headerProps={{ title: "Serviços" }}
                        >
                            <View className="w-full">
                                {data.products.map((product, index) => (
                                    <View
                                        className="mb-4"
                                        key={index.toString()}
                                    >
                                        <PreviewStatic product={product} />
                                    </View>
                                ))}
                            </View>
                        </SubSectionWrapper>
                    )}

                    {data.materials && data.materials.length > 0 && (
                        <SubSectionWrapper
                            style={{ flex: 1 }}
                            headerProps={{ title: "Materiais" }}
                        >
                            <View className="w-full">
                                {data.materials.map((material, index) => (
                                    <View
                                        className="mb-4"
                                        key={index.toString()}
                                    >
                                        <PreviewStatic material={material} />
                                    </View>
                                ))}
                            </View>
                        </SubSectionWrapper>
                    )}

                    <ActionButton
                        isLoading={isLoading}
                        onPress={onSubmit}
                        label={initialValue ? "Atualizar" : "Agendar"}
                        style={{ backgroundColor: colors.primary }}
                        preset="next"
                    />
                </>
            ) : (
                <Loading message="Aguarde enquanto verificamos os dados do agendamento..." />
            )}
        </SectionBottomSheet>
    );
}
