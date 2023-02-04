import { Dispatch, SetStateAction, useRef } from "react";
import { Animated, View, Text } from "react-native";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacity } from "react-native-gesture-handler";

import type { Material, SubService } from "types/service";

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

export const PreviewStatic = ({ subService, material }: { subService?: SubService, material?: Material }) => {
    if (!subService && !material) return null;

    return (
        <View className='flex-row items-center justify-between w-full dark:bg-gray-300 rounded-sm p-3'>
            <View className='flex-1 flex-col items-start justify-center gap-y-2 mr-3'>
                <Text className='font-bold text-[15px] leading-none text-white'>
                    {subService?.description || material?.name}
                </Text>
                <View className='flex-row'>
                    {
                        subService && subService.types && (
                            <Category category={subService.types?.length > 1 ? "various" : subService.types[0]} />
                        )
                    }
                    {
                        material && <Text className="font-semibold text-black dark:text-white text-xs mr-1">
                            {`${material?.availability === true ? "Fornecido como cortesia" : "Custo do cliente"}`}
                        </Text>
                    }
                    <Text className='text-white text-xs'>
                        (x{subService?.amount || material?.amount})
                    </Text>
                </View>
            </View>
            <View className={clsx('px-3 py-1 rounded-full', {
                'bg-primary-green': subService?.price || material?.price,
                'bg-primary-red': material?.availability === true
            })}>
                <Text className='font-bold text-xs text-white'>
                    {material?.availability === true ? "-" : ""}R$ {subService?.price || (material?.price)}
                </Text>
            </View>
        </View>
    )
}

interface SubServicePreviewProps {
    subService: SubService;
    setSubServices: Dispatch<SetStateAction<SubService[]>>;
}

export function ServicePreview({ subService, setSubServices }: SubServicePreviewProps) {
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
            <PreviewStatic subService={subService} />
        </Swipeable>
    )
}

interface MaterialPreviewProps {
    material: Material;
    setMaterials: Dispatch<SetStateAction<Material[]>>;
}

export function MaterialPreview({ material, setMaterials }: MaterialPreviewProps) {
    const swipeableRef = useRef<any>(null);

    function deletePreService() {
        if (swipeableRef.current) {
            swipeableRef.current.close();
        }
        console.log('deletePreService')
        setMaterials((prev) => prev.filter((m) => m.id !== material.id));
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
            <PreviewStatic material={material} />
        </Swipeable>
    )
}

export const DeleteAction = ({ onPress, dragX, direction }: { onPress: () => void, progress: any, dragX: any, direction: "left" | "right" }) => {
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