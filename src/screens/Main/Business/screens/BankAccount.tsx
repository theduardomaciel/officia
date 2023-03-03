import React from 'react';
import { View } from "react-native";

// Visuals
import colors from 'global/colors';
import PixIcon from "assets/icons/pix.svg";

// Components
import { BusinessScrollView } from 'components/Container';
import Dropdown from 'components/Dropdown';
import Input from 'components/Input';
import Toast from 'components/Toast';

import BusinessLayout, { ChangesObserver } from '../Layout';

// Form
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import formatWithMask, { MASKS } from 'utils/formatWithMask';
import { borderErrorStyle } from 'components/ClientForms/ClientDataForm';
import { updateData } from 'screens/Main/Business';

// Type
import { bankAccountScheme, BankAccountSchemeType, BusinessData } from 'screens/Main/Business/@types';
import { SubSectionWrapper } from 'components/ScheduleForm/SubSectionWrapper';


type PIX_TYPE = 'unselected' | 'juridicalPerson' | 'email' | 'phone' | 'random';

export default function BankAccountScreen({ route, navigation }: any) {
    const { businessData: data }: { businessData: BusinessData } = route.params;
    const [businessData, setBusinessData] = React.useState<BusinessData>(data);
    const screenData = {
        account: businessData.account,
        agency: businessData.agency,
        accountHolder: businessData.accountHolder,
        pixKey: businessData.pixKey,
        bankAccountType: businessData.bankAccountType,
    } as BankAccountSchemeType;

    const [bank, setBank] = React.useState(businessData.bank ?? "unselected");
    const [accountType, setAccountType] = React.useState(businessData.bankAccountType ?? "unselected");
    const [pixType, setPixType] = React.useState<PIX_TYPE>(businessData.bankPixType as unknown as PIX_TYPE ?? "unselected");

    const [hasDifferences, setHasDifferences] = React.useState(false);

    const { handleSubmit, control, formState: { errors }, getValues, watch, setValue } = useForm<BankAccountSchemeType>({
        mode: 'onSubmit',
        defaultValues: {
            account: "",
            agency: "",
            accountHolder: businessData.juridicalPerson ?? "",
            pixKey: "",
        },
        values: businessData ? screenData : undefined,
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        },
        resolver: zodResolver(bankAccountScheme)
    });

    const onError: SubmitErrorHandler<BankAccountSchemeType> = (errors, e) => {
        console.log(errors)
        //setFocus(Object.keys(errors)[0] as unknown as keyof BasicInfoSchemeType)
        Toast.show({
            preset: "error",
            title: "Algo está errado com os dados inseridos.",
            message: Object.values(errors).map(error => error.message).join('\n')
        })
    }

    const submitData = handleSubmit(async (data) => {
        setHasDifferences(false)
        const result = await updateData({ ...getValues(), bankPixType: pixType, bankAccountType: accountType, bank }, businessData);
        if (result) {
            setBusinessData(result);
        }
    }, onError);

    return (
        <BusinessLayout
            headerProps={{
                title: 'Dados Bancários',
            }}
            hasDifferences={hasDifferences}
            submitData={submitData}
        >
            <ChangesObserver
                currentData={screenData}
                setHasDifferences={setHasDifferences}
                watch={watch}
            >
                <BusinessScrollView>
                    <Dropdown
                        label='Banco'
                        bottomSheetLabel='Selecione um banco'
                        selected={bank}
                        setSelected={(value: string) => {
                            setBank(value)
                            setHasDifferences(true)
                        }}
                        overDragAmount={60}
                        data={[
                            { label: "Nenhum banco", value: "unselected" },
                            { label: "Banco do Brasil", value: "Banco do Brasil" },
                            { label: "Bradesco", value: "Bradesco" },
                            { label: "Caixa Econômica Federal", value: "Caixa Econômica Federal" },
                            { label: "Itaú", value: "Itaú" },
                            { label: "Santander", value: "Santander" },
                        ]}
                    />
                    {
                        bank !== "unselected" && (
                            <>
                                <View className='flex-row w-full items-center justify-between'>
                                    <View className='flex-1 mr-3'>
                                        <Controller
                                            control={control}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <Input
                                                    label='Agência'
                                                    value={value}
                                                    keyboardType='numeric'
                                                    onBlur={onBlur}
                                                    onChangeText={value => {
                                                        const { masked } = formatWithMask({ text: value, mask: MASKS.BRL_AGENCY })
                                                        onChange(masked)
                                                    }}
                                                    style={!!errors.agency && borderErrorStyle}
                                                    maxLength={6}
                                                />
                                            )}
                                            name="agency"
                                        />
                                    </View>
                                    <View className='flex-1'>
                                        <Controller
                                            control={control}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <Input
                                                    label='Conta'
                                                    value={value}
                                                    onBlur={onBlur}
                                                    keyboardType='numeric'
                                                    onChangeText={value => onChange(value)}
                                                    style={!!errors.account && borderErrorStyle}
                                                    maxLength={7}
                                                />
                                            )}
                                            name="account"
                                        />
                                    </View>
                                </View>
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <Input
                                            label='CPF/CNPJ do titular da conta'
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={value => {
                                                const { masked } = formatWithMask({ text: value, mask: value.length <= 14 ? MASKS.BRL_CPF : MASKS.BRL_CNPJ })
                                                onChange(masked)
                                            }}
                                            maxLength={18}
                                            keyboardType='numeric'
                                            style={!!errors.accountHolder && borderErrorStyle}
                                        />
                                    )}
                                    name="accountHolder"
                                    rules={{ maxLength: 50 }}
                                />
                                <Dropdown
                                    label='Tipo de Conta'
                                    bottomSheetLabel='Selecione um tipo de conta'
                                    selected={accountType}
                                    setSelected={(value: string) => {
                                        setAccountType(value)
                                        setHasDifferences(true)
                                    }}
                                    bottomSheetHeight={"27.5%"}
                                    overDragAmount={60}
                                    data={[
                                        { label: "Nenhum tipo", value: "unselected" },
                                        { label: "Conta Investimento", value: "conta_investimento" },
                                        { label: "Conta Corrente", value: "conta_corrente" },
                                        { label: "Conta Poupança", value: "conta_poupanca" },
                                    ]}
                                />
                            </>
                        )
                    }
                    <View className='w-full flex items-center justify-center'>
                        <View className='w-1/2 border border-dashed border-b-gray-100' />
                    </View>
                    <SubSectionWrapper header={{ title: "Chave PIX", customIcon: PixIcon as any }}>
                        <View className='w-full'>
                            <Dropdown
                                label='Tipo'
                                bottomSheetLabel='Selecione o tipo da sua chave PIX'
                                selected={pixType as unknown as string}
                                setSelected={(value: string) => {
                                    setPixType(value as unknown as PIX_TYPE)
                                    setValue("pixKey", "")
                                    setHasDifferences(true)
                                }}
                                bottomSheetHeight={"40%"}
                                overDragAmount={60}
                                data={[
                                    { label: "Nenhum tipo", value: "unselected" },
                                    { label: "CPF ou CNPJ", value: "juridicalPerson" },
                                    { label: "E-mail", value: "email" },
                                    { label: "Número de telefone", value: "phone" },
                                    { label: "Aleatória", value: "random" }
                                ]}
                            />
                        </View>
                        {
                            pixType !== "unselected" && (
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <Input
                                            label='Chave'
                                            value={value}
                                            onBlur={onBlur}
                                            autoCapitalize="none"
                                            onChangeText={value => {
                                                const MASK = pixType === "juridicalPerson" ? (value.length <= 14 ? MASKS.BRL_CPF : MASKS.BRL_CNPJ) : pixType === "phone" ? MASKS.BRL_PHONE : undefined;
                                                if (MASK) {
                                                    const { masked } = formatWithMask({ text: value, mask: MASK })
                                                    onChange(masked)
                                                } else {
                                                    onChange(value)
                                                }
                                            }}
                                            keyboardType={pixType === "juridicalPerson" ? "numeric" : pixType == "phone" ? "number-pad" : pixType === "email" ? "email-address" : "default"}
                                            maxLength={pixType === "juridicalPerson" ? 18 : pixType === "phone" ? 15 : 100}
                                            style={!!errors.pixKey && borderErrorStyle}
                                        />
                                    )}
                                    name="pixKey"
                                    rules={{ maxLength: 100 }}
                                />
                            )
                        }
                    </SubSectionWrapper>
                </BusinessScrollView>
            </ChangesObserver>
        </BusinessLayout>
    )
}