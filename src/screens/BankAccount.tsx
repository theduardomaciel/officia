import React, { useCallback } from 'react';
import { View, Text, ScrollView } from "react-native";
import { useFocusEffect, useRoute } from '@react-navigation/native';

import colors from 'global/colors';

import PixIcon from "assets/icons/pix.svg";

import Header from 'components/Header';
import Dropdown from 'components/Dropdown';
import Input from 'components/Input';

export default function BankAccount() {
    const [selected, setSelected] = React.useState("Nenhum banco");

    return (
        <View className='flex-1 min-h-full px-6 pt-12 gap-y-5'>
            <View>
                <Header title='Dados Bancários' hasBackButton />
            </View>
            <ScrollView contentContainerStyle={{ height: "100%" }}>
                <View className='flex-col gap-y-5'>
                    <View>
                        <Dropdown
                            label='Banco'
                            modalLabel='Selecione um banco'
                            selected={selected}
                            setSelected={setSelected}
                            data={["Nenhum banco", "Banco do Brasil", "Bradesco", "Caixa Econômica Federal", "Itaú", "Santander"]}
                        />
                    </View>
                    <View className='flex-row w-full items-center justify-between'>
                        <View className='flex-1 mr-3'>
                            <Input label='Agência' />
                        </View>
                        <View className='flex-1'>
                            <Input label='Conta' />
                        </View>
                    </View>
                    <View>
                        <Input label='CPF/CNPJ do titular da conta' />
                    </View>
                    <View>
                        <Input label='Tipo de Conta' />
                    </View>
                    <View className='w-full flex items-center justify-center'>
                        <View className='w-1/2 border border-dashed border-b-gray-100' />
                    </View>
                    <View>
                        <Input label='Chave PIX' icon={<PixIcon />} />
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}