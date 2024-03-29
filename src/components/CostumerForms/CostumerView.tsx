import React, { useCallback } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

import WhatsAppIcon from "src/assets/icons/whatsApp.svg";

// Types
import type { CostumerModel } from "database/models/costumer.model";
import type { OrderModel } from "database/models/order.model";

// Components
import { ActionButton, SubActionButton } from "components/Button";
import BottomSheet from "components/BottomSheet";
import ClientAdd from "./CostumerAdd";
import ClientEdit from "./CostumerEdit";
import ClientSelect from "./CostumerSelect";

import { database } from "database/index.native";

interface Props {
    client: CostumerModel;
    order: OrderModel;
}

export default function ClientView({ client, order }: Props) {
    // Bottom Sheets
    const clientSelectBottomSheet = "clientSelectBottomSheet";
    const clientSelectBottomSheetOpenHandler = useCallback(() => {
        BottomSheet.expand(clientSelectBottomSheet);
    }, []);

    const clientEditBottomSheet = "clientEditBottomSheet";
    const clientEditBottomSheetOpenHandler = useCallback(() => {
        BottomSheet.expand(clientEditBottomSheet);
    }, []);

    const bottomSheetCloseHandler = useCallback(() => {
        BottomSheet.close("clientViewBottomSheet");
    }, []);

    async function removeOrderClient() {
        bottomSheetCloseHandler();

        try {
            await database.write(async () => {
                await order.update((order: any) => {
                    order.client.id = null;
                });
            });
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <BottomSheet height={"40%"} id={"clientViewBottomSheet"}>
            <View
                className="flex flex-1 gap-y-5 items-center justify-between"
                style={{
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingBottom: 12,
                }}
            >
                <View className="flex-col items-center justify-center">
                    <BottomSheet.Title ellipsizeMode="tail" numberOfLines={1}>
                        {client.name}
                    </BottomSheet.Title>
                    <View className="flex-row items-center justify-center gap-x-4">
                        <TouchableOpacity
                            className="flex-row mt-2 items-center justify-center"
                            activeOpacity={0.8}
                            onPress={() => {
                                const phoneNumber = client.contact!.replace(
                                    /\D/g,
                                    ""
                                );
                                Linking.openURL(`tel:${phoneNumber}`);
                            }}
                        >
                            <MaterialIcons
                                name="phone"
                                size={16}
                                color={colors.text[200]}
                            />
                            <Text className="text-black dark:text-text-200 text-base underline ml-2">
                                {client.contact}
                            </Text>
                        </TouchableOpacity>
                        <View className="h-4 w-[1px] mt-2  bg-text-200" />
                        <TouchableOpacity
                            className="flex-row mt-2 items-center justify-center"
                            activeOpacity={0.8}
                            onPress={() => {
                                const phoneNumber = client.contact!.replace(
                                    /\D/g,
                                    ""
                                );
                                Linking.openURL(
                                    `whatsapp://send?text=&phone=${phoneNumber}`
                                );
                            }}
                        >
                            <WhatsAppIcon
                                width={16}
                                height={16}
                                color={colors.text[200]}
                            />
                            <Text className="text-black dark:text-text-200 text-base ml-2">
                                Conversar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View className="rounded-full w-24 h-24 flex items-center justify-center bg-gray-100 mr-4">
                    <MaterialIcons
                        name="person"
                        size={48}
                        color={colors.text[100]}
                    />
                </View>
                <View className="flex-row w-full items-center justify-between">
                    <View className="flex-1 mr-3">
                        <SubActionButton
                            /* label='Editar dados' */
                            icon="edit"
                            preset="dashed"
                            borderColor={colors.blue}
                            onPress={clientEditBottomSheetOpenHandler}
                        />
                    </View>
                    <View className="flex-1 mr-3">
                        <SubActionButton
                            /* label='Alterar cliente' */
                            icon="swap-horiz"
                            preset="dashed"
                            borderColor={colors.yellow}
                            onPress={() => {
                                bottomSheetCloseHandler();
                                clientSelectBottomSheetOpenHandler();
                            }}
                        />
                    </View>
                    <View className="flex-1">
                        <SubActionButton
                            /* label='Alterar cliente' */
                            icon="do-not-disturb-on"
                            preset="dashed"
                            borderColor={colors.red}
                            onPress={removeOrderClient}
                        />
                    </View>
                </View>
            </View>
            <ClientSelect
                order={order}
                lastBottomSheet={"clientViewBottomSheet"}
            />
            <ClientAdd order={order} />
            <ClientEdit
                client={client}
                order={order}
                lastBottomSheet={"clientViewBottomSheet"}
            />
        </BottomSheet>
    );
}
