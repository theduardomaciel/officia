import React from "react";
import { View } from "react-native";

import formatWithMask, { MASKS } from 'utils/formatWithMask';

import Input from "components/Input";

import { z } from "zod";
import { Controller, Control } from 'react-hook-form';
import { borderErrorStyle } from "utils/errorBorderStyle";

export interface ClientFormValues {
    name: string;
    contact: string;
    address?: string;
};

export const clientSchema = z.object({
    name: z.string().min(2, { message: 'Insira um nome com pelo menos 2 caracteres.' }).max(40, { message: 'O nome do cliente possui um limite de 40 caracteres.' }),
    contact: z.string().min(15, { message: 'É necessário inserir um número de contato no formato: (DDD) 9 XXXX-XXXX.' }),
    address: z.string().optional()
});

interface Props {
    control: Control<ClientFormValues>;
    errors: any;
}

export default function ClientDataForm({ control, errors }: Props) {

    return (
        <View className="w-full" style={{ rowGap: 20 }}>
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label='Nome'
                        onBlur={onBlur}
                        onChangeText={value => onChange(value)}
                        value={value}
                        style={!!errors.name && borderErrorStyle}
                        spellCheck={false}
                        placeholder='Fulano da Silva'
                        pallette='dark'
                        required
                    />
                )}
                name="name"
            />
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label='Contato'
                        style={!!errors.contact && borderErrorStyle}
                        onBlur={onBlur}
                        onChangeText={value => {
                            const { masked } = formatWithMask({ text: value, mask: MASKS.BRL_PHONE })
                            onChange(masked)
                        }}
                        maxLength={15}
                        dataDetectorTypes='phoneNumber'
                        keyboardType='phone-pad'
                        value={value}
                        pallette='dark'
                        placeholder='(XX) X XXXX-XXXX'
                        required
                    />
                )}
                name="contact"
                rules={{ required: true }}
            />
        </View>
    )
}