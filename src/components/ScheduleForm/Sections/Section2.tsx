import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Text, View } from "react-native";

import clsx from 'clsx';
import colors from 'global/colors';

import PaymentMethodsIcon from 'assets/icons/currency_exchange.svg';
import WarrantyIcon from 'assets/icons/warranty.svg';

// Components
import SectionBottomSheet from '../SectionBottomSheet';
import { Loading } from 'components/StatusMessage';
import { PreviewStatic } from 'components/Preview';
import { Section, SubSectionWrapper, SubSectionWrapperProps } from '../SubSectionWrapper';
import { ActionButton } from 'components/Button';

// Utils
import { database } from 'database/index.native';

// Functions

async function getServiceNumber() {
    const servicesCollection = database.get<ServiceModel>('services');
    const count = await servicesCollection.query().fetchCount();
    return count + 1;
}

export function daysToMonthsOrYears(days: number) {
    if (days < 30) {
        return `${days} dia${days > 1 ? 's' : ''}`;
    }
    if (days < 365) {
        return `${Math.floor(days / 30)} ${Math.floor(days / 30) > 1 ? 'meses' : 'mês'}`;
    }
    return `${Math.floor(days / 360)} ano${Math.floor(days / 360) > 1 ? 's' : ''}`;
}

// Types
import type { MaterialModel } from 'database/models/materialModel';
import type { ServiceModel } from 'database/models/serviceModel';
import type { SubServiceModel } from 'database/models/subServiceModel';
import type { Section0Props, Section0RefProps, Section1Props, Section1RefProps } from '../types';

// Utils
import { Q } from '@nozbe/watermelondb';
import { scheduleServiceNotification } from 'utils/notificationHandler';

interface ReviewSectionProps {
    wrapperProps: SubSectionWrapperProps;
    value: string;
    multiline?: boolean;
}

export const ReviewSection = ({ wrapperProps, value, multiline }: ReviewSectionProps) => (
    <SubSectionWrapper {...wrapperProps} preset="smallMargin" >
        <View className={clsx("w-full px-4 py-3 rounded-lg border border-gray-300 bg-black dark:bg-gray-300", {
            "min-h-[100px] pt-4": multiline,
        })}>
            <Text className='text-text-100'>
                {value}
            </Text>
        </View>
    </SubSectionWrapper>
)

export const PaymentMethodsReview = ({ value }: { value: string }) => (
    <ReviewSection
        wrapperProps={{
            header: { title: "Métodos de Pagamento", customIcon: PaymentMethodsIcon as any },
            style: { flex: 1 },
        }}
        value={value}
    />
);

export const WarrantyReview = ({ value }: { value?: string }) => (
    <ReviewSection
        wrapperProps={{
            header: { title: "Garantia", customIcon: WarrantyIcon as any },
            style: { flex: 1 },
        }}
        value={value ?? "---"}
    />
);

interface Section2Props extends Section {
    bottomSheet: string;
    formRefs: {
        section0Ref: React.RefObject<Section0RefProps>;
        section1Ref: React.RefObject<Section1RefProps>;
    }
}

const updateFilter = (databaseArray: Array<any>, newArray: Array<any>) => {
    return databaseArray.filter((databaseItem) => newArray.some((newItem) => newItem.id === databaseItem.id));
}

const deleteFilter = (databaseArray: Array<any>, newArray: Array<any>) => {
    return databaseArray.filter((databaseItem) => !newArray.some((newItem) => newItem.id === databaseItem.id));
}

const createFilter = (databaseArray: Array<any>, newArray: Array<any>) => {
    return newArray.filter((newItem) => !databaseArray.some((databaseItem) => databaseItem.id === newItem.id));
}

