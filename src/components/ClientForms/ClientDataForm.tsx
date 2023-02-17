import React from "react";
import { View, ViewStyle } from "react-native";
import { Controller, Control } from 'react-hook-form';

import colors from "global/colors";
import formatWithMask from 'utils/formatWithMask';

import Input from "components/Input";
import { z } from "zod";

const borderErrorStyle = {
    borderColor: colors.primary.red,
    borderWidth: 1,
    borderTopColor: colors.primary.red,
    borderBottomColor: colors.primary.red,
} as ViewStyle;

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

const PHONE_MASK = ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

export default function ClientDataForm({ control, errors }: Props) {
    return (
        <View className="w-full gap-y-4">
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
            <View>
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label='Contato'
                            style={!!errors.contact && borderErrorStyle}
                            onBlur={onBlur}
                            onChangeText={value => {
                                const { masked } = formatWithMask({ text: value, mask: PHONE_MASK })
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
            <View>
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label='Endereço'
                            onBlur={onBlur}
                            onChangeText={value => onChange(value)}
                            value={value}
                            spellCheck={false}
                            maxLength={80}
                            pallette='dark'
                            placeholder=''
                        />
                    )}
                    name="address"
                    rules={{ required: false }}
                />
            </View>
        </View>
    )
}