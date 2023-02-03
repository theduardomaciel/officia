import { Dispatch, SetStateAction, useRef } from "react";
import { Animated, View, Text } from "react-native";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacity } from "react-native-gesture-handler";

import type { SubService } from "types/service";

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';
import clsx from "clsx";

const categories = {
    hydraulic: {
        icon: "plumbing",
        name: "Hidráulico"
    },
    eletric: {
        icon: "bolt",
        name: "Elétrico"
    },
    various: {
        icon: "build",
        name: "Várias categorias"
    }
}

const Category = ({ category }: { category: 'hydraulic' | 'eletric' | 'various' }) => (
    <>
        <MaterialIcons name={categories[category].icon as unknown as any} size={12} color={colors.white} style={{ marginRight: 5 }} />
        <Text className='font-semibold text-black dark:text-white text-xs mr-1'>
            {categories[category].name}
        </Text>
    </>
)

export const ServicePreviewStatic = ({ subService }: { subService: SubService }) => {
    return (
        <View className='flex-row items-center justify-between w-full dark:bg-gray-200 rounded-sm p-3'>
            <View className='flex-1 flex-col items-start justify-center gap-y-2 mr-3'>
                <Text className='font-bold text-[15px] leading-none text-white'>
                    {subService.description}
                </Text>
                <View className='flex-row'>
                    {
                        subService.types && (
                            <Category category={subService.types?.length > 1 ? "various" : subService.types[0]} />
                        )
                    }
                    <Text className='text-white text-xs'>
                        x{subService.amount}
                    </Text>
                </View>
            </View>
            <View className='px-3 py-1 bg-primary-green rounded-full'>
                <Text className='font-bold text-xs text-white'>
                    R$ {subService.price/* .toFixed(2) */}
                </Text>
            </View>
        </View>
    )
}

export default function ServicePreview({ subService, setSubServices }: { subService: SubService, setSubServices: Dispatch<SetStateAction<SubService[]>> }) {
    const swipeableRef = useRef<any>(null);

    function deletePreService() {
        if (swipeableRef.current) {
            swipeableRef.current.close();
        }
        console.log('deletePreService')
        setSubServices((prev) => prev.filter((s) => s.id !== subService.id));
    }

    return (
        <Swipeable
            ref={swipeableRef}
            friction={1.25}
            leftThreshold={10}
            rightThreshold={10}
            enableTrackpadTwoFingerGesture
            renderRightActions={(progress, dragX) => (
                <DeleteAction
                    onPress={deletePreService}
                    progress={progress}
                    dragX={dragX}
                    direction="right"
                />
            )}
            renderLeftActions={(progress, dragX) => (
                <DeleteAction
                    onPress={deletePreService}
                    progress={progress}
                    dragX={dragX}
                    direction="left"
                />
            )}
        >
            <ServicePreviewStatic subService={subService} />
        </Swipeable>
    )
}

const DeleteAction = ({ onPress, dragX, direction }: { onPress: () => void, progress: any, dragX: any, direction: "left" | "right" }) => {
    const scale = dragX.interpolate({
        inputRange: [0, 50, 100, 101],
        outputRange: [-20, 0, 0, 1],
    });
    return (
        <TouchableOpacity
            className={clsx("flex-row items-center flex-1 w-16 justify-center  bg-primary-red", {
                "rounded-tr-sm rounded-br-sm": direction === "right",
                "rounded-tl-sm rounded-bl-sm": direction === "left",
            })}
            onPress={onPress}
        >
            <MaterialIcons name="delete" size={24} color={colors.white} />
            <Animated.View style={{ transform: [{ scale }] }} />
        </TouchableOpacity>
    );
};