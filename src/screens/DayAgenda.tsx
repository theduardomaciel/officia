import React, { useState } from 'react';
import { View, Text, FlatList } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Container from 'components/Container';
import Header from 'components/Header';

import { Empty, Loading } from 'components/StatusMessage';
import { EnhancedServicePreview } from './Main/Home';

// Database
import { database } from 'database/index.native';
import { Q } from '@nozbe/watermelondb';

import type { ServiceModel } from 'database/models/serviceModel';

export default function DayAgenda({ route, navigation }: any) {
    const { dateString } = route.params as { dateString: string };
    const { colorScheme } = useColorScheme();

    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })

    const [services, setServices] = useState<ServiceModel[] | undefined>(undefined);

    async function fetchService() {
        const services = await database
            .get<ServiceModel>("services")
            .query(Q.where("date", Q.gte(new Date(dateString).getTime())))
            .fetch();

        setTimeout(() => {
            setServices(services.filter(service => service.date.getDate() === new Date(dateString).getDate()));
        }, 500);
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchService();
        }, [dateString])
    );

    return (
        <Container>
            <View>
                <Header
                    title='Serviços agendados'
                    /* upperChildren={services && services?.length > 2 && <Text>{services.length} serviços</Text>} */
                    returnButton
                />
            </View>
            <View className='flex-row gap-x-2 items-center justify-start'>
                <MaterialIcons name='calendar-today' size={18} color={colorScheme === "dark" ? colors.text[100] : colors.black} />
                <Text className='text-sm text-black dark:text-text-100'>{dateFormatted}</Text>
            </View>
            {
                services !== undefined ? (
                    <FlatList
                        contentContainerStyle={{ height: "100%" }}
                        data={services}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <EnhancedServicePreview
                                key={item.id}
                                service={item}
                                additionalInfo="time"
                                onPress={() => navigation.navigate('service', { serviceId: item.id })}
                            />
                        )}
                        ListEmptyComponent={() => (
                            <Empty style={{ paddingBottom: 150 }} />
                        )}
                    />
                ) : (
                    <Loading />
                )
            }
        </Container>
    )
}