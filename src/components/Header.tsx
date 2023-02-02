import { TouchableOpacity, View, Text, ViewProps } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

import colors from "global/colors";
import { MaterialIcons } from "@expo/vector-icons";

interface HeaderProps extends ViewProps {
    returnButton?: boolean | (() => void);
    cancelButton?: boolean | (() => void);
    title: string;
}

export default function Header({ title, cancelButton, returnButton, children, ...props }: HeaderProps) {
    const { colorScheme } = useColorScheme();
    const { goBack } = useNavigation();

    return (
        <View className="flex flex-col items-start justify-center w-full">
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
                    </View>
                )
            }
            <View className="w-full flex-row items-center justify-between" {...props}>
                <Text className="text-text_light-neutral dark:text-white text-4xl font-titleBold">
                    {title}
                </Text>
                {children}
            </View>
        </View>
    )
}