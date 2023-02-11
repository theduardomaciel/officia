import colors from "global/colors";
import { ActivityIndicator, View, Text } from "react-native";

interface Props {
    color?: string;
    message?: string;
}

export default function Loading({ color, message }: Props) {
    return (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={color ? color : colors.primary.green} size="large" />
            <Text className="mt-3 mb-20 max-w-[75vw] text-white font-medium text-center text-lg">
                {message ? message : "Carregando..."}
            </Text>
        </View>
    )
}