import { View, Text, ViewStyle } from 'react-native';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

interface Props {
    message?: string;
    style?: ViewStyle;
}

export default function EmptyMessage({ message, style }: Props) {
    return (
        <View className='items-center justify-center px-4' style={style}>
            <MaterialIcons
                name='search'
                size={56}
                color={colors.text.neutral}
            />
            <Text className='text-lg font-bold leading-5 text-center text-text-neutral mt-2'>
                Está um pouco vazio por aqui...

            </Text>
            <Text className="text-text-neutral text-base text-center leading-5">
                {message || "Que tal agendar um serviço para que ele apareça aqui?"}
            </Text>
        </View>
    )
}