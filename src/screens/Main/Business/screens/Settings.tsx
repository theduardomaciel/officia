import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Container, { BusinessScrollView } from 'components/Container';
import Header from 'components/Header';

import { useAuth } from 'context/AuthContext';

export default function Settings() {
    const { signOut } = useAuth();

    return (
        <Container>
            <Header title='Configurações' returnButton />
            <BusinessScrollView>
                <TouchableOpacity
                    activeOpacity={0.7}
                    className='w-full flex-row items-center justify-start bg-gray-200 p-3 rounded'
                    onPress={signOut}
                    style={{ columnGap: 10 }}
                >
                    <MaterialIcons name='exit-to-app' size={16} color={colors.primary.red} />
                    <Text className='text-sm text-primary-red'>
                        Excluir conta e sair
                    </Text>
                </TouchableOpacity>
            </BusinessScrollView>
        </Container>
    )
}