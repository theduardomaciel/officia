import { Text, TextProps } from "react-native";

interface Props extends TextProps { }

export default function Label({ children, ...rest }: Props) {
    return (
        <Text className="font-semibold text-[15px] text-black dark:text-text-100" {...rest}>
            {children}
        </Text>
    )
}