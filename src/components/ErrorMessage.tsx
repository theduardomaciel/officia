import { View, Text, ScrollView, Alert } from 'react-native';

import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

interface Props {
    message: string;
    onPress: () => void;
}

export default function ErrorMessage({ message, onPress }: Props) {
    return (
        <View className='items-center justify-center flex-1'>
            <Text className="text-zinc-400 text-xl font-bold text-center">
                {message}
            </Text>
            <MaterialCommunityIcons
                onPress={onPress}
                name='reload'
                size={32}
                color={colors.zinc[400]}
            />
        </View>
    )
}