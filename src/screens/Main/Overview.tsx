import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, SectionList, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
    FlatList,
    ScrollView as GestureHandlerScrollView,
} from "react-native-gesture-handler";

import * as NavigationBar from "expo-navigation-bar";
import { useColorScheme } from "nativewind";
import colors from "global/colors";

// Components
import Container from "components/Container";
import { TabBarScreenHeader } from "components/Header";
import StatisticsCarousel from "components/Statistics/Carousel";
import SearchBar from "components/SearchBar";
import BottomSheet from "components/BottomSheet";
import Label from "components/Label";
import DateFilter from "components/DateFilter";

import { Empty, Loading } from "components/StatusMessage";
import { OrderWithProductsPreview } from "components/OrderPreview";
import { TagsSelector } from "components/TagsSelector";
import { FilterView } from "./Home";
import { ActionButton } from "components/Button";

// Database
import { Q } from "@nozbe/watermelondb";
import { database } from "database/index.native";

// Types
import type { OrderModel } from "database/models/order.model";
import type { ProductModel } from "database/models/product.model";

interface MonthWithOrders {
    month: string;
    dates: DateWithOrders[];
}

interface DateWithOrders {
    title: string;
    data: OrderModel[];
}

const monthsNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
];

export default function Overview({ navigation }: { navigation: any }) {
    const { colorScheme } = useColorScheme();
    const [orders, setOrders] = React.useState<OrderModel[] | undefined>(
        undefined
    );

    async function fetchData() {
        setOrders(undefined);
        try {
            const ordersCollection = database.get<OrderModel>("orders");
            const orders = await ordersCollection
                .query(
                    Q.or(
                        Q.where("date", Q.lte(new Date().getTime())),
                        Q.where("status", Q.notEq("scheduled"))
                    )
                )
                .fetch();
            setOrders(orders);
        } catch (error) {
            console.log(error, "erro");
            setOrders([]);
        }
    }

    useFocusEffect(
        useCallback(() => {
            if (orders === undefined) {
                fetchData();
            }
            NavigationBar.setPositionAsync("absolute");
            NavigationBar.setBackgroundColorAsync("transparent");
        }, [])
    );

    const monthsWithOrders = React.useMemo(() => {
        const monthsWithOrders: MonthWithOrders[] = [];
        const months =
            orders?.map((order) => new Date(order.date).getMonth()) ?? [];
        const uniqueMonths = [...new Set(months)];
        uniqueMonths.forEach((month) => {
            const ordersInMonth =
                orders?.filter(
                    (order) => new Date(order.date).getMonth() === month
                ) ?? [];
            const dates = ordersInMonth.map(
                (order) => new Date(order.date).toISOString().split("T")[0]
            );
            const uniqueDates = [...new Set(dates)];
            const datesWithOrders: DateWithOrders[] = [];
            uniqueDates.forEach((date) => {
                const ordersInDate = ordersInMonth.filter(
                    (order) =>
                        new Date(order.date).toISOString().split("T")[0] ===
                        date
                );
                datesWithOrders.push({
                    title: date,
                    data: ordersInDate,
                });
            });
            monthsWithOrders.push({
                month: monthsNames[month],
                dates: datesWithOrders,
            });
        });
        return monthsWithOrders;
    }, [orders]);

    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [typesFilter, setTypesFilter] = useState<string[] | undefined>(
        undefined
    );

    return (
        <Container>
            <TabBarScreenHeader title="Visão Geral" navigation={navigation} />
            <SearchBar placeholder="Buscar por nome, cliente" />
            <GestureHandlerScrollView
                nestedScrollEnabled // Allows scrolling inside the ScrollView
                directionalLockEnabled // Prevents scrolling horizontally
                className="flex flex-col w-screen self-center gap-y-5"
                contentContainerStyle={{
                    alignItems: "flex-start",
                    justifyContent: "center",
                }}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                disallowInterruption
            >
                <View className="flex flex-row items-start w-full px-6">
                    <FilterView colorScheme={colorScheme} />
                    <View className="w-full pr-10">
                        <TagsSelector
                            tags={[
                                {
                                    name: "Datas",
                                    id: "dates",
                                    onPress: () =>
                                        BottomSheet.expand("datesFilter"),
                                },
                                {
                                    name: "Tipos",
                                    id: "types",
                                    onPress: () =>
                                        BottomSheet.expand("typesFilter"),
                                },
                            ]}
                            onClear={() => {}}
                            insertPaddingRight
                        />
                    </View>
                </View>
                <StatisticsCarousel />
                {monthsWithOrders.length > 0 ? (
                    <FlatList
                        data={monthsWithOrders}
                        className="w-screen"
                        renderItem={(data) => <MonthDates {...data.item} />}
                    />
                ) : orders === undefined ? (
                    <View className="w-full flex-1 items-center justify-center pt-14 px-4">
                        <Loading />
                    </View>
                ) : (
                    <View className="w-full flex-1 items-center justify-center pt-14 px-4">
                        <Empty message="Nenhum serviço foi arquivado até o momento." />
                    </View>
                )}
            </GestureHandlerScrollView>
            <BottomSheet id={"datesFilter"} overDragAmount={25} height={"47%"}>
                <DateFilter onSubmit={setDateFilter} />
            </BottomSheet>
            <BottomSheet id={"typesFilter"} overDragAmount={25} height={"33%"}>
                <ScrollView
                    className="flex flex-1"
                    contentContainerStyle={{
                        paddingLeft: 24,
                        paddingRight: 24,
                        paddingBottom: 12,
                        rowGap: 25,
                    }}
                >
                    <Label style={{ marginBottom: 5 }}>
                        Filtrar por categoria
                    </Label>
                    <View className="flex flex-1">
                        <Empty
                            message="Nenhuma categoria foi encontrada."
                            style={{ transform: [{ scale: 0.9 }] }}
                        />
                    </View>
                    <ActionButton
                        label={`Filtrar`}
                        icon={"filter-alt"}
                        style={{
                            backgroundColor: colors.primary,
                        }}
                        onPress={() => {} /* handleSubmit(onSubmit, onError) */}
                    />
                </ScrollView>
            </BottomSheet>
        </Container>
    );
}

