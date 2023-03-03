import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Container, { BusinessScrollView } from 'components/Container';
import Header from 'components/Header';

import { useAuth } from 'context/AuthContext';
import { SubSectionWrapper } from 'components/ScheduleForm/SubSectionWrapper';
import { ActionButton } from 'components/Button';
import Modal from 'components/Modal';

export default function Settings() {
    const { signOut } = useAuth();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);

    return (
        <Container>
            <Header title='Configurações' returnButton />
            <BusinessScrollView>
                <SubSectionWrapper header={{ title: "Zona de Perigo" }} preset='smallMargin'>
                    <ActionButton
                        onPress={() => setIsDeleteModalVisible(true)}
                        /* icon="exit-to-app" */
                        icon="delete"
                        label='Excluir conta'
                        style={{
                            paddingTop: 12.5,
                            paddingBottom: 12.5,
                            backgroundColor: colors.primary.red,
                        }}
                    />
                    <Text className='text-center text-gray-100 text-sm'>
                        {`No momento, todas as informações da sua conta são armazenadas no seu dispositivo, portanto caso você exclua sua conta, não será possível recuperá-la.\nNo futuro, será possível sincronizar suas informações com um servidor, no entanto, isso ainda não é possível.`}
                    </Text>
                </SubSectionWrapper>
            </BusinessScrollView>
            <Modal
                title='Excluir conta'
                isVisible={isDeleteModalVisible}
                icon="delete"
                toggleVisibility={() => setIsDeleteModalVisible(!isDeleteModalVisible)}
                message='Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.'
                buttons={[
                    {
                        label: 'Excluir',
                        onPress: signOut,
                        color: colors.primary.red,
                    }
                ]}
                cancelButton
            />
        </Container>
    )
}