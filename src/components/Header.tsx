import { TouchableOpacity, View, Text, ViewProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import colors from "tailwindcss/colors";

interface HeaderProps extends ViewProps {
    hasBackButton?: boolean;
    title: string;
}

export default function Header({ title, hasBackButton, children, ...props }: HeaderProps) {
    const { goBack } = useNavigation();

    const Title = () => <View className="w-full flex-row items-center justify-between" {...props}>
        <Text className="text-text-neutral text-4xl font-titleBold">
            {title}
        </Text>
        {children}
    </View>

    return (
        <View className="flex flex-col items-center justify-start w-full">
            {
                hasBackButton && (
                    <TouchableOpacity onPress={() => goBack()}>
                        <Feather name="arrow-left" size={24} color={colors.gray[700]} />
                    </TouchableOpacity>
                )
            }
            <Title />
        </View>
    )
}