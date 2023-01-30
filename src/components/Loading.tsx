import { ActivityIndicator, View } from "react-native";

interface Props {
    color?: string;
}

export default function Loading({ color }: Props) {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator color={color ? color : "#7C3AED"} />
        </View>
    )
}