const MonthDates = ({ month, dates }: MonthWithOrders) => {
    const { navigate } = useNavigation();

    return (
        <View className="flex flex-col w-full px-6">
            <View className="flex flex-row items-center justify-between w-full mt-4 mb-2">
                <Text className="text-black  font-titleBold text-2xl">
                    {month}
                </Text>
                <View className="flex flex-row items-end">
                    {dates.length > 2 && (
                        <Text className="text-text-100 font-titleSemiBold text-sm">
                            {dates.length} serviços
                        </Text>
                    )}
                </View>
            </View>
            <SectionList
                sections={dates}
                stickySectionHeadersEnabled
                renderSectionHeader={({ section: { title, data } }) => (
                    <DateOrdersList title={title} data={data} />
                )}
                renderItem={({ item, index }) => (
                    <EnhancedOrderWithProductsPreview
                        key={index.toString()}
                        order={item}
                        onPress={() => navigate("order", { orderId: item.id })}
                    />
                )}
            />
        </View>
    );
};

const DateOrdersList = ({
    title,
    data,
}: {
    title: string;
    data: OrderModel[];
}) => {
    const date = new Date(title);
    const dayName = date.toLocaleDateString("pt-BR", { weekday: "long" });
    const dateMonth = date.toLocaleDateString("pt-BR", { month: "short" });

    const [earnings, setEarnings] = React.useState<number>(0);

    async function getEarnings(ordersInDate: OrderModel[]) {
        const productsEarnings = await Promise.all(
            ordersInDate.map(async (order: any) => {
                const products = await order.products.fetch();
                const productsEarnings = products.map(
                    (product: ProductModel) => product.price
                );
                return productsEarnings.reduce(
                    (a: number, b: number) => a + b,
                    0
                );
            })
        );
        const earnings = productsEarnings.reduce(
            (a: number, b: number) => a + b,
            0
        );
        setEarnings(earnings);
    }

    useEffect(() => {
        getEarnings(data);
    }, []);

    return (
        <View className="flex flex-col items-start justify-center w-full">
            <View className="flex flex-row items-center justify-between w-full mt-4 mb-2">
                <Text className="text-black  font-titleRegular text-sm capitalize">
                    {dayName.split(", ")[0].split("-")[0]}, {date.getDate()}{" "}
                    {dateMonth} {date.getFullYear()}
                </Text>
                <View className="flex flex-row items-end">
                    <Text className="text-text-100 font-titleSemiBold text-sm">
                        R$ {earnings},00 ganhos
                    </Text>
                </View>
            </View>
            <View className="border-b border-text-100 w-full mb-2" />
        </View>
    );
};

const EnhancedOrderWithProductsPreview = ({ order, ...rest }: any) => {
    const [observedProducts, setProducts] = useState<
        ProductModel[] | undefined
    >(undefined);

    useEffect(() => {
        order.products.observe().subscribe((products: ProductModel[]) => {
            setProducts(products);
        });
    }, []);

    return (
        <OrderWithProductsPreview
            order={order}
            products={observedProducts}
            {...rest}
        />
    );
};
