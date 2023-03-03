import { TouchableOpacity, View, Text, ViewProps } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

import colors from "global/colors";
import { MaterialIcons } from "@expo/vector-icons";

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