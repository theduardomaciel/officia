import { TouchableOpacity, View, Text, ViewProps } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import clsx from "clsx";
import { Image } from "expo-image";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Types
import { BusinessData } from "screens/Main/Business/@types";
import { useEffect, useState } from "react";

interface HeaderProps extends ViewProps {
    returnButton?: boolean | (() => void);
    cancelButton?: boolean | (() => void);
    title: string;
    description?: string;
    upperChildren?: React.ReactNode;
    aboveTitle?: React.ReactNode;
    bellowTitle?: React.ReactNode;
}

export default function Header({ title, description, cancelButton, returnButton, children, upperChildren, aboveTitle, bellowTitle, ...props }: HeaderProps) {
    const { colorScheme } = useColorScheme();
    const { goBack } = useNavigation();

    return (
        <View className="flex flex-col items-start justify-center w-full gap-y-1">
            {
                (returnButton || cancelButton) && (
                    <View className="flex-row w-full items-center justify-between">
                        <TouchableOpacity
                            className="mb-2"
                            disabled={!returnButton}
                            style={{
                                opacity: returnButton ? 1 : 0
                            }}
                            onPress={typeof returnButton === "function" ? returnButton : () => {
                                goBack();
                            }}
                        >
                            <MaterialIcons
                                name="keyboard-backspace"
                                size={24}
                                color={colorScheme === "dark" ? colors.white : colors.black}
                            />
                        </TouchableOpacity>
                        {
                            cancelButton && (
                                <TouchableOpacity
                                    className="mb-2"
                                    onPress={typeof returnButton === "function" ? returnButton : () => {
                                        goBack();
                                    }}
                                >
                                    <MaterialIcons
                                        name="close"
                                        size={24}
                                        color={colorScheme === "dark" ? colors.white : colors.black}
                                    />
                                </TouchableOpacity>
                            )
                        }
                        {upperChildren}
                    </View>
                )
            }
            <View className="flex-col w-full gap-y-1">
                {aboveTitle}
                <View className="w-full flex-row items-center justify-between" {...props}>
                    <Text className="text-text_light-neutral dark:text-white text-4xl font-titleBold">
                        {title}
                    </Text>
                    {children}
                </View>
                {
                    description && (
                        <Text className="text-sm leading-4 text-text-200">
                            {description}
                        </Text>
                    )
                }
                {bellowTitle}
            </View>
        </View>
    )
}

interface HeaderProps extends ViewProps {
    returnButton?: boolean | (() => void);
    cancelButton?: boolean | (() => void);
    title: string;
    description?: string;
    upperChildren?: React.ReactNode;
    aboveTitle?: React.ReactNode;
    bellowTitle?: React.ReactNode;
}

interface Props {
    title?: string;
    children?: HeaderProps['children'];
    businessData?: BusinessData;
    navigation: any;
}

function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
        return "Bom dia";
    } else if (hour < 18) {
        return "Boa tarde";
    } else {
        return "Boa noite";
    }
}

const ANIM_PROPS = { damping: 100, stiffness: 1000, mass: 2, overshootClamping: true };

export function TabBarScreenHeader({ title, children, businessData, navigation }: Props) {
    const isVisible = useSharedValue(1);

    const TEXTS = [
        `${getGreeting()}${businessData?.fantasyName ? ", " : ""}${businessData?.fantasyName ? businessData?.fantasyName?.split(" ")[0] : ""}!`,
        `Tenha um ótimo dia!`,
        `Seu período de avaliação acaba em 5 dias.`,
    ];
    const [currentText, setCurrentText] = useState(TEXTS[0]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: isVisible.value,
        transform: [
            { translateY: isVisible.value * 100 - 100 },
        ],
    }));

    useEffect(() => {
        if (!businessData) return;

        console.log("Iniciando ciclo de animações")
        isVisible.value = withRepeat(
            withSequence(
                withDelay(1000, withSpring(1, ANIM_PROPS)),
                withDelay(15000, withSpring(0, ANIM_PROPS, () => {
                    const newIndex = Math.floor(Math.random() * TEXTS.length);
                    console.log(newIndex)
                    runOnJS(setCurrentText)(TEXTS[newIndex])
                })),
            ),
            -1,
            false,
            (finished) => {
                const resultStr = finished
                    ? 'All repeats are completed'
                    : 'withRepeat cancelled';
                console.log(resultStr);
            }
        );
    }, [])

    return (
        <View className="flex flex-row items-center justify-between w-full">
            <View
                className={clsx("flex flex-row items-center justify-start mr-2", {
                    'flex-1': businessData ? true : false,
                })}
                style={{ columnGap: 10 }}
            >
                <TouchableOpacity
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200"
                    activeOpacity={0.8}
                    onPress={() => navigation.openDrawer()}
                >
                    <MaterialIcons name="person" size={24} color={colors.text[100]} />
                </TouchableOpacity>
                {businessData && children && (
                    <Animated.Text
                        style={animatedStyle}
                        className="flex flex-1 text-xs text-text-100 w-full whitespace-pre-line"
                    >
                        {currentText}
                    </Animated.Text>
                )}
            </View>
            {
                title && (
                    <Text className="font-titleBold text-lg text-text-100">
                        {title}
                    </Text>
                )
            }
            {children ? children : <View className="w-10 h-full" />}
            {/* <View className="border-b-[1px] border-b-gray-200 w-screen absolute left-1/2 -bottom-2" style={{ transform: [{ translateX: -100 }] }} /> */}
        </View>
    )
}