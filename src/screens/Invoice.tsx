import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Keyboard, Platform, Text, TouchableWithoutFeedback, View } from "react-native";
import { useSharedValue, withSpring } from 'react-native-reanimated';

import colors from 'global/colors';

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
import type { BusinessData } from './Main/Business';

// PDF
import FileViewer from 'react-native-file-viewer';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

import { getPaymentCondition, getPDFString } from 'utils/getInvoicePDFString';

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
                toggleVisibility={() => setModalProps({ status: false })}
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
                toggleVisibility={() => setModalProps({ status: false })}
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