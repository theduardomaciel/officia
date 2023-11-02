import React, { useCallback, useEffect, useMemo } from "react";
import colors from "global/colors";

import { MaterialIcons } from "@expo/vector-icons";

// Components
import Container from "components/Container";
import SectionBottomSheet from "components/Form/SectionBottomSheet";
import Toast from "components/Toast";
import { SectionsNavigator } from "components/SectionsNavigator";

import {
    BasicInfoForm,
    fetchSegments,
} from "screens/Main/Business/screens/BasicInfo";
import { ActionButton } from "components/Button";

import {
    BasicInfoSchemeType,
    BusinessData,
    FormRef,
    ServiceSchemeType,
} from "screens/Main/Business/@types";

// Hooks
import useBackHandler from "hooks/useBackHandler";
import useUpdateHandler from "hooks/useUpdateHandler";
import { useAuth, userStorage } from "context/AuthContext";

import { api } from "lib/axios";

const sections = [
    "registerSection0BottomSheet",
    "registerSection1BottomSheet",
    "registerSection2BottomSheet",
];

import { ProjectModel } from "database/models/project.model";
import Modal, { Section } from "components/Modal";
import { Text, View } from "react-native";
import BottomSheet from "components/BottomSheet";

export default function BusinessRegister({ navigation }: any) {
    const { signOut } = useAuth();

    const HEADERS = [
        {
            title: "Vamos começar com o básico.",
            subtitle:
                "Insira os dados básicos que caracterizam o seu empreendimento como ele é.",
        },
        {
            title: "Seus clientes precisam de dados.",
            subtitle:
                "Insira as informações que serão exibidas para elevar a confiabilidade de sua empresa.",
        },
    ];

    const { updateHandler, selectedSectionId, Header, BackButton } =
        useUpdateHandler({
            sections,
            HEADERS,
            onLimitReached: () => {
                navigation.goBack();
            },
        });

    const { ConfirmExitModal } = useBackHandler({
        onBack: () => {
            updateHandler(selectedSectionId.value - 1);
        },
        shouldTriggerModal: () => {
            return selectedSectionId.value === 0;
        },
        onExitConfirm: () => {
            navigation.goBack();
        },
    });

    const onError = useCallback((error: any) => {
        Toast.show({
            preset: "error",
            title: "Opa! Algo deu errado.",
            description: error.message,
        });
    }, []);

    const newBusinessData = React.useRef<Partial<BusinessData> | undefined>(
        undefined
    );

    const [submitModalSection, setSubmitModalSection] = React.useState(0);

    const basicInfoFormRef = React.useRef<FormRef>(null);
    const serviceFormRef = React.useRef<FormRef>(null);

    const onBasicInfoFormSubmit = async (data: Partial<BusinessData>) => {
        if (data) {
            updateHandler(1);
            newBusinessData.current = {
                ...newBusinessData.current,
                ...data,
            };
        } else return;
    };

    const onServiceFormSubmit = async (data: Partial<BusinessData>) => {
        if (!data) return;

        if (!newBusinessData.current) {
            onError({
                message:
                    "Há dados pendentes na seção anterior a serem preenchidos.",
            });
            return;
        }

        const accountId = userStorage.getString("id");
        if (!accountId) {
            console.log("Invalid account id stored in device.");
            signOut();
            return;
        }

        const finalData = {
            ...newBusinessData.current,
            ...data,
            accountId: accountId,
        };

        console.log(finalData, "Dados enviados para o servidor.");

        try {
            setSubmitModalSection(1);

            const response = await api.post("/projects", finalData);
            if (!response.data) {
                setSubmitModalSection(0);
                onError({
                    message:
                        "Infelizmente nos deparamos com um erro ao criar seu novo negócio.",
                });
                return;
            }

            newBusinessData.current = response.data;
            BottomSheet.close(sections[1]);
            setSubmitModalSection(2);
        } catch (error) {
            onError(error);
            setSubmitModalSection(0);
        }
    };

    const modalSections = useCallback(
        () => getModalSections(newBusinessData),
        []
    );

    const BOTTOM_SHEET_HEIGHT = "65%";

    useEffect(() => {
        const getSegmentsData = async () => {
            globalStorage.set("segmentsData", "pending");
            try {
                const response = await fetchSegments();
                if (response) {
                    globalStorage.set("segmentsData", JSON.stringify(response));
                } else {
                    globalStorage.delete("segmentsData");
                }
            } catch (error) {
                globalStorage.delete("segmentsData");
                console.log(error);
            }
        };

        const getCountriesData = async () => {
            globalStorage.set("countriesData", "pending");
            try {
                const response = await fetchCountries();
                if (response) {
                    globalStorage.set(
                        "countriesData",
                        JSON.stringify(response)
                    );
                } else {
                    globalStorage.delete("countriesData");
                }
            } catch (error) {
                globalStorage.delete("countriesData");
                console.log(error);
            }
        };

        if (!globalStorage.getString("segmentsData")) {
            getSegmentsData();
        }
        if (!globalStorage.getString("countriesData")) {
            getCountriesData();
        }
    }, []);

    return (
        <Container style={{ rowGap: 0 }}>
            <BackButton />
            <Header />

            <SectionsNavigator
                selectedId={selectedSectionId}
                sections={[
                    {
                        id: 0,
                        title: "Sua Empresa",
                        onPress: () =>
                            selectedSectionId.value === 1 && updateHandler(0),
                    },
                    {
                        id: 1,
                        title: "Atendimento",
                        onPress: () =>
                            selectedSectionId.value === 0 && updateHandler(1),
                    },
                ]}
            />

            <SectionBottomSheet
                id={sections[0]}
                defaultValues={{
                    expanded: true,
                }}
                height={BOTTOM_SHEET_HEIGHT}
                ignoreBottomRequirementToFixContentHeight
            >
                <BasicInfoForm
                    ref={basicInfoFormRef}
                    onSubmit={onBasicInfoFormSubmit}
                    palette="dark"
                />
                <ActionButton
                    onPress={() => basicInfoFormRef.current?.submitForm()}
                    preset="next"
                    label="Próximo"
                />
            </SectionBottomSheet>

            <SectionBottomSheet id={sections[1]} height={BOTTOM_SHEET_HEIGHT}>
                <ServiceForm
                    ref={serviceFormRef}
                    onSubmit={onServiceFormSubmit}
                />
                <ActionButton
                    onPress={() => serviceFormRef.current?.submitForm()}
                    preset="next"
                    style={{ backgroundColor: colors.primary }}
                    label="Concluir"
                />
            </SectionBottomSheet>

            <Modal.Multisection
                currentSection={submitModalSection}
                sections={modalSections()}
                setCurrentSection={setSubmitModalSection}
            />

            <ConfirmExitModal
                title="Você tem certeza que deseja voltar?"
                description="Será necessário inserir os dados do Seu Negócio novamente para concluir o cadastro."
            />
        </Container>
    );
}

