import { manipulateAsync } from 'expo-image-manipulator';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Keyboard, Platform, Text, TouchableWithoutFeedback, View } from "react-native";
import { useSharedValue, withSpring } from 'react-native-reanimated';

import colors from 'global/colors';

import FileViewer from 'react-native-file-viewer';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

// Components
import { Checkbox } from 'components/Checkbox';
import Header from 'components/Header';
import Loading from 'components/Loading';
import Modal from 'components/Modal';
import { PreviewStatic } from 'components/Preview';
import SectionBottomSheet from 'components/ScheduleForm/SectionBottomSheet';
import { daysToMonthsOrYears, PaymentMethodsReview, ReviewSection, WarrantyReview } from 'components/ScheduleForm/Sections/Section2';
import { NextButton, SubSectionWrapper } from 'components/ScheduleForm/SubSectionWrapper';
import { SectionsNavigator } from 'components/SectionsNavigator';

// Database
import { database } from 'database/index.native';

// Types
import type { ClientModel } from 'database/models/clientModel';
import type { MaterialModel } from 'database/models/materialModel';
import type { ServiceModel } from 'database/models/serviceModel';
import type { SubServiceModel } from 'database/models/subServiceModel';

import type { BottomSheetActions } from 'components/BottomSheet';
import { tags } from 'global/tags';
import type { BusinessData } from './Main/Business';

const getPaymentCondition = (service: ServiceModel) => service.installmentsAmount ? `${service.installmentsAmount} parcelas`
    : service.agreementInitialValue ? `${service.splitMethod === "percentage" ? `${service.agreementInitialValue}%` : `R% ${service.agreementInitialValue}`} antecipado e o valor restante ${!service.installmentsAmount ? "após a conclusão do serviço" : `dividido em ${service.installmentsAmount} parcelas`}`
        : "À vista";


