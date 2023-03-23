import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Container from 'components/Container';
import Header from 'components/Header';


export default function ClientsScreen() {
    return (
        <Container>
            <Header title='Clientes' returnButton />

        </Container>
    )
}