function getModalSections(
    data: React.MutableRefObject<Partial<BusinessData> | undefined>
) {
    const { updateSelectedProject } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);

    return [
        {
            title: "Aguarde...",
            description:
                "Estamos terminando os últimos ajustes para que o novo negócio seja adicionado à sua conta.",
            icon: "pending",
            isLoading: true,
        },
        {
            children: (
                <View className="flex-col w-full items-center justify-start">
                    <MaterialIcons
                        name="check-circle-outline"
                        size={36}
                        color={colors.white}
                    />
                    <Text className="font-titleBold text-2xl text-white text-center mb-4">
                        Seu novo negócio já está pronto.
                    </Text>
                    <Text className="text-left font-regular text-sm text-white whitespace-pre-line">
                        Muitas coisas ainda podem ser configuradas para
                        transmitir ainda mais confiabilidade para seus clientes,
                        no entanto, tudo já está pronto para uso.{`\n`}
                        {`\n`}
                        Acesse já o app e torne mais simples a maneira como sua
                        empresa é gerenciada.
                    </Text>
                </View>
            ),
            buttons: [
                {
                    label: "Acessar",
                    onPress: async () => {
                        setIsLoading(true);
                        await updateSelectedProject(
                            data.current?.id as string,
                            data.current as ProjectModel
                        );
                    },
                },
            ],
            isLoading: isLoading,
        },
    ] as Section[];
}
