import { useState } from "react";
import { ServiceModel } from "database/models/serviceModel";
import { TouchableOpacity, View, Text, TouchableOpacityProps, ViewStyle } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

import { tags } from "global/tags";
import { SubServiceModel } from "database/models/subServiceModel";
import { Preview, PreviewStatic } from "./Preview";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

interface Container extends TouchableOpacityProps {
    children: React.ReactNode;
}

const Container = ({ children, ...rest }: Container) => (
    <TouchableOpacity
        className='w-full flex flex-row items-center justify-between mb-2 py-2'
        accessible
        activeOpacity={0.75}
        accessibilityRole="button"
        {...rest}
    >
        {children}
    </TouchableOpacity>
)

const MainInfo = ({ service, subServices }: { service: ServiceModel, subServices?: SubServiceModel[] }) => (
    <View className='flex-col items-start justify-start flex flex-1 mr-4'>
        <Text className='font-titleSemiBold text-base text-black dark:text-white leading-none'>
            {service.name}
        </Text>
        <Text className='leading-tight font-regular text-xs text-gray-100'>
            {
                subServices && subServices?.length > 0 ? (
                    <>
                        {subServices?.length} subserviço{subServices?.length !== 1 ? "s" : ""} {service.client.name ? "para" : ""}
                        <Text className='font-titleSemiBold text-base text-black dark:text-white'>
                            {service.client.name ? service.client.name : ""}
                        </Text>
                    </>
                ) : "Nenhum subserviço adicionado"
            }
        </Text>
    </View>
)

const Line = () => (
    <View className='h-full max-h-8 opacity-60 border-[0.5px] border-dashed border-text-100 mr-4' />
)

const InfoHolderLeft = ({ children, width }: { children: React.ReactNode, width?: number }) => (
    <View className='flex items-center justify-center mr-2' style={{ minWidth: width ?? 35 }}>
        {children}
    </View>
)

const InfoHolderRight = ({ children, onPress }: { children: React.ReactNode, onPress?: () => void }) => (
    <TouchableWithoutFeedback onPress={onPress}>
        <View className='relative min-w-8 flex items-end justify-center'>
            {children}
        </View>
    </TouchableWithoutFeedback>
)

interface ServicePreviewProps {
    service: ServiceModel;
    subServices?: SubServiceModel[];
    onPress: () => void;
    additionalInfo: "day" | 'date' | 'time';
}

const specialStyle = { borderColor: colors.primary.green, borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, paddingVertical: 5, borderStyle: "dashed" } as ViewStyle;

export default function ServicePreview({ service, subServices, onPress, additionalInfo }: ServicePreviewProps) {
    const servicesTypes = subServices?.map(subService => subService.types).flat();
    const servicesTypesIcon = servicesTypes && servicesTypes?.length > 0 && tags[tags.findIndex(tag => tag.value === servicesTypes[0])].icon

    const currentDate = new Date();
    const serviceDate = new Date(service.date);
    const infoContainers = {
        day: serviceDate.getDate() === currentDate.getDate() ? "hoje" : serviceDate.getDate() === currentDate.getDate() + 1 ? "amanhã" : serviceDate.toLocaleDateString("pt-BR", { weekday: "long" }).split("-")[0],
        date: serviceDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        time: serviceDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }

    return (
        <Container style={serviceDate.getDate() === currentDate.getDate() && specialStyle} onPress={onPress}>
            {
                servicesTypes && <InfoHolderLeft>
                    <MaterialIcons name={servicesTypes.length > 1 ? "api" : servicesTypesIcon ? servicesTypesIcon as unknown as any : "hourglass-empty"} size={32} color={colors.text[100]} />
                </InfoHolderLeft>
            }
            <Line />
            <MainInfo service={service} subServices={subServices} />
            <InfoHolderRight>
                {/* <Text className='absolute font-black text-[42px] opacity-20 flex-nowrap whitespace-nowrap text-text_light-100 dark:text-white'>
                    R$
                </Text> */}
                <View className="absolute m-auto opacity-20 justify-center items-center top-0 left-0 right-0 bottom-0" >
                    <MaterialIcons
                        name={"calendar-today"}
                        size={28}
                        color={colors.white}
                    />
                </View>
                <Text className='font-black text-2xl text-black dark:text-white'>
                    {infoContainers[additionalInfo as keyof typeof infoContainers]}
                </Text>
            </InfoHolderRight>
        </Container>
    )
}

interface ServiceWithSubServicesPreviewProps {
    service: ServicePreviewProps["service"];
    subServices?: ServicePreviewProps["subServices"];
    onPress: ServicePreviewProps["onPress"];
}

export function ServiceWithSubServicesPreview({ service, subServices, onPress }: ServiceWithSubServicesPreviewProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const earnings = subServices && subServices?.map(subService => subService.price).reduce((a, b) => a + b, 0);

    return (
        <View className="flex-col w-full items-center justify-between">
            <Container>
                <TouchableOpacity activeOpacity={0.8} className="flex-row h-full flex-1" onPress={onPress}>
                    <InfoHolderLeft width={50}>
                        <Text className='absolute font-black text-[42px] opacity-20 flex-nowrap whitespace-nowrap text-text_light-100 dark:text-white'>
                            R$
                        </Text>
                        <Text className='font-black text-2xl flex-nowrap whitespace-nowrap text-black dark:text-white' numberOfLines={1}>
                            {earnings}
                        </Text>
                    </InfoHolderLeft>
                    <Line />
                    <MainInfo service={service} subServices={subServices} />
                </TouchableOpacity>
                {
                    subServices && subServices?.length > 0 && (
                        <InfoHolderRight onPress={() => setIsExpanded(!isExpanded)}>
                            <MaterialIcons
                                name={"keyboard-arrow-down"}
                                style={{
                                    transform: isExpanded ? [{ rotate: "180deg" }] : [{ rotate: "0deg" }],
                                    paddingLeft: isExpanded ? 0 : 15,
                                    paddingRight: isExpanded ? 15 : 0,
                                }}
                                size={16}
                                color={colors.text[100]}
                            />
                        </InfoHolderRight>
                    )
                }
            </Container>
            {
                isExpanded && subServices && subServices?.map(subService => (
                    <View className="mb-3" key={subService.id}>
                        <PreviewStatic
                            palette="light"
                            padding="small"
                            subService={subService}
                        />
                    </View>
                ))
            }
        </View>
    )
}