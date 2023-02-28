import React from 'react';
import { View, Text, ScrollView } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Container, { BusinessScrollView } from 'components/Container';
import Header from 'components/Header';

export default function SocialMedia() {
    return (
        <Container>
            <Header title='Redes Sociais' returnButton />
            <BusinessScrollView>

            </BusinessScrollView>
        </Container>
    )
}