import React, { useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container from "components/Container";
import Header from "components/Header";
import BottomSheet from "components/BottomSheet";

export default function CostumersScreen() {
    // Bottom Sheets
    const expandClientAddBottomSheet = useCallback(() => {
        BottomSheet.expand("clientAddBottomSheet");
    }, []);

    const expandClientViewBottomSheet = useCallback(() => {
        BottomSheet.expand("clientViewBottomSheet");
    }, []);

    return (
        <Container>
            <Header title="Clientes" returnButton />
        </Container>
    );
}