export default function Section2({ bottomSheet, formRefs, initialValue }: Section2Props) {
    const { navigate } = useNavigation();
    const { section0Ref, section1Ref } = formRefs;

    const currentDate = new Date();
    const [data, setData] = useState<Section0Props & Section1Props & { serviceId: number } | undefined | null>(undefined);
    const [isLoading, setLoading] = useState(false);

    const onExpanded = async () => {
        if (formRefs) {
            const section0Data = section0Ref.current?.getData();
            const section1Data = section1Ref.current?.getData();


            if (section0Data && section1Data) {
                console.log(section1Data?.agreement?.agreementInitialValue)
                const serviceId = await getServiceNumber();
                const newData = {
                    ...section0Data,
                    ...section1Data,
                    serviceId,
                }

                setData(newData)
            }
        }
    }

    const onSubmit = useCallback(async () => {
        const serviceDate = data?.date ? new Date(
            currentDate.getFullYear(),
            data.date.month,
            data.date.date,
            data.time?.getHours() ?? 0,
            data.time?.getMinutes() ?? 0,
            data.time?.getSeconds() ?? 0
        ) : currentDate;

        if (data) {
            setLoading(true)
            const formattedData = {
                name: data.name || `Serviço n.0${data.serviceId}-${currentDate.getFullYear()}`,
                date: serviceDate,
                status: 'scheduled',
                discountPercentage: data.discount,
                additionalInfo: data.additionalInfo,
                paymentCondition: data.agreement && data.agreement.remainingValue === "afterCompletion" ? "agreement" : data.installments ? "installments" : "cash",
                paymentMethods: data.checkedPaymentMethods,
                splitMethod: data.agreement?.splitMethod ?? null,
                agreementInitialValue: data.agreement?.agreementInitialValue ?? null,
                installmentsAmount: data.installments ?? null,
                warrantyPeriod: data.warrantyDays,
                warrantyDetails: data.warrantyDetails,
            } as ServiceModel;

            if (initialValue) {
                const { service, subServicesAmount, client } = await database.write(async () => {
                    const updatedService = await initialValue.service.update((service) => {
                        service.name = formattedData.name;
                        service.date = formattedData.date;
                        service.status = formattedData.status;
                        service.discountPercentage = formattedData.discountPercentage;
                        service.additionalInfo = formattedData.additionalInfo;
                        service.paymentCondition = formattedData.paymentCondition;
                        service.paymentMethods = formattedData.paymentMethods;
                        service.splitMethod = formattedData.splitMethod;
                        service.agreementInitialValue = formattedData.agreementInitialValue;
                        service.installmentsAmount = formattedData.installmentsAmount;
                        service.warrantyPeriod = formattedData.warrantyPeriod;
                        service.warrantyDetails = formattedData.warrantyDetails;
                    })

                    // Sub services
                    const subServicesToUpdate = updateFilter(initialValue.subServices, data.subServices) as SubServiceModel[];
                    const batchSubServicesToUpdate = subServicesToUpdate.map((subService) => {
                        const newData = data.subServices.find((newSubService) => newSubService.id === subService.id);
                        if (newData) {
                            const updatedSubService = subService.prepareUpdate((subServiceToUpdate) => {
                                subServiceToUpdate.description = newData.description;
                                subServiceToUpdate.details = newData.details;
                                subServiceToUpdate.price = newData.price;
                                subServiceToUpdate.types = newData.types;
                            })
                            return updatedSubService;
                        }
                    })

                    //console.log(batchSubServicesToUpdate)

                    const subServicesToDelete = deleteFilter(initialValue.subServices, data.subServices);
                    const batchSubServicesToDelete = subServicesToDelete.map((subService) => {
                        const deletedSubService = subService.prepareDestroyPermanently();
                        return deletedSubService;
                    })

                    const subServicesModel = await database.collections.get<SubServiceModel>('sub_services');

                    const subServicesToCreate = createFilter(initialValue.subServices, data.subServices);
                    const batchSubServicesToCreate = subServicesToCreate.map((subService) => {
                        const newSubService = subServicesModel.prepareCreate((subServiceToCreate: any) => {
                            subServiceToCreate.service.set(updatedService);
                            subServiceToCreate.description = subService.description;
                            subServiceToCreate.details = subService.details;
                            subServiceToCreate.types = subService.types;
                            subServiceToCreate.amount = subService.amount;
                            subServiceToCreate.price = subService.price;
                        })
                        return newSubService;
                    })

                    // Materials
                    const materialsToUpdate = updateFilter(initialValue.materials, data.materials) as MaterialModel[];
                    const batchMaterialsToUpdate = materialsToUpdate.map((material) => {
                        const newData = data.materials.find((newMaterial) => newMaterial.id === material.id);
                        if (newData) {
                            const updatedMaterial = material.prepareUpdate((materialToUpdate) => {
                                materialToUpdate.name = newData.name;
                                materialToUpdate.description = newData.description;
                                materialToUpdate.image_url = newData.image_url;
                                materialToUpdate.price = newData.price;
                                materialToUpdate.amount = newData.amount;
                                materialToUpdate.profitMargin = newData.profitMargin;
                                materialToUpdate.availability = newData.availability;
                            })
                            return updatedMaterial;
                        }
                    })
                    //console.log(batchMaterialsToUpdate.length, "materialsToUpdate")

                    const materialsToDelete = deleteFilter(initialValue.materials, data.materials);
                    const batchMaterialsToDelete = materialsToDelete.map((material) => {
                        const deletedMaterial = material.prepareDestroyPermanently();
                        return deletedMaterial;
                    })
                    //console.log(batchMaterialsToDelete.length, "batchMaterialsToDelete")

                    const materialsModel = await database.collections.get<MaterialModel>('materials');

                    const materialsToCreate = createFilter(initialValue.materials, data.materials);
                    const batchMaterialsToCreate = materialsToCreate.map((material) => {
                        const newMaterial = materialsModel.prepareCreate((materialToCreate: any) => {
                            materialToCreate.service.set(updatedService);
                            materialToCreate.name = material.name;
                            materialToCreate.description = material.description;
                            materialToCreate.image_url = material.image_url;
                            materialToCreate.price = material.price;
                            materialToCreate.amount = material.amount;
                            materialToCreate.profitMargin = material.profitMargin;
                            materialToCreate.availability = material.availability;
                        })
                        return newMaterial;
                    })
                    //console.log(batchMaterialsToCreate.length, "batchMaterialsToCreate")

                    // Adicionamos os subserviços e os materiais ao serviço
                    await database.batch([
                        ...batchSubServicesToUpdate,
                        ...batchSubServicesToDelete,
                        ...batchSubServicesToCreate,
                        ...batchMaterialsToUpdate,
                        ...batchMaterialsToDelete,
                        ...batchMaterialsToCreate
                    ])

                    const subServicesAmount = await database.get<SubServiceModel>(`sub_services`).query(Q.where('service_id', updatedService.id)).fetchCount();
                    const typedUpdateService = updatedService as any;
                    const client = await typedUpdateService.client.fetch();

                    return { service: updatedService, subServicesAmount, client }
                })

                await scheduleServiceNotification(service, subServicesAmount, client?.name)

                setLoading(false)
                console.log("Service updated successfully (with subServices and materials).")
                navigate("service", { serviceId: initialValue.service.id, updated: true });
            } else {
                const serviceOnDatabase = await database.write(async () => {
                    const newService = await database.get<ServiceModel>('services').create((service) => {
                        service.name = formattedData.name;
                        service.date = formattedData.date;
                        service.status = formattedData.status;
                        service.additionalInfo = formattedData.additionalInfo;
                        service.paymentCondition = formattedData.paymentCondition;
                        service.paymentMethods = formattedData.paymentMethods;
                        service.splitMethod = formattedData.splitMethod;
                        service.agreementInitialValue = formattedData.agreementInitialValue;
                        service.installmentsAmount = formattedData.installmentsAmount;
                        service.warrantyPeriod = formattedData.warrantyPeriod;
                        service.warrantyDetails = formattedData.warrantyDetails;
                    })

                    const batchSubServices = await Promise.all(data.subServices.map(async (subService) => {
                        const newSubService = await database.get<SubServiceModel>('sub_services').prepareCreate((sub_service_db: any) => {
                            sub_service_db.service.set(newService);
                            sub_service_db.description = subService.description;
                            sub_service_db.details = subService.details;
                            sub_service_db.types = subService.types;
                            sub_service_db.price = subService.price;
                            sub_service_db.amount = subService.amount;
                        })
                        return newSubService
                    }))

                    const batchMaterials = await Promise.all(data.materials.map(async (material) => {
                        const newMaterial = await database.get<MaterialModel>('materials').prepareCreate((material_db: any) => {
                            material_db.service.set(newService)
                            material_db.name = material.name;
                            material_db.description = material.description;
                            material_db.image_url = material.image_url;
                            material_db.price = material.price;
                            material_db.amount = material.amount;
                            material_db.profitMargin = material.profitMargin;
                            material_db.availability = material.availability;
                        })
                        return newMaterial
                    }))

                    // Adicionamos os subserviços e os materiais ao serviço
                    await database.batch([...batchSubServices, ...batchMaterials])

                    return newService;
                });

                await scheduleServiceNotification(serviceOnDatabase, data.subServices.length)

                //console.log("Service created successfully (with subServices and materials).")
                navigate("home", { service: "created" });
            }
        }
    }, [data])

    const onDismissed = useCallback(() => {
        setData(undefined) // voltamos ao estado de carregamento
    }, [])

    return (
        <SectionBottomSheet bottomSheet={bottomSheet} onExpanded={onExpanded} onDismissed={onDismissed}>
            {
                data ? (
                    <>
                        <View className='flex-col w-full items-start justify-center'>
                            <Text className='font-titleBold text-start text-2xl text-black dark:text-white'>
                                Confira se as informações abaixo estão corretas.
                            </Text>
                            <Text className='text-sm text-start mt-1 text-black dark:text-white'>
                                Caso não, volte aos passos anteriores para corrigir.
                            </Text>
                        </View>

                        <ReviewSection
                            wrapperProps={{ header: { title: "Nome do Serviço" } }}
                            value={data.name || `Serviço n.0${data.serviceId}-${currentDate.getFullYear()}`}
                        />

                        {
                            data.additionalInfo && (
                                <ReviewSection
                                    wrapperProps={{ header: { title: "Informações Adicionais" } }}
                                    value={data.additionalInfo ?? "[vazio]"}
                                />
                            )
                        }

                        <View className='flex-row w-full'>
                            <ReviewSection
                                wrapperProps={{
                                    header: { title: "Data" },
                                    style: { flex: 1, marginRight: 10 },
                                }}
                                value={new Date(`${currentDate.getFullYear()}-${data.date?.month! + 1}-${data.date?.date! + 1}T00:00:00Z`).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                })}
                            />
                            <ReviewSection
                                wrapperProps={{
                                    header: { title: "Hora" },
                                    style: { flex: 1 },
                                }}
                                value={data.time ? `${data.time?.getHours()}:${data.time?.getMinutes()}${data.time.getMinutes() < 10 ? '0' : ''}` : "Indeterminado"}
                            />
                        </View>

                        <ReviewSection
                            wrapperProps={{
                                header: { title: "Desconto", icon: "money-off" },
                                style: { flex: 1 },
                            }}
                            value={data.discount ? `${data.discount}%` : "Nenhum"}
                        />

                        <ReviewSection
                            wrapperProps={{
                                header: { title: "Condições	de Pagamento", icon: "credit-card" },
                                style: { flex: 1 },
                            }}
                            value={data.installments ? `${data.installments} parcelas`
                                : data.agreement ? `${data.agreement.splitMethod === "percentage" ? `${data.agreement.agreementInitialValue}%` : `${data.agreement.agreementInitialValue === "half" ? "Metade" : `R$ ${data.agreement.agreementInitialValue}`}`} antecipado e o valor restante ${data.agreement.remainingValue === "afterCompletion" ? "após a conclusão do serviço" : `dividido em ${data.installments} parcelas`}`
                                    : "À vista"
                            }
                        />

                        <PaymentMethodsReview value={data?.checkedPaymentMethods?.length ? data?.checkedPaymentMethods.join(', ') : "---"} />

                        <WarrantyReview value={daysToMonthsOrYears(data.warrantyDays)} />

                        {
                            data.warrantyDetails && (
                                <ReviewSection
                                    wrapperProps={{ header: { title: "Condições da Garantia" } }}
                                    value={data.warrantyDetails ?? "[vazio]"}
                                />
                            )
                        }

                        {
                            data.subServices && data.subServices.length > 0 && (
                                <SubSectionWrapper
                                    style={{ flex: 1 }}
                                    header={{ title: "Serviços" }}
                                >
                                    <View className='w-full'>
                                        {
                                            data.subServices.map((subService, index) => (
                                                <View className='mb-4' key={index.toString()}>
                                                    <PreviewStatic subService={subService} />
                                                </View>
                                            ))
                                        }
                                    </View>
                                </SubSectionWrapper>
                            )
                        }

                        {
                            data.materials && data.materials.length > 0 && (
                                <SubSectionWrapper
                                    style={{ flex: 1 }}
                                    header={{ title: "Materiais" }}
                                >
                                    <View className='w-full'>
                                        {
                                            data.materials.map((material, index) => (
                                                <View className='mb-4' key={index.toString()}>
                                                    <PreviewStatic material={material} />
                                                </View>
                                            ))
                                        }
                                    </View>
                                </SubSectionWrapper>
                            )
                        }

                        <ActionButton
                            isLoading={isLoading}
                            onPress={onSubmit}
                            label={initialValue ? "Atualizar" : "Agendar"}
                            style={{ backgroundColor: colors.primary.green }}
                            preset="next"
                        />
                    </>
                ) : <Loading message='Aguarde enquanto verificamos os dados do agendamento...' />
            }
        </SectionBottomSheet>
    )
}