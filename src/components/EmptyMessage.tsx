import { View, Text, ViewStyle } from 'react-native';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';
import { useColorScheme } from 'nativewind';

interface Props {
    message?: string;
    style?: ViewStyle;
}

export default function EmptyMessage({ message, style }: Props) {
    const { colorScheme } = useColorScheme();

    return (
        <View className='items-center justify-center px-4' style={style}>
            <MaterialIcons
                name='search'
                size={56}
                color={colorScheme === "dark" ? colors.white : colors.black}
            />
            <Text className='text-lg font-bold leading-5 text-center text-black dark:text-white mt-2'>
                Está um pouco vazio por aqui...

            </Text>
            <Text className="text-black dark:text-white text-base text-center leading-5">
                {message || "Que tal agendar um serviço para que ele apareça aqui?"}
            </Text>
        </View>
    )
}