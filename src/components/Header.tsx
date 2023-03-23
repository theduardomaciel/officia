import { TouchableOpacity, View, Text, ViewProps } from "react-native";
import Animated, { EntryAnimationsValues, ExitAnimationsValues, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
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

    const TEXTS = businessData ? [
        `Tenha uma ótimo dia!`,
        `${getGreeting()}, ${businessData?.fantasyName?.split(" ")[0]}.`,
        `Seu período de avaliação acaba em\n5 dias.`,
        ` `
    ] : ['Tenha um ótimo dia!']
    const [currentText, setCurrentText] = useState(TEXTS[0]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: isVisible.value,
        transform: [
            { translateY: isVisible.value * 100 - 100 },
        ],
    }));

    useEffect(() => {
        setInterval(() => {
            const filteredArray = TEXTS.filter(text => text !== currentText);
            const newText = filteredArray[Math.floor(Math.random() * filteredArray.length)]
            if (newText) {
                setCurrentText(newText);
            } else {
                setCurrentText(TEXTS[0]);
            }
            console.log(newText)
            isVisible.value = withSpring(1, ANIM_PROPS, () => {
                console.log("Terminou de animar a entrada")
                isVisible.value = withDelay(14000, withSpring(0, ANIM_PROPS, () => {
                    console.log("Terminou de animar a saida")
                    runOnJS(setCurrentText)(newText);
                }))
            });
        }, 15000);
    }, [])

    return (
        <View className="flex flex-row items-center justify-between w-full">
            <View className="flex flex-1 flex-row items-center justify-start mr-2" style={{ columnGap: 10 }}>
                <TouchableOpacity
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200"
                    activeOpacity={0.8}
                    onPress={() => navigation.openDrawer()}
                >
                    <MaterialIcons name="person" size={24} color={colors.text[100]} />
                </TouchableOpacity>
                {businessData && (
                    <Animated.Text style={animatedStyle} className="flex flex-1 text-sm bg-red-500 text-text-100 w-full whitespace-pre-line">
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
        </View>
    )
}