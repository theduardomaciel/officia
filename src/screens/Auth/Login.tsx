import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    useWindowDimensions,
    Linking,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { MOBILE_TOKEN } from "@env";

// Visuals
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

import Logo from "src/assets/logo.svg";
import DeactivationIcon from "src/assets/icons/deactivation.svg";

// Components
import Input from "components/Input";
import BottomSheet from "components/BottomSheet";
import { ActionButton } from "components/Button";
import { ErrorStatus, Loading } from "components/StatusMessage";

// Animations
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming,
} from "react-native-reanimated";

// Authentication
import { api } from "lib/axios";
import { Account, useAuth } from "context/AuthContext";
import Modal, { MultisectionModalProps } from "components/Modal";
import { LinearGradient } from "expo-linear-gradient";

const QUOTES = [
    {
        title: "Simplicidade.",
        description:
            "Estamos aqui para unir tudo que o seu negócio precisa em um só lugar.",
    },
];

const validateEmail = async (email: string) => {
    const isValid = String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );

    try {
        console.log(MOBILE_TOKEN);
        const response = await api.get(`/accounts?email=${email}`, {
            headers: {
                Authorization: `Bearer ${MOBILE_TOKEN}`,
            },
        });

        if (response.data) {
            return {
                status: "account_already_exists",
                data: response.data,
            }; // Account already exists
        } else {
            return { status: !!isValid };
        }
    } catch (error: any) {
        console.log(error);
        if (error.response && error.response.data.statusCode === 404) {
            return { status: !!isValid };
        } else {
            const state = await NetInfo.fetch();
            if (state.isConnected === false) {
                return { status: "network_error" };
            } else {
                return { status: "error" };
            }
        }
    }
};

const SPRING_CONFIG = {
    damping: 5,
    mass: 0.1,
    stiffness: 25,
};

