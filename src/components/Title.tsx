import { Text, View, TextProps } from "react-native";

interface Props extends TextProps { }

export default function Title({ children, ...rest }: Props) {
    return (
        <View className="w-full items-center justify-center ">
            <Text className="font-titleBold text-2xl text-black dark:text-white" {...rest}>
                {children}
            </Text>
        </View>
    )
}