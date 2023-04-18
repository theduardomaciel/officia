import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	BackHandler,
	TouchableOpacity,
	View,
	Text,
	useWindowDimensions,
} from "react-native";

import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";

import DatePicker from "react-native-date-picker";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container from "components/Container";
import Toast from "components/Toast";
import BottomSheet from "components/BottomSheet";
import SectionBottomSheet from "components/ScheduleForm/SectionBottomSheet";
import { SectionsNavigator } from "components/SectionsNavigator";

import Modal, { ModalProps } from "components/Modal";
import { ActionButton } from "components/Button";

// Form
import { Controller, SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AuthData, GENDER, useAuth } from "context/AuthContext";
import ConfirmExitModal from "components/Business/ConfirmExitModal";
import Input from "components/Input";
import { borderErrorStyle } from "utils/errorBorderStyle";
import formatWithMask from "utils/formatWithMask";
import { MASKS } from "utils/formatWithMask";
import { useColorScheme } from "nativewind";

export const personalDataScheme = z.object({
	name: z
		.string({ required_error: "O nome inserido é inválido." })
		.max(65, { message: "O nome inserido é muito grande." }),
	phone: z
		.string({
			required_error: "É necessário inserir um número de telefone.",
		})
		.min(10)
		.max(10),
	cpf: z
		.string({
			required_error: "É necessário inserir um número de CPF.",
		})
		.min(11)
		.max(11),
});

export type PersonalDataSchemeType = z.infer<typeof personalDataScheme>;

export const loginDataScheme = z
	.object({
		email: z
			.string({
				required_error: "É necessário inserir um e-mail válido.",
			})
			.email({ message: "O e-mail inserido não é válido." }),
		password: z
			.string({
				required_error: "É necessário inserir uma senha válida.",
			})
			.min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
		confirmPassword: z.string().min(8),
	})
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				code: "custom",
				message: "As senhas não correspondem.",
			});
		}
	});

export type LoginDataSchemeType = z.infer<typeof loginDataScheme>;

const SPRING_OPTIONS = {
	damping: 100,
	stiffness: 400,
};

