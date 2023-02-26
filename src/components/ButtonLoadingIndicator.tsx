import { ActivityIndicator, View } from "react-native";

export default function ButtonLoadingIndicator() {
    return (
        <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size={"small"} color={"#FFFFFF"} />
        </View>
    )
}