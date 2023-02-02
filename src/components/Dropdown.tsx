import { useCallback, useRef } from "react";
import { TouchableOpacity, TouchableOpacityProps, View, Text, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";

import colors from "global/colors";
import clsx from "clsx";

import Label from "./Label";
import BottomSheet from "./BottomSheet";

interface Props extends TouchableOpacityProps {
    label: string;
    modalLabel?: string;
    data: {
        label: string;
        value: string;
    }[];
    pallette?: "dark";
    bottomSheetHeight?: string;
    selected: string;
    setSelected: (value: string) => void;
}

export default function Dropdown({ label, modalLabel, data, bottomSheetHeight, pallette, selected, setSelected, ...rest }: Props) {
    const { colorScheme } = useColorScheme();

    const bottomSheetRef = useRef<any>(null);

    const openHandler = useCallback(() => {
        bottomSheetRef.current.expand();
    }, [])

    const closeHandler = useCallback(() => {
        bottomSheetRef.current.close();
    }, [])

    return (
        <>
            <View className="flex-col align-top justify-start gap-y-2">
                <Label>
                    {label}
                </Label>
                <TouchableOpacity
                    activeOpacity={0.8}
                    className={clsx("flex-row justify-between w-full px-4 py-3 rounded-lg bg-black dark:bg-gray-200", {
                        "bg-black dark:bg-gray-300": pallette === "dark",
                    })}
                    onPress={() => openHandler()}
                    {...rest}
                >
                    <Text className=" text-white">
                        {data.find(item => item.value === selected)?.label}
                    </Text>
                    <MaterialIcons name="expand-more" size={18} color={colorScheme === "dark" ? colors.text[200] : colors.white} />
                </TouchableOpacity>
            </View>
            <BottomSheet
                height={bottomSheetHeight || "40%"}
                ref={bottomSheetRef}
            >
                <View
                    className="flex flex-1"
                    style={{
                        paddingLeft: 24,
                        paddingRight: 24,
                    }}
                >
                    {
                        modalLabel && (
                            <Label style={{ marginBottom: 5 }}>
                                {modalLabel}
                            </Label>
                        )
                    }
                    <FlatList
                        data={data}
                        keyExtractor={(_, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                        style={{
                            flex: 1
                        }}
                        ItemSeparatorComponent={() => (
                            <View className="w-full h-px bg-gray-300 dark:bg-gray-100 opacity-40" />
                        )}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.8}
                                className="flex-row justify-between w-full py-4"
                                onPress={() => {
                                    setSelected(item.value)
                                    closeHandler();
                                }}
                            >
                                <Text className={clsx("text-black dark:text-text-100 text-sm font-semibold", {
                                    "dark:text-white font-bold": selected === item.value
                                })}>
                                    {item.label}
                                </Text>
                                {
                                    selected === item.value && (
                                        <MaterialIcons name="check" size={18} color={colorScheme === "dark" ? colors.text[200] : colors.white} />
                                    )
                                }
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </BottomSheet>
        </>
    )
}