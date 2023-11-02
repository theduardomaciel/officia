import React, { useState } from "react";
import { View, Text, FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container from "components/Container";
import Header from "components/Header";

import { Empty, Loading } from "components/StatusMessage";
import { EnhancedOrderPreview } from "./Main/Home";

// Database
import { database } from "database/index.native";
import { Q } from "@nozbe/watermelondb";

import type { OrderModel } from "database/models/order.model";

export default function DateAgenda({ route, navigation }: any) {
    const { dateString } = route.params as { dateString: string };
    const { colorScheme } = useColorScheme();

    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const [orders, setOrders] = useState<OrderModel[] | undefined>(undefined);

    async function fetchOrder() {
        const orders = await database
            .get<OrderModel>("orders")
            .query(Q.where("date", Q.gte(new Date(dateString).getTime())))
            .fetch();

        setTimeout(() => {
            setOrders(
                orders.filter(
                    (order) =>
                        order.date.getDate() === new Date(dateString).getDate()
                )
            );
        }, 500);
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchOrder();
        }, [dateString])
    );

    return (
        <Container>
            <View>
                <Header
                    title="Serviços agendados"
                    /* upperChildren={orders && orders?.length > 2 && <Text>{orders.length} serviços</Text>} */
                    returnButton
                />
            </View>
            <View className="flex-row gap-x-2 items-center justify-start">
                <MaterialIcons
                    name="calendar-today"
                    size={18}
                    color={
                        colorScheme === "dark" ? colors.text[100] : colors.black
                    }
                />
                <Text className="text-sm text-black dark:text-text-100">
                    {dateFormatted}
                </Text>
            </View>
            {orders !== undefined ? (
                <FlatList
                    contentContainerStyle={{ height: "100%" }}
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <EnhancedOrderPreview
                            key={item.id}
                            order={item}
                            additionalInfo="time"
                            onPress={() =>
                                navigation.navigate("order", {
                                    orderId: item.id,
                                })
                            }
                        />
                    )}
                    ListEmptyComponent={() => (
                        <Empty style={{ paddingBottom: 150 }} />
                    )}
                />
            ) : (
                <Loading />
            )}
        </Container>
    );
}
