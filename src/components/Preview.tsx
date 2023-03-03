import { useRef } from "react";
import { Animated, View, Text } from "react-native";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacity } from "react-native-gesture-handler";

import clsx from "clsx";
import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

import { SubServiceModel } from "database/models/subServiceModel";
import { MaterialModel } from "database/models/materialModel";

// Tyoes
import type { Category } from "screens/Main/Business/@types";

const Category = ({ category }: { category: Category }) => (
    <>
        <MaterialIcons name={category.icon as unknown as any} size={12} color={colors.white} style={{ marginRight: 5 }} />
        <Text className='font-semibold text-black dark:text-white text-xs mr-1'>
            {category.name}
        </Text>
    </>
)

interface PreviewStatic {
    subService?: SubServiceModel;
    material?: MaterialModel;
    palette?: "light";
    hasBorder?: boolean;
    padding?: "small";
}

export const PreviewStatic = ({ subService, material, palette, hasBorder, padding }: PreviewStatic) => {
    if (!subService && !material) return null;

    return (
        <View className={clsx('flex-row items-center justify-between w-full dark:bg-gray-300 rounded-sm p-3', {
            'bg-gray-200': palette === "light",
            'py-2': padding === "small",
            'border border-gray-100': hasBorder
        })}>
            <View className='flex-1 flex-col items-start justify-center gap-y-2 mr-3'>
                <Text className='font-bold text-[15px] leading-none text-white'>
                    {subService?.description || material?.name}
                </Text>
                <View className='flex-row'>
                    {
                        subService?.types && subService.types.length > 0 && (
                            <Category category={subService.types?.length > 1 ?
                                { icon: "build", name: "Várias categorias" } as Category :
                                subService.types[0]}
                            />
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

interface PreviewProps {
    material?: MaterialModel;
    subService?: SubServiceModel;
    onDelete: () => void;
    onEdit: () => void;
}

export function Preview({ material, subService, onDelete, onEdit }: PreviewProps) {
    const swipeableRef = useRef<any>(null);

    function deletePreview() {
        if (swipeableRef.current) {
            swipeableRef.current.close();
        }
        onDelete();
        console.log('deletePreService')
    }

    function editPreview() {
        if (swipeableRef.current) {
            swipeableRef.current.close();
        }
        onEdit();
        console.log('editPreService')
    }

    return (
        <Swipeable
            ref={swipeableRef}
            friction={1.25}
            leftThreshold={10}
            rightThreshold={10}
            enableTrackpadTwoFingerGesture
            renderRightActions={(progress, dragX) => (
                <Action
                    onPress={deletePreview}
                    progress={progress}
                    dragX={dragX}
                    direction="right"
                    type="delete"
                />
            )}
            renderLeftActions={(progress, dragX) => (
                <Action
                    onPress={editPreview}
                    progress={progress}
                    dragX={dragX}
                    direction="left"
                    type="edit"
                />
            )}
        >
            <PreviewStatic material={material} subService={subService} />
        </Swipeable>
    )
}

interface Action {
    onPress: () => void;
    progress: any;
    dragX: any;
    direction: "left" | "right";
    type: "delete" | "edit";
}

const Action = ({ onPress, dragX, direction, type }: Action) => {
    const scale = dragX.interpolate({
        inputRange: [0, 50, 100, 101],
        outputRange: [-20, 0, 0, 1],
    });
    return (
        <TouchableOpacity
            className={clsx("flex-row items-center flex-1 w-16 justify-center", {
                "rounded-tr-sm rounded-br-sm": direction === "right",
                "rounded-tl-sm rounded-bl-sm": direction === "left",
                "bg-primary-red": type === "delete",
                "bg-primary-blue": type === "edit",
            })}
            onPress={onPress}
        >
            <MaterialIcons name={type === "delete" ? "delete" : "edit"} size={24} color={colors.white} />
            <Animated.View style={{ transform: [{ scale }] }} />
        </TouchableOpacity>
    );
};