export default function Login({ navigation }: any) {
    const inserts = useSafeAreaInsets();
    const { height } = useWindowDimensions();

    const { id, signIn } = useAuth();

    const RANDOM_QUOTE_INDEX = Math.floor(Math.random() * QUOTES.length);

    const viewPosition = useSharedValue(0);
    const viewAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: withSpring(viewPosition.value, SPRING_CONFIG),
                },
            ],
        };
    });

    const [isOnline, setIsOnline] = React.useState(true);
    const inputRef = React.useRef("");

    const [account, setAccount] = React.useState<Account | undefined>(
        undefined
    );
    const [status, setStatus] = React.useState<
        "loading" | "invalid" | "error" | undefined
    >(undefined);

    const handleLogin = useCallback(async () => {
        setStatus("loading");
        const isValid = await validateEmail(inputRef.current);

        switch (isValid.status) {
            case "account_already_exists":
                setAccount(isValid.data);
                setStatus(undefined);
                viewPosition.value = withSpring(-height / 8, SPRING_CONFIG);
                BottomSheet.expand("loginBottomSheet");
                break;
            case "network_error":
                setIsOnline(false);
                setStatus(undefined);
                break;
            case "error":
                setStatus("error");
                break;
            case true:
                setStatus(undefined);
                navigation.replace("register", { email: inputRef.current });
                break;
            default:
                setStatus("invalid");
                break;
        }
    }, []);

    const refreshConnection = useCallback(async () => {
        setStatus("loading");

        const state = await NetInfo.fetch();

        setIsOnline(state.isConnected === true);
        setStatus(undefined);
    }, []);

    /* useEffect(() => {
		NetInfo.fetch().then((state) => {
			setIsOnline(state.isConnected === true);
		});
	}, []); */

    return (
        <>
            <LinearGradient
                colors={["#1f1c1c", "#292929"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="flex-1"
            >
                <View className="flex-1 min-h-full px-6 items-center justify-center">
                    <View className="flex flex-col items-center justify-center w-full">
                        <Animated.View
                            className="flex-col items-center justify-center w-3/4 mb-16"
                            style={viewAnimatedStyle}
                        >
                            <Logo className="mb-24" />
                            <Text className="font-logoRegular text-4xl text-center mb-4 text-white">
                                {QUOTES[RANDOM_QUOTE_INDEX].title}
                            </Text>
                            <Text className="font-semibold text-center leading-5 text-white">
                                {QUOTES[RANDOM_QUOTE_INDEX].description}
                            </Text>
                        </Animated.View>
                        {isOnline ? (
                            <View className="flex flex-col items-center justify-center w-full">
                                <View className="w-full">
                                    <Input
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        placeholder="Continue inserindo o seu e-mail"
                                        onChangeText={(text: string) =>
                                            (inputRef.current = text)
                                        }
                                    />
                                </View>
                                <TouchableOpacity
                                    className="rounded w-full py-4 items-center justify-center bg-gray-200 mt-4"
                                    activeOpacity={0.8}
                                    disabled={status === "loading"}
                                    onPress={handleLogin}
                                >
                                    {status === "loading" ? (
                                        <ActivityIndicator
                                            color={colors.primary}
                                            size="small"
                                        />
                                    ) : (
                                        <Text className="text-center font-semibold text-white">
                                            Continuar
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                {status === "invalid" ? (
                                    <Text className="absolute -bottom-14 left-0 w-full text-center text-red">
                                        O e-mail inserido é inválido.
                                    </Text>
                                ) : status === "error" ? (
                                    <Text className="absolute -bottom-14 left-0 w-full text-center text-red opacity-80">
                                        Não foi possível entrar em contato com
                                        nossos servidores.
                                        {"\n"}
                                        Tente novamente mais tarde.
                                    </Text>
                                ) : (
                                    <TouchableOpacity
                                        className="absolute -bottom-14 left-0 w-full"
                                        onPress={() =>
                                            id ? navigation.goBack() : signIn()
                                        }
                                    >
                                        <Text className="w-full text-center text-text-200 opacity-80">
                                            Continuar como convidado
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            <ErrorStatus
                                onPress={refreshConnection}
                                isLoading={status === "loading"}
                            >
                                <Text className="w-full text-center text-text-200 opacity-80 mb-4">
                                    É necessário ter uma conexão ativa com a
                                    Internet para fazer login ou registrar-se.
                                    {"\n"}
                                    <Text className="font-semibold">
                                        Tente conectar-se novamente
                                    </Text>
                                </Text>
                            </ErrorStatus>
                        )}
                    </View>
                    <View
                        className="flex-col bg-transparent w-screen absolute bottom-0-0 left-0 items-center justify-center"
                        style={{
                            bottom: inserts.bottom ? inserts.bottom + 25 : 25,
                            left: 0,
                        }}
                    >
                        <View className="border-t border-dashed border-t-gray-100 w-24 mb-2 h-1" />
                        <Text className="w-full text-center text-xs text-gray-100">
                            officia v0.2.3.early-access
                        </Text>
                    </View>
                </View>
            </LinearGradient>
            <BottomSheet
                height={"50%"}
                id={"loginBottomSheet"}
                onDismiss={() => {
                    console.log("dismissed");
                    viewPosition.value = withSpring(0, SPRING_CONFIG);
                }}
                colors={{
                    background: colors.gray[500],
                    backdrop: "rgba(0, 0, 0, 0)",
                }}
            >
                <LoginBottomSheet account={account} navigation={navigation} />
            </BottomSheet>
        </>
    );
}

function LoginBottomSheet({
    account,
    navigation,
}: {
    account?: Account;
    navigation: any;
}) {
    const { signIn } = useAuth();

    const [status, setStatus] = useState<
        "error" | "serverError" | "pending" | undefined
    >(undefined);

    const [isPasswordHidden, setIsPasswordHidden] = useState(true);
    const [password, setPassword] = useState("");
    const [deactivatedAt, setDeactivatedAt] = useState<Date | undefined>(
        undefined
    );

    async function checkLogin() {
        setStatus("pending");
        if (!account) return setStatus("serverError");
        try {
            await signIn({
                email: account.email,
                password: password,
            });
            BottomSheet.close("loginBottomSheet");
            console.log("logged in");
        } catch (error: any) {
            // Caso a conta esteja desativada, o código de erro será 403
            if (error.code === 403) {
                setReactivateAccountModalCurrentSection(1);
                setDeactivatedAt(new Date(error.message));
                setStatus(undefined);
                // Caso a senha esteja incorreta, o código de erro será 401
            } else if (error.code === 401) {
                setStatus("error");
                // Caso contrário, um erro inesperado ocorreu
            } else {
                setStatus("serverError");
            }
        }
    }

    const [
        reactivateAccountModalCurrentSection,
        setReactivateAccountModalCurrentSection,
    ] = useState(0);

    if (!account) {
        return <Loading />;
    }

    return (
        <View
            className="flex flex-1 items-center justify-center relative"
            style={{
                paddingLeft: 24,
                paddingRight: 24,
                paddingBottom: 12,
                rowGap: 20,
            }}
        >
            <View className="w-full flex-row items-center justify-start">
                <View className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mr-4">
                    <MaterialIcons
                        name="person"
                        size={28}
                        color={colors.text[100]}
                    />
                </View>
                <View className="flex-col items-start justify-start">
                    <Text className="font-titleBold text-text-100 text-base">
                        {account?.name ?? "Nome não informado"}
                    </Text>
                    <Text className="text-sm text-text-200">
                        {account?.email}
                    </Text>
                </View>
            </View>
            <Input
                label="Senha"
                onChangeText={setPassword}
                secureTextEntry={isPasswordHidden}
                autoCapitalize="none"
                labelChildren={
                    status === "error" && (
                        <Text className="text-right text-xs text-red opacity-80">
                            A senha inserida está incorreta.
                        </Text>
                    )
                }
            >
                <TouchableOpacity
                    className="p-2 absolute right-2 top-[12.5%]"
                    activeOpacity={0.7}
                    onPress={() => setIsPasswordHidden(!isPasswordHidden)}
                >
                    <MaterialCommunityIcons
                        name={
                            isPasswordHidden ? "eye-off-outline" : "eye-outline"
                        }
                        color={colors.gray[100]}
                        size={20}
                    />
                </TouchableOpacity>
            </Input>
            <ActionButton
                preset="next"
                label="Entrar"
                textProps={{
                    style: {
                        fontFamily: "AbrilFatface_400Regular",
                    },
                }}
                style={{
                    opacity: password?.length < 1 ? 0.5 : 1,
                }}
                isLoading={status === "pending"}
                disabled={password?.length < 1 || status === "pending"}
                onPress={checkLogin}
            />
            {status === "serverError" && (
                <Text className="text-center text-xs text-red opacity-80">
                    Um erro inesperado ocorreu. Tente novamente mais tarde.
                </Text>
            )}
            <View
                style={{
                    borderBottomWidth: 1,
                    width: "50%",
                    height: 1,
                    backgroundColor: "transparent",
                    borderStyle: "dashed",
                    borderColor: colors.gray[100],
                }}
            />
            <TouchableOpacity
                onPress={() =>
                    Linking.openURL("https://officia.vercel.app/password-reset")
                }
                activeOpacity={0.7}
            >
                <Text className="w-full text-center text-xs text-gray-100">
                    Esqueceu sua senha?
                </Text>
            </TouchableOpacity>

            <ReactivateAccountModal
                currentSection={reactivateAccountModalCurrentSection}
                setCurrentSection={setReactivateAccountModalCurrentSection}
                data={{
                    email: account.email,
                    password: password,
                    deactivatedAt: deactivatedAt,
                }}
            />
        </View>
    );
}

const MONTHS_TO_EXPIRE = 6;
const geMonthsAndDaysRemainingToExpire = (deactivatedAt: Date) => {
    const currentDate = new Date();
    const deactivatedDate = deactivatedAt;
    const monthsRemaining =
        MONTHS_TO_EXPIRE -
        (currentDate.getMonth() - deactivatedDate.getMonth());
    const daysRemaining =
        30 - (currentDate.getDate() - deactivatedDate.getDate());
    return { monthsRemaining, daysRemaining };
};
/* (deactivatedAt: Date) => {
    const now = new Date()
    const diff = Math.abs(deactivatedAt.getTime() - now.getTime())
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    const months = Math.floor(days / 30)
    const daysRemaining = days % 30
    return { months, daysRemaining }
} */

function ReactivateAccountModal({
    currentSection,
    setCurrentSection,
    data,
}: {
    currentSection: MultisectionModalProps["currentSection"];
    setCurrentSection: MultisectionModalProps["setCurrentSection"];
    data: {
        email: string;
        password: string;
        deactivatedAt?: Date;
    };
}) {
    const { signIn } = useAuth();

    const { monthsRemaining, daysRemaining } = geMonthsAndDaysRemainingToExpire(
        data.deactivatedAt ?? new Date()
    );

    async function handleReactivateAccount() {
        setCurrentSection(2);
        await signIn(data);
    }

    function handleCancel() {
        setCurrentSection(0);
    }

    return (
        <Modal.Multisection
            setCurrentSection={setCurrentSection}
            currentSection={currentSection}
            sections={[
                {
                    children: (
                        <>
                            <View
                                className="flex-col items-center justify-center w-full"
                                style={{ rowGap: 10 }}
                            >
                                <DeactivationIcon fill={colors.white} />
                                <Text className="text-white text-2xl font-logoRegular text-center max-w-[80%] leading-[95%]">
                                    Sua conta está sendo desativada.
                                </Text>
                            </View>
                            <Text className="text-white text-[15px] text-left my-2">
                                Você começou o processo de desativação de sua
                                conta em{" "}
                                {data.deactivatedAt?.toLocaleDateString(
                                    "pt-BR",
                                    {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    }
                                )}
                                .{`\n\n`}
                                Ainda restam{" "}
                                <Text className="font-bold">
                                    {monthsRemaining}{" "}
                                    {monthsRemaining > 1 ? "meses" : "mês"}
                                    {monthsRemaining !== 6 ||
                                        (daysRemaining < 30 &&
                                            `e ${daysRemaining} ${
                                                daysRemaining > 1
                                                    ? "dias"
                                                    : "dia"
                                            }`)}
                                </Text>{" "}
                                antes que a conta possa ser excluída
                                permanentemente.{`\n\n`}
                                Caso deseje, você pode interromper a desativação
                                agora e voltar a usar sua conta{" "}
                                <Text className="font-logoRegular">
                                    officia
                                </Text>{" "}
                                normalmente.
                            </Text>
                        </>
                    ),
                    buttons: [
                        {
                            label: "Reativar minha conta",
                            onPress: handleReactivateAccount,
                            color: colors.primary,
                        },
                        {
                            label: "Manter a conta desativada",
                            onPress: handleCancel,
                            color: colors.gray[100],
                        },
                    ],
                    buttonsDirection: "column",
                },
                {
                    icon: "pending",
                    title: "Estamos reativando a sua conta...",
                    description:
                        "Aguarde um momento enquanto reativamos a sua conta. Você será autenticado automaticamente no app assim que o processo for concluído.",
                    isLoading: true,
                },
            ]}
        />
    );
}