export default function Register({ route, navigation }: any) {
	const { email } = route.params;
	const { width } = useWindowDimensions();
	const { signIn } = useAuth();

	const section0BottomSheet = "registerSection0BottomSheet";
	const section1BottomSheet = "registerSection1BottomSheet";
	const section2BottomSheet = "registerSection2BottomSheet";

	const sections = [
		section0BottomSheet,
		section1BottomSheet,
		section2BottomSheet,
	];

	const [partialAccountData, setPartialAccountData] = React.useState<
		PersonalDataSchemeType | undefined
	>(undefined);

	const [selectedSection, setSelectedSection] = useState(0);
	const selectedSectionId = useSharedValue(0);
	const headerPosition = useSharedValue(0);

	const HEADERS = [
		{
			title: "Estamos aqui para criar sua conta.",
			subtitle:
				"Insira seus dados pessoais para que o seu primeiro negócio possa ser adicionado.",
		},
		{
			title: "Agora só faltam os dados de entrada.",
			subtitle:
				"Insira seus dados de entrada na conta. Cuidado para não esquecer essas informações!",
		},
		{
			title: "Voilà! Sua conta já está pronta para ser usada!",
			subtitle:
				"Agora, chegou a hora de adicionarmos um negócio para administrar a ela.",
		},
	];

	const updateHandler = useCallback((id: number) => {
		if (sections[selectedSectionId.value] && sections[id] && id >= 0) {
			// Bottom Sheet Animation
			BottomSheet.close(sections[selectedSectionId.value]);

			if (id > selectedSectionId.value) {
				selectedSectionId.value = withSpring(id, SPRING_OPTIONS);
				headerPosition.value = withSpring(
					-width,
					SPRING_OPTIONS,
					() => {
						runOnJS(setSelectedSection)(id);
						headerPosition.value = withSequence(
							withTiming(width, { duration: 0 }),
							withSpring(0, SPRING_OPTIONS)
						);
					}
				);
			} else {
				selectedSectionId.value = withSpring(id, SPRING_OPTIONS);
				// id < selectedSectionId.value - animação reversa
				headerPosition.value = withSpring(width, SPRING_OPTIONS, () => {
					runOnJS(setSelectedSection)(id);
					headerPosition.value = withSequence(
						withTiming(-width, { duration: 0 }),
						withSpring(0, SPRING_OPTIONS)
					);
				});
			}

			BottomSheet.expand(sections[id]);
		} else {
			navigation.goBack();
		}
	}, []);

	const headerAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateX: headerPosition.value,
				},
			],
		};
	});

	const [confirmExitModalVisible, setConfirmExitModalVisible] =
		useState(false);

	useEffect(() => {
		const backAction = () => {
			if (selectedSection !== 0) {
				updateHandler(selectedSection - 1);
				return false;
			}
			setConfirmExitModalVisible(true);
			return true;
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);

		BottomSheet.expand(section0BottomSheet);

		return () => backHandler.remove();
	}, []);

	const {
		handleSubmit: section0HandleSubmit,
		control: section0Control,
		formState: { errors: section0Errors },
	} = useForm<PersonalDataSchemeType>({
		mode: "onSubmit",
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
		resolver: zodResolver(personalDataScheme),
	});

	const [isDatePickerVisible, setDatePickerModalVisible] = useState(false);
	const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);

	const {
		handleSubmit: section1HandleSubmit,
		control: section1Control,
		formState: { errors: section1Errors },
		setValue,
		getValues,
	} = useForm<LoginDataSchemeType>({
		mode: "onSubmit",
		defaultValues: {
			email: email ?? undefined,
		},
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
		resolver: zodResolver(loginDataScheme),
	});

	const onError: SubmitErrorHandler<
		PersonalDataSchemeType & LoginDataSchemeType
	> = (errors, e) => {
		//console.log(errors)
		//setFocus(Object.keys(errors)[0] as unknown as keyof BasicInfoSchemeType)
		Toast.show({
			preset: "error",
			title: "Algo está errado com os dados inseridos.",
			message: Object.values(errors)
				.map((error) => error.message)
				.join("\n"),
		});
	};

	const submitSection0Data = section0HandleSubmit(async (data) => {
		setPartialAccountData(
			data /* (prevState) => ({ ...prevState, ...data }) */
		);
		updateHandler(1);
	}, onError);

	const showErrorToast = useCallback((message?: string) => {
		Toast.show({
			preset: "error",
			title: "Algo deu errado.",
			message:
				message ??
				"Não foi possível criar sua conta. Tente novamente mais tarde.",
		});
	}, []);

	const [gender, setGender] = useState<GENDER>("other");

	const submitSection1Data = section1HandleSubmit(async (data) => {
		const { email, password } = data;

		if (!partialAccountData) showErrorToast();

		const registerData = {
			...partialAccountData!,
			gender,
		};

		if (data) {
			console.log(registerData);
			updateHandler(2);
			/* const response = signIn({
				email,
				password,
				registerData,
			});
			if (response) {
				updateHandler(2);
			} else {
                showErrorToast();
				updateHandler(0);
			} */
		} else {
			showErrorToast();
			updateHandler(0);
		}
	}, onError);

	const BOTTOM_SHEET_HEIGHT = "62%";

	return (
		<Container style={{ rowGap: 10 }}>
			<View className="w-full flex-col items-center justify-center">
				<TouchableOpacity
					className="flex-row bg-gray-200 items-center justify-center rounded-sm p-[5px]"
					style={{ columnGap: 5 }}
					onPress={() =>
						selectedSectionId.value >= 0 &&
						updateHandler(selectedSectionId.value - 1)
					}
				>
					<MaterialIcons
						name="arrow-back"
						size={14}
						color={colors.white}
					/>
					<Text className="text-white text-sm">Voltar</Text>
				</TouchableOpacity>
			</View>

			<Animated.View
				className="flex-col items-center justify-center"
				style={[headerAnimatedStyle, { rowGap: 10 }]}
			>
				<Text className="font-logoRegular leading-[95%] text-4xl text-white text-center w-5/6">
					{HEADERS[selectedSection].title}
				</Text>
				<Text className="text-white text-sm font-semibold text-center">
					{HEADERS[selectedSection].subtitle}
				</Text>
			</Animated.View>

			<SectionsNavigator
				selectedId={selectedSectionId}
				sections={[
					{
						id: 0,
						title: "Dados Iniciais",
						onPress: () =>
							selectedSection === 1 && updateHandler(0),
					},
					{
						id: 1,
						title: "Login",
					},
					{
						id: 2,
						title: "Conclusão",
					},
				]}
			/>

			<SectionBottomSheet
				bottomSheet={section0BottomSheet}
				expanded={false}
				bottomSheetHeight={BOTTOM_SHEET_HEIGHT}
			>
				<Controller
					control={section0Control}
					render={({ field: { onChange, onBlur, value } }) => (
						<Input
							label="Nome"
							onBlur={onBlur}
							onChangeText={(value) => onChange(value)}
							value={value}
							style={!!section0Errors.name && borderErrorStyle}
							placeholder="Fulano da Silva"
							maxLength={50}
							pallette="dark"
						/>
					)}
					name="name"
				/>
				<Controller
					control={section0Control}
					render={({ field: { onChange, onBlur, value } }) => (
						<Input
							label="Celular"
							placeholder="(XX) XXXXX-XXXX"
							onBlur={onBlur}
							onChangeText={(value) => {
								const { masked } = formatWithMask({
									text: value,
									mask: MASKS.BRL_PHONE,
								});
								onChange(masked);
							}}
							value={value}
							style={!!section0Errors.phone && borderErrorStyle}
							maxLength={50}
							pallette="dark"
						/>
					)}
					name="phone"
				/>
				<Input
					label="Data de Nascimento"
					value={birthDate?.toLocaleDateString("pt-BR") ?? ""}
					onPress={() => setDatePickerModalVisible(true)}
					editable={false}
					pallette="dark"
				/>
				<ActionButton
					onPress={submitSection0Data}
					preset="next"
					label="Próximo"
				/>
			</SectionBottomSheet>

			<SectionBottomSheet
				bottomSheet={section1BottomSheet}
				expanded={false}
				bottomSheetHeight={BOTTOM_SHEET_HEIGHT}
			>
				<ActionButton
					onPress={submitSection1Data}
					preset="next"
					label="Próximo"
				/>
			</SectionBottomSheet>

			<SectionBottomSheet
				bottomSheet={section2BottomSheet}
				expanded={false}
				bottomSheetHeight={BOTTOM_SHEET_HEIGHT}
			>
				<ActionButton
					onPress={submitSection1Data}
					preset="next"
					style={{ backgroundColor: colors.primary }}
					label="Concluir"
				/>
			</SectionBottomSheet>
			<ConfirmExitModal
				isVisible={confirmExitModalVisible}
				onExitConfirmation={() => navigation.goBack()}
				toggleVisibility={() => setConfirmExitModalVisible(false)}
			/>
			<DatePickerModal
				isVisible={isDatePickerVisible}
				toggleVisibility={() => setDatePickerModalVisible(false)}
				onDateChange={(date) => setBirthDate(date)}
			/>
		</Container>
	);
}

interface DatePickerModal {
	isVisible: boolean;
	toggleVisibility: ModalProps["toggleVisibility"];
	onDateChange: (date: Date | undefined) => void;
}

function DatePickerModal({
	isVisible,
	toggleVisibility,
	onDateChange,
}: DatePickerModal) {
	const { colorScheme } = useColorScheme();

	const newDate = useRef(new Date());

	const onChange = useCallback((date: Date) => {
		newDate.current = date;
	}, []);

	const onConfirm = () => {
		toggleVisibility();
		onDateChange(newDate.current);
	};

	const onClean = () => {
		toggleVisibility();
		onDateChange(undefined);
	};

	return (
		<Modal
			isVisible={isVisible}
			toggleVisibility={toggleVisibility}
			title={"Selecione a data de nascimento"}
			icon="calendar-today"
			buttons={[
				{
					label: "Cancelar",
					onPress: onClean,
					closeOnPress: true,
					color: colors.red,
				},
				{
					label: "Confirmar",
					onPress: onConfirm,
					closeOnPress: true,
				},
			]}
		>
			<View className="flex flex-1 w-full items-center justify-center">
				<DatePicker
					date={newDate.current}
					onDateChange={onChange}
					fadeToColor={
						colorScheme === "light"
							? colors.white
							: colors.gray[200]
					}
					androidVariant="nativeAndroid"
					mode="date"
				/>
			</View>
		</Modal>
	);
}