export default function Invoice({ route }: any) {
    const [modalProps, setModalProps] = useState<{
        status: "success" | 'error' | false,
        data?: string,
    }>({ status: false });

    const selectedSectionId = useSharedValue(0);

    const section0BottomSheetRef = useRef<BottomSheetActions>(null);
    const section1BottomSheetRef = useRef<BottomSheetActions>(null);

    const sections = [section0BottomSheetRef, section1BottomSheetRef];

    const updateHandler = useCallback((id: number) => {
        console.log(id, "id")
        if (sections[selectedSectionId.value] && sections[id]) {
            sections[selectedSectionId.value].current?.close();
            selectedSectionId.value = withSpring(id, {
                damping: 100,
                stiffness: 400
            });
            sections[id].current?.expand();
        }
    }, [])

    const [invoiceService, setInvoiceService] = useState<{
        service: ServiceModel,
        subServices: SubServiceModel[],
        materials: MaterialModel[],
        client: ClientModel
    } | undefined>(undefined);

    async function setInitialState(id: string) {
        try {
            const service = await database
                .get<ServiceModel>('services')
                .find(id) as any;

            if (service) {
                const subServices = await service.subServices.fetch();
                const materials = await service.materials.fetch();
                const client = await service.client.fetch() ?? undefined;
                console.log(client, "cliente")

                if (subServices && materials) {
                    setInvoiceService({
                        service,
                        subServices,
                        materials,
                        client
                    })
                    section0BottomSheetRef.current?.expand();
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (route.params?.serviceId) {
            setInitialState(route.params?.serviceId)
        }

        const backAction = () => {
            if (selectedSectionId.value !== 0) {
                updateHandler(selectedSectionId.value - 1);
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, [])

    async function requestExternalWritePermission() {
        try {
            createPDF();
            /* const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                createPDF();
            } else {
                setModalProps({
                    status: 'error',
                    data: 'Você precisa permitir o acesso ao armazenamento externo para gerar o documento.'
                })
            } */
        } catch (err) {
            console.warn(err);
            setModalProps({
                status: 'error',
                data: 'Um erro desconhecido nos impediu de gerar o documento.\nCaso o problema persista, entre em contato conosco.'
            })
        }
    }

    const onSubmit = async () => {
        if (Platform.OS === 'android') {
            requestExternalWritePermission();
        } else {
            createPDF();
        }
    }

    async function createPDF() {
        const data = await database.localStorage.get('businessData') as BusinessData;

        if (!data || (data && (!data.phone || data.email === undefined || !data.address || !data.fantasyName || !data.juridicalPerson || !data.postalCode))) {
            const dataMissing = !data ? "Dados da empresa" : !data.phone ? "Telefone" : data.email === undefined ? "Email" : !data.address ? "Endereço" : !data.fantasyName ? "Nome fantasia" : !data.juridicalPerson ? "Razão social" : !data.postalCode ? "CEP" : "Dados da empresa";
            setModalProps({
                status: 'error',
                data: `Você precisa preencher os dados da sua empresa (${dataMissing.toLowerCase()}) antes de gerar o documento.`
            })
            return;
        }

        if (!invoiceService || !invoiceService?.service) {
            setModalProps({
                status: 'error',
                data: 'Um erro desconhecido nos impediu de gerar o documento.'
            })
            return;
        }

        const PDFString = await getPDFString(data, invoiceService?.service!, invoiceService?.subServices, invoiceService?.materials, invoiceService?.client);

        const options = {
            html: PDFString,
            fileName: invoiceService?.service.name,
            directory: 'Documents',
            base64: true
        };

        const file = await RNHTMLtoPDF.convert(options)
        setModalProps({
            status: "success",
            data: file.filePath
        })
    }

    const openFile = (filepath: string) => {
        FileViewer.open(filepath) // absolute-path-to-my-local-file.
            .then(() => {
                // success
            })
            .catch(error => {
                setModalProps({
                    status: 'error',
                    data: 'Um erro desconhecido nos impediu de abrir o documento.'
                })
            });
    }

    const subServicesTotal = invoiceService?.subServices.reduce((acc, subService) => acc + subService.price * subService.amount, 0) ?? 0;
    const materialsTotal = invoiceService?.materials.reduce((acc, material) => acc + material.price * material.amount, 0) ?? 0;
    const materialsProfitMargin = invoiceService?.materials.reduce((acc, material) => acc + (material?.profitMargin ? (material.price * (material.profitMargin / 100) * material.amount) : 0), 0) ?? 0;

    const materialsWithProfitMargin = invoiceService?.materials.filter(material => material.profitMargin && material.profitMargin > 0);

    return (
        <>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className='flex-1 min-h-full px-6 pt-12 gap-y-5'>
                    <View>
                        <Header
                            title={"Orçamento"}
                            cancelButton={selectedSectionId.value === 0}
                            returnButton={selectedSectionId.value !== 0 ? () => updateHandler(selectedSectionId.value - 1) : undefined}
                        />
                    </View>
                    <SectionsNavigator
                        selectedId={selectedSectionId}
                        sections={[
                            {
                                id: 0,
                                title: "Visão Geral",
                                onPress: () => selectedSectionId.value !== 0 && updateHandler(0)
                            },
                            {
                                id: 1,
                                title: "Revisão",
                                onPress: () => selectedSectionId.value !== 1 && updateHandler(1)
                            },
                        ]}
                    />

                    {
                        (route.params?.serviceId && invoiceService) ? (
                            <>
                                <SectionBottomSheet bottomSheetRef={section0BottomSheetRef} expanded={false}>
                                    <SubSectionWrapper
                                        header={{
                                            title: "Serviços",
                                        }}
                                    >
                                        <View className='w-full'>
                                            {
                                                invoiceService.subServices && invoiceService.subServices?.length === 0 && (
                                                    <Text className='text-sm text-center text-black dark:text-white mb-6'>
                                                        Nenhum serviço adicionado.
                                                    </Text>
                                                )
                                            }
                                            {
                                                invoiceService.subServices.map((subService, index) => (
                                                    <View className='mb-4' key={index.toString()}>
                                                        <PreviewStatic subService={subService} />
                                                    </View>
                                                ))
                                            }
                                        </View>
                                    </SubSectionWrapper>

                                    <SubSectionWrapper
                                        header={{
                                            title: "Materiais",
                                        }}
                                    >
                                        <View className='w-full'>
                                            {
                                                invoiceService.materials && invoiceService.materials?.length === 0 && (
                                                    <Text className='text-sm text-center text-black dark:text-white mb-6'>
                                                        Nenhum material adicionado.
                                                    </Text>
                                                )
                                            }
                                            {
                                                invoiceService.materials.map((material, index) => (
                                                    <View className='mb-4' key={index.toString()}>
                                                        <PreviewStatic material={material} />
                                                    </View>
                                                ))
                                            }
                                        </View>
                                    </SubSectionWrapper>

                                    <WarrantyReview value={daysToMonthsOrYears(invoiceService.service.warrantyPeriod)} />

                                    {
                                        invoiceService.service.warrantyDetails && (
                                            <ReviewSection
                                                wrapperProps={{ header: { title: "Condições da Garantia" } }}
                                                value={invoiceService.service.warrantyDetails ?? "[vazio]"}
                                            />
                                        )
                                    }

                                    <View className='w-full items-center justify-center gap-y-8 mb-5'>
                                        <Text className='text-center text-gray-100 text-sm w-full'>
                                            Todos os valores exibidos acima podem ser alterados a qualquer momento ao <Text className='font-bold'>editar o serviço</Text>.
                                        </Text>

                                        <View className='w-3/5 h-[0px] border-dashed border-t border-gray-100' />
                                    </View>

                                    <View className='flex flex-1' />

                                    <NextButton onPress={() => updateHandler && updateHandler(1)} />
                                </SectionBottomSheet>

                                <SectionBottomSheet bottomSheetRef={section1BottomSheetRef} expanded={false}>
                                    <ReviewSection
                                        wrapperProps={{
                                            header: { title: "Condições	de Pagamento", icon: "credit-card" },
                                            style: { flex: 1 },
                                        }}
                                        value={getPaymentCondition(invoiceService.service)}
                                    />

                                    <PaymentMethodsReview value={invoiceService.service.paymentMethods.join(", ")} />

                                    <SubSectionWrapper
                                        header={{
                                            title: "Detalhes",
                                        }}
                                    >
                                        <View className='w-full'>
                                            <Checkbox
                                                title='Mostrar subtotal de serviços e materiais'
                                                checked={false}
                                                inverted
                                                customKey={"checkbox_1"}
                                            />
                                            <Checkbox
                                                title='Mostrar detalhes de serviços'
                                                checked={false}
                                                inverted
                                                customKey={"checkbox_2"}
                                            />
                                            <Checkbox
                                                title='Mostrar detalhes de materiais'
                                                checked={false}
                                                inverted
                                                customKey={"checkbox_3"}
                                            />
                                        </View>
                                    </SubSectionWrapper>

                                    <View className='flex flex-1' />

                                    <SubSectionWrapper
                                        header={{
                                            title: "Total",
                                        }}
                                    >
                                        <View className='w-full p-[12.5px] bg-gray-300 border border-gray-500 rounded-lg'>
                                            {
                                                invoiceService.subServices.length > 0 && (
                                                    <View className='flex flex-col mb-2'>
                                                        <Text className='font-normal text-sm text-gray-100 mb-2'>
                                                            Serviços
                                                        </Text>
                                                        <View className='flex flex-col w-full gap-y-1'>
                                                            {
                                                                invoiceService.subServices.map((subService, index) => (
                                                                    <View key={index.toString()}>
                                                                        <Value
                                                                            value={subService.price}
                                                                            multiplier={subService.amount}
                                                                        />
                                                                    </View>
                                                                ))
                                                            }
                                                        </View>
                                                    </View>
                                                )
                                            }

                                            {
                                                materialsWithProfitMargin && materialsWithProfitMargin?.length > 0 && (
                                                    <View className='flex flex-col mb-2'>
                                                        <Text className='font-normal text-sm text-gray-100 mb-2'>
                                                            Materials
                                                        </Text>
                                                        <View className='flex flex-col w-full gap-y-1'>
                                                            {
                                                                materialsWithProfitMargin?.map((material, index) => (
                                                                    <View key={index.toString()}>
                                                                        <Value
                                                                            value={material.price}
                                                                            multiplier={material.amount}
                                                                            profitMargin={material.profitMargin}
                                                                        />
                                                                    </View>
                                                                ))
                                                            }
                                                        </View>
                                                    </View>
                                                )
                                            }

                                            {
                                                invoiceService.materials.length > 0 && (
                                                    <View className='flex flex-col mb-2'>
                                                        <Text className='font-normal text-sm text-gray-100 mb-2'>
                                                            Gastos do Cliente
                                                        </Text>
                                                        <View className='flex flex-col w-full gap-y-1'>
                                                            {
                                                                invoiceService.materials.map((subService, index) => (
                                                                    <View key={index.toString()}>
                                                                        <Value
                                                                            value={subService.price}
                                                                            multiplier={subService.amount}
                                                                            notEarning
                                                                        />
                                                                    </View>
                                                                ))
                                                            }
                                                        </View>
                                                    </View>
                                                )
                                            }

                                            <View className='w-full flex items-end justify-center my-2'>
                                                <View className='w-1/4 h-[0px] border-dashed border-t border-gray-100' />
                                            </View>

                                            <View className='flex flex-row items-center justify-between mb-2'>
                                                <Text className='font-normal text-sm text-gray-100'>
                                                    Subtotal
                                                </Text>
                                                <Text className='font-normal text-sm text-text-100'>
                                                    R${subServicesTotal + materialsTotal}
                                                </Text>
                                            </View>

                                            <View className='flex flex-row items-center justify-between'>
                                                <Text className='font-normal text-sm text-gray-100'>
                                                    Lucro
                                                </Text>
                                                <Text className='text-sm text-primary-green'>
                                                    +R${subServicesTotal + materialsProfitMargin}
                                                </Text>
                                            </View>
                                        </View>
                                    </SubSectionWrapper>

                                    <NextButton
                                        isLastButton
                                        title={"Gerar documento"}
                                        onPress={onSubmit}
                                    />
                                </SectionBottomSheet>
                            </>
                        ) : <Loading />
                    }
                </View>
            </TouchableWithoutFeedback>
            <Modal
                isVisible={modalProps.status === "success"}
                setVisible={(value: boolean) => setModalProps({ status: false })}
                title={"O orçamento foi criado com sucesso."}
                message={`O arquivo foi salvo em ${modalProps.data}`}
                icon="article"
                buttons={[
                    {
                        label: "Visualizar",
                        onPress: () => {
                            modalProps.data && openFile(modalProps.data);
                        },
                        color: colors.primary.green,
                        closeOnPress: true,
                    }
                ]}
                cancelButton
            />
            <Modal
                isVisible={modalProps.status === "error"}
                setVisible={(value: boolean) => setModalProps({ status: false })}
                title={"Não foi possível gerar o orçamento."}
                message={`${modalProps.data}`}
                icon="error"
                cancelButton
            />
        </>
    )
}

const Value = ({ value, multiplier, profitMargin, notEarning, currency = "R$" }: { value: number, multiplier?: number, profitMargin?: number | null, notEarning?: boolean, currency?: string }) => (
    <View className='w-full items-center flex flex-row justify-between'>
        <Text className='text-sm text-white'>
            {currency} {value} {multiplier && multiplier > 1 && `(x${multiplier})`} {profitMargin && profitMargin > 1 && `(${profitMargin}%)`}
        </Text>
        {
            notEarning ? (
                <Text className='text-sm text-text-100'>
                    {currency}{((profitMargin ? (value * (profitMargin / 100)) : value) * (multiplier ? multiplier : 1))/* .toFixed(2) */}
                </Text>
            ) : (
                <Text className='text-sm text-primary-green'>
                    + {currency}{((profitMargin ? (value * (profitMargin / 100)) : value) * (multiplier ? multiplier : 1))/* .toFixed(2) */}
                </Text>
            )
        }
    </View>
)

const getPDFString = async (data: BusinessData, service: ServiceModel, subServices?: SubServiceModel[], materials?: MaterialModel[], client?: ClientModel) => {
    const servicesTypes = subServices?.map(subService => subService.types).flat();

    const subServicesTotal = subServices && subServices?.map(subService => subService.price * subService.amount).reduce((a, b) => a + b, 0);
    const materialsTotal = materials && materials?.map(material => material.price * material.amount).reduce((a, b) => a + b, 0);

    const serviceDateIn30Days = new Date();
    serviceDateIn30Days.setDate(serviceDateIn30Days.getDate() + 30);

    const image = data.logo ? await manipulateAsync(data.logo!, [], { base64: true }) : null;

    const html = `
    <html>

    <head>
        <meta charset="utf-8">
        <title>Orçamento do ${service?.name}</title>
        <style>
            :root {
                font-size: 40%;
                /* 1rem = 10px */

                --text-100: #C4C4C4;
                --text-200: #A1A1AA;

                --gray-100: '#666666';
                --gray-200: '#333333';
                --gray-300: '#292929';
                --gray-400: '#27272A';
                --gray-500: '#1E1F20';
                --gray-600: "#1C1B1F";

                --gap: 2.5rem;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: sans-serif;
                font-style: normal;
                font-size: 1.8rem;
            }

            html {
                background: white;
                cursor: default;
            }

            body {
                box-sizing: border-box;
                margin: 0 auto;
                overflow: hidden;
                overflow-y: scroll;

                display: flex;
                flex-direction: column;
                padding: 3.5rem;
            }

            body,
            main,
            section {
                gap: var(--gap);
            }

            @media print {
                body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
            }

            header {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: start;
                gap: var(--gap);
                width: 100%;
            }

            header h1 {
                font-size: 2.8rem;
            }

            h1 {
                font: bold 100% sans-serif;
                text-align: right;
                text-transform: uppercase;
            }

            header .logo_mark {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                width: 100%;
            }

            header .logo_mark img {
                height: 6rem;
            }

            .full {
                width: 100%;
            }

            header .row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }

            header address {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                gap: 0.75rem;
            }

            main {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
            }

            main #main_header {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                width: 100%;

                background: linear-gradient(90deg, #C4C4C4 0%, #C4C4C4 52.81%, rgba(196, 196, 196, 0) 100%);
                border-radius: 1px;
                gap: 1rem;
                padding: 1.5rem var(--gap);
            }

            main #main_header p:nth-child(1) {
                font-weight: 700;
                font-size: 2.8rem;
                line-height: 150%;
                color: var(--gray-600);
            }

            main #main_header p:nth-child(2) {
                font-weight: 400;
                font-size: 1.2rem;
                line-height: 150%;
                color: var(--text-200);
            }

            .row {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                justify-content: space-between;
                gap: 1rem;
            }

            #basic_info .column {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                max-width: 65%;
            }

            .section_title {
                font-weight: 700;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-600);
            }

            .section_description {
                font-weight: 400;
                font-size: 1.8rem;
                line-height: 125%;
                color: var(--gray-500);
            }

            section {
                display: flex;
                flex-direction: column;
            }

            section header {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-start;
                gap: 1rem;
                width: 100%;
                padding: 1rem var(--gap);
                background-color: var(--text-100);
                border-radius: 1px;
            }

            section header p {
                display: flex;
                font-style: normal;
                font-weight: 700;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-200);
            }

            .table_header .description {
                flex: 1;
            }

            .table_header .quantity {
                width: 10rem;
                justify-content: flex-end;
            }

            .table_header .price {
                width: 15rem;
                justify-content: flex-end;
            }

            .table_header .total {
                width: 10rem;
                justify-content: flex-end;
            }

            .sub_sectionHeader {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-start;
                gap: 1rem;
                width: 100%;
                padding: 1rem var(--gap);
                background-color: #E9E9E9;
                border-radius: 1px;
            }

            .sub_sectionHeader p {
                display: flex;
                font-style: normal;
                font-weight: 600;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-300);
            }

            table {
                width: 100%;
                padding-inline: 2.5rem;
                border-spacing: 0 2rem;
                margin-block: -2rem;
            }

            table td {
                vertical-align: top;
            }

            table td h3 {
                font-style: normal;
                font-weight: 700;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-200);
            }

            table td h4 {
                font-style: normal;
                font-weight: 500;
                font-size: 1.6rem;
                color: var(--gray-100);
            }

            table td.quantity p,
            table td.price p {
                font-weight: 500;
                font-size: 1.8rem;
                color: var(--gray-100);
            }

            table td.total p {
                font-weight: 600;
                font-size: 1.8rem;
                color: var(--gray-200);
            }

            table td:not(:nth-child(1)) {
                justify-content: flex-end;
                text-align: end;
            }

            /* Arrumar o espaçamento extra do header */
            table td:nth-child(3) {
                padding-right: 1rem;
            }

            table td:nth-child(2) {
                padding-right: 2rem;
            }

            table td:nth-child(1) {
                padding-right: 3rem;
            }

            .line {
                display: flex;
                width: 100%;
                height: 1px;
                background-color: var(--text-100);
            }

            .subsection {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                gap: 1.5rem;
            }

            .subtotal {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                width: 37.5rem;
                padding: 1rem var(--gap);
                background-color: #E9E9E9;
                border-radius: 1px;
                align-self: flex-end;
            }

            .subtotal p {
                font-weight: 600;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-200);
            }

            .earnings_total {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                width: 100%;
                padding: 1rem var(--gap);
                background-color: #E9E9E9;
                border-radius: 1px;
            }

            .earnings_total p {
                font-weight: 700;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-300);
            }

            .payment_info {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                gap: 1rem;
                padding: 1rem;
                width: fit-content;
                text-align: left;
                background-color: #E9E9E9;
                border-radius: 1px;
            }

            .payment_info p {
                font-weight: 400;
                font-size: 1.8rem;
                color: var(--gray-300);
            }

            .payment_info span {
                font-weight: bold;
            }

            #date {
                font-style: normal;
                font-weight: 700;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-600);
            }

            .signature {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1rem;

                margin-top: 10rem;
            }

            .signature .info {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .signature div:nth-child(1) {
                width: 100%;
                min-width: 20rem;
                height: 1px;
                background-color: black;
            }

            .signature .info p:nth-child(1) {
                font-style: normal;
                font-weight: 700;
                font-size: 1.8rem;
                line-height: 150%;
                color: black;
                text-transform: uppercase;
            }

            .signature .info p:nth-child(2) {
                font-style: normal;
                font-weight: 400;
                font-size: 1.6rem;
                line-height: 150%;
            }

            footer {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                gap: var(--gap);
                margin-top: 5rem;
            }
        </style>
    </head>

    <body>
        <header>
            <div class="logo_mark">
                ${data.logo && `
                    <img
                        src="data:image/jpeg;base64,${image!.base64}"
                    />
                `}
                    <h1>${data.fantasyName}</h1>
            </div>
            <div class="row full">
                <address style="width: 50%;">
                    <p>${data.juridicalPerson}</p>
                    <p>${data.address} <br />
                        CEP ${data.postalCode}
                    </p>
                </address>
                <address>
                    <div class="row">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_998_1654" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0"
                                width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9" />
                            </mask>
                            <g mask="url(#mask0_998_1654)">
                                <path
                                    d="M4 20C3.45 20 2.97917 19.8042 2.5875 19.4125C2.19583 19.0208 2 18.55 2 18V6C2 5.45 2.19583 4.97917 2.5875 4.5875C2.97917 4.19583 3.45 4 4 4H20C20.55 4 21.0208 4.19583 21.4125 4.5875C21.8042 4.97917 22 5.45 22 6V18C22 18.55 21.8042 19.0208 21.4125 19.4125C21.0208 19.8042 20.55 20 20 20H4ZM20 8L12.525 12.675C12.4417 12.725 12.3542 12.7625 12.2625 12.7875C12.1708 12.8125 12.0833 12.825 12 12.825C11.9167 12.825 11.8292 12.8125 11.7375 12.7875C11.6458 12.7625 11.5583 12.725 11.475 12.675L4 8V18H20V8ZM12 11L20 6H4L12 11ZM4 8.25V6.775V6.8V6.7875V8.25Z"
                                    fill="#1C1B1F" />
                            </g>
                        </svg>
                        <p>${data.email}</p>
                    </div>
                    <div class="row">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_998_1669" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0"
                                width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9" />
                            </mask>
                            <g mask="url(#mask0_998_1669)">
                                <path
                                    d="M19.95 21C17.8 21 15.7042 20.5208 13.6625 19.5625C11.6208 18.6042 9.8125 17.3375 8.2375 15.7625C6.6625 14.1875 5.39583 12.3792 4.4375 10.3375C3.47917 8.29583 3 6.2 3 4.05C3 3.75 3.1 3.5 3.3 3.3C3.5 3.1 3.75 3 4.05 3H8.1C8.33333 3 8.54167 3.075 8.725 3.225C8.90833 3.375 9.01667 3.56667 9.05 3.8L9.7 7.3C9.73333 7.53333 9.72917 7.74583 9.6875 7.9375C9.64583 8.12917 9.55 8.3 9.4 8.45L6.975 10.9C7.675 12.1 8.55417 13.225 9.6125 14.275C10.6708 15.325 11.8333 16.2333 13.1 17L15.45 14.65C15.6 14.5 15.7958 14.3875 16.0375 14.3125C16.2792 14.2375 16.5167 14.2167 16.75 14.25L20.2 14.95C20.4333 15 20.625 15.1125 20.775 15.2875C20.925 15.4625 21 15.6667 21 15.9V19.95C21 20.25 20.9 20.5 20.7 20.7C20.5 20.9 20.25 21 19.95 21ZM6.025 9L7.675 7.35L7.25 5H5.025C5.10833 5.68333 5.225 6.35833 5.375 7.025C5.525 7.69167 5.74167 8.35 6.025 9ZM19 18.95V16.75L16.65 16.275L14.975 17.95C15.625 18.2333 16.2875 18.4583 16.9625 18.625C17.6375 18.7917 18.3167 18.9 19 18.95Z"
                                    fill="#1C1B1F" />
                            </g>
                        </svg>
                        <p>${data.phone}</p>
                    </div>
                    ${data.phone2 && `<div class="row">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_998_1669" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0"
                                width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9" />
                            </mask>
                            <g mask="url(#mask0_998_1669)">
                                <path
                                    d="M19.95 21C17.8 21 15.7042 20.5208 13.6625 19.5625C11.6208 18.6042 9.8125 17.3375 8.2375 15.7625C6.6625 14.1875 5.39583 12.3792 4.4375 10.3375C3.47917 8.29583 3 6.2 3 4.05C3 3.75 3.1 3.5 3.3 3.3C3.5 3.1 3.75 3 4.05 3H8.1C8.33333 3 8.54167 3.075 8.725 3.225C8.90833 3.375 9.01667 3.56667 9.05 3.8L9.7 7.3C9.73333 7.53333 9.72917 7.74583 9.6875 7.9375C9.64583 8.12917 9.55 8.3 9.4 8.45L6.975 10.9C7.675 12.1 8.55417 13.225 9.6125 14.275C10.6708 15.325 11.8333 16.2333 13.1 17L15.45 14.65C15.6 14.5 15.7958 14.3875 16.0375 14.3125C16.2792 14.2375 16.5167 14.2167 16.75 14.25L20.2 14.95C20.4333 15 20.625 15.1125 20.775 15.2875C20.925 15.4625 21 15.6667 21 15.9V19.95C21 20.25 20.9 20.5 20.7 20.7C20.5 20.9 20.25 21 19.95 21ZM6.025 9L7.675 7.35L7.25 5H5.025C5.10833 5.68333 5.225 6.35833 5.375 7.025C5.525 7.69167 5.74167 8.35 6.025 9ZM19 18.95V16.75L16.65 16.275L14.975 17.95C15.625 18.2333 16.2875 18.4583 16.9625 18.625C17.6375 18.7917 18.3167 18.9 19 18.95Z"
                                    fill="#1C1B1F" />
                            </g>
                        </svg>
                        <p>${data.phone2}</p>
                    </div>`
        }
                </address>
            </div>
        </header>

        <main>
            <header id="main_header">
                <p>Orçamento ${service?.name.split(' ')[1]}</p>
                <p>#${service?.id}</p>
            </header>

            <section class="full">
                <div class="row">
                    ${service?.client && service.client.id && `
                    <div class="column">
                        <p class="section_title">Cliente: ${client?.name}</p>
                        ${client?.address && `<p class="section_description">${client?.address}</p>`}
                    </div>`
        }
                    <div class="column">
                        <p class="section_title">Data e horário da visita técnica</p>
                        <p class="section_description">${service.date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })} - ${service.date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        })}</p >
                    </div>
                </div>
            </section>

            <section class="full">
                <header class="table_header">
                    <p class="description">Descrição</p>
                    <p class="quantity">Qtd.</p>
                    <p class="price">Preço Unitário</p>
                    <p class="total">Total</p>
                </header>
                
                ${subServices && subServices.length > 0 && `
                        <div class="subsection">
                            <div class="sub_sectionHeader">
                                <p>Serviços</p>
                            </div>
                            <table class="full">
                                <colgroup>
                                    <col style="flex: 1;">
                                    <col style="width: 10rem;">
                                    <col style="width: 15rem;">
                                    <col style="width: 10rem;">
                                </colgroup>

                                <tbody>
                                   ${subServices.map(subService => `
                                        <tr>
                                            <td>
                                                <h3>${subService.description}</h3>
                                                ${subService.details && `
                                                    <h4>${subService.details}</h4>
                                                `
            }
                                            </td>
                                            <td class="quantity">
                                                <p>${subService.amount}</p>
                                            </td>
                                            <td class="price">
                                                <p>R$ ${subService.price}</p>
                                            </td>
                                            <td class="total">
                                                <p>R$ ${subService.price * subService.amount}</p>
                                            </td>
                                        </tr>
                                        `).toString().split(',').join('')}
                                </tbody>
                            </table>
                            <div class="line"></div>
                            <div class="subtotal">
                                <p>Subtotal</p>
                                <p>R$ ${subServicesTotal}</p>
                            </div>
                        </div>            
                    `
        }

                ${materials && materials.length > 0 && `
                        <div class="subsection">
                            <div class="sub_sectionHeader">
                                <p>Materiais</p>
                            </div>
                            <table class="full">
                                <colgroup>
                                    <col style="flex: 1;">
                                    <col style="width: 10rem;">
                                    <col style="width: 15rem;">
                                    <col style="width: 10rem;">
                                </colgroup>

                                <tbody>
                                   ${materials.map(material => `
                                        <tr>
                                            <td>
                                                <h3>${material.name}</h3>
                                                ${material.description && `
                                                    <h4>${material.description}</h4>
                                                `
            }
                                            </td>
                                            <td class="quantity">
                                                <p>${material.amount}</p>
                                            </td>
                                            <td class="price">
                                                <p>R$ ${material.price}</p>
                                            </td>
                                            <td class="total">
                                                <p>R$ ${material.price * material.amount}</p>
                                            </td>
                                        </tr>
                                        `).toString().split(',').join('')}
                                </tbody>
                            </table>
                            <div class="line"></div>
                            <div class="subtotal">
                                <p>Subtotal</p>
                                <p>R$ ${materialsTotal}</p>
                            </div>
                        </div>            
                    `
        }

            </section>

            <div class="earnings_total">
                <p>Total</p>
                <p>R$ ${subServicesTotal ? subServicesTotal : 0 + (materialsTotal ? materialsTotal : 0)}</p>
            </div>

            <section class="full">
                <header>
                    <p>Pagamento</p>
                </header>
                <div class="row">
                    <div class="column">
                        <p class="section_title">Condições de Pagamento</p>
                        <p class="section_description">${getPaymentCondition(service)}</p>
                    </div>
                    <div class="column">
                        <p class="section_title">Meios de Pagamento</p>
                        <p class="section_description">${service.paymentMethods.join(", ")}</p>
                    </div>
                </div>
                <!--
                <div class="row" style="justify-content: flex-start; gap: var(--gap);">
                    <div class="payment_info">
                        <p><span>Conta Corrente:</span> 63945-5</p>
                        <p><span>Agência:</span> 6101</p>
                        <p><span>Banco:</span> Itaú</p>
                    </div>
                    <div class="payment_info">
                        <p><span>PIX:</span> andserv.maceio@gmail.com</p>
                    </div>
                </div>-->
            </section>

            <section class="full">
                <header>
                    <p>Garantia</p>
                </header>
                <div class="row">
                    <div class="column" style="min-width: 25%;">
                        <p class="section_title">Período de Garantia</p>
                        <p class="section_description">${service.warrantyPeriod} dias</p>
                    </div>
                    ${service.warrantyDetails && `
                        <div class="column">
                        <p class="section_title">Condições da Garantia</p>
                        <p class="section_description">${service.warrantyDetails}</p>
                        </div>
                    `}
                </div>
            </section>

            <p id="date">Maceió, 27/01/2023</p>

            <div class="signature">
                <div></div>
                <div class="info">
                    <p>${data.fantasyName}</p>
                    <p>${data.socialReason}</p>
                </div>
            </div>

            <div style="display: flex; flex: 1;">

            </div>

            <footer class="full">
                <div class="row full">
                    <div class="column" style="min-width: 25%;">
                        <p class="section_title">Validade do orçamento</p>
                        <p class="section_description">${serviceDateIn30Days.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })}</p>
                    </div>

                    <div class="column" style="min-width: 25%;">
                        <p class="section_title">Categorias</p>
                        <p class="section_description">${servicesTypes?.map(type => tags.find(tag => tag.value === type)?.title)}</p>
                    </div>
                </div>

                <div class="full" style="display: flex; height: 1px; background-color: var(--text-100);">

                </div>
            </footer>
        </main>
    </body>

    </html>
    `
    return html;
}