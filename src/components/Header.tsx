import { TouchableOpacity, View, Text, ViewProps } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import colors from "global/colors";

interface HeaderProps extends ViewProps {
    hasBackButton?: boolean;
    title: string;
}

export default function Header({ title, hasBackButton, children, ...props }: HeaderProps) {
    const { goBack } = useNavigation();

    return (
        <View className="flex flex-col items-start justify-center w-full">
            {
                hasBackButton && (
                    <TouchableOpacity
                        className="mb-2"
                        onPress={() => goBack()}
                    >
                        <MaterialIcons
                            name="keyboard-backspace"
                            size={24}
                            color={colors.text.neutral}
                        />
                    </TouchableOpacity>
                )
            }
            <View className="w-full flex-row items-center justify-between" {...props}>
                <Text className="text-text-neutral text-4xl font-titleBold">
                    {title}
                </Text>
                {children}
            </View>
        </View>
    )
}