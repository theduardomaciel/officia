import { useCallback, useRef, useState } from "react";
import { Keyboard, Text, View } from "react-native";
import DatePicker from "react-native-date-picker";

import { useColorScheme } from "nativewind";
import colors from "global/colors";

// Components
import Modal, { ModalProps } from "components/Modal";
import Input, { Trigger, borderErrorStyle } from "components/Input";
import ToggleGroup from "components/ToggleGroup";
import Toast from "components/Toast";
import { SubSectionWrapper } from "components/Form/SectionWrapper";
import { ActionButton } from "components/Button";

// Form
import { Controller, SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import formatWithMask, { MASKS } from "utils/maskHandler";

// Utils
import { genderOptions } from "global/constants";
import { isAdult } from "utils";

// Types
import type { GENDER } from "context/AuthContext";

export const personalDataScheme = z.object({
	name: z
		.string({ required_error: "O nome inserido é inválido." })
		.max(65, { message: "O nome inserido é muito grande." }),
	phone: z
		.string({
			required_error:
				"É necessário inserir um número de telefone válido.",
		})
		.min(15, "É necessário inserir um número de telefone válido.")
		.max(15, "É necessário inserir um número de telefone válido."),
});

type PersonalDataSchemeInputsType = z.infer<typeof personalDataScheme>;

export interface PersonalDataSchemeType extends PersonalDataSchemeInputsType {
	birthday: Date | undefined;
	gender: GENDER | null;
}

interface Props {
	onSubmit: (data: PersonalDataSchemeType) => void;
}

export default function RegisterSection0({ onSubmit }: Props) {
	const [isDatePickerVisible, setDatePickerModalVisible] = useState(false);

	const {
		handleSubmit: section0HandleSubmit,
		control: control,
		formState: { errors: errors },
	} = useForm<PersonalDataSchemeType>({
		mode: "onSubmit",
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
		resolver: zodResolver(personalDataScheme),
	});

	const onError: SubmitErrorHandler<PersonalDataSchemeType> = (errors, e) => {
		//console.log(errors)
		//setFocus(Object.keys(errors)[0] as unknown as keyof BasicInfoSchemeType)
		Toast.show({
			preset: "error",
			title: "Algo está errado com os dados inseridos.",
			description: Object.values(errors)
				.map((error) => error.message)
				.join("\n"),
		});
	};

	const [birthday, setBirthday] = useState<Date | undefined>(undefined);
	const [gender, setGender] = useState<GENDER | null>(null);

	const submitSection0Data = section0HandleSubmit((data) => {
		let errorsMessage = "";
		if (!birthday) {
			errorsMessage += `É necessário inserir uma data de nascimento. \n`;
		}

		if (birthday && !isAdult(birthday)) {
			errorsMessage += `É necessário ser maior de idade para criar uma conta.${
				errorsMessage.length > 0 ? " \n" : ""
			}`;
		}

		if (!gender) {
			errorsMessage += `É necessário inserir um gênero.${
				errorsMessage.length > 0 ? " \n" : ""
			}`;
		}

		if (errorsMessage) {
			Toast.show({
				preset: "error",
				title: "Algo está errado com os dados inseridos.",
				description: errorsMessage,
			});
			return;
		}

		onSubmit({
			...data,
			birthday,
			gender,
		});
	}, onError);

	return (
		<>
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<Input
						label="Nome"
						onBlur={onBlur}
						onChangeText={(value) => onChange(value)}
						value={value}
						style={!!errors.name && borderErrorStyle}
						placeholder="Fulano da Silva"
						maxLength={50}
						pallette="dark"
					/>
				)}
				name="name"
			/>
			<Controller
				control={control}
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
						style={!!errors.phone && borderErrorStyle}
						keyboardType="phone-pad"
						maxLength={15}
						pallette="dark"
					/>
				)}
				name="phone"
			/>
			<Trigger
				label="Data de Nascimento"
				value={birthday?.toLocaleDateString("pt-BR") ?? ""}
				placeholder="DD/MM/AAAA"
				onPress={() => {
					setDatePickerModalVisible(true);
					Keyboard.dismiss();
				}}
				pallette="dark"
			/>
			<SubSectionWrapper
				headerProps={{
					title: "Gênero",
				}}
			>
				<ToggleGroup
					data={genderOptions}
					selected={gender}
					updateState={setGender}
				/>
			</SubSectionWrapper>

			<Text className="text-gray-100 text-sm text-left">
				Todos os dados pessoais obtidos são utilizados somente para a
				criação de sua conta. Nós respeitamos a sua privacidade e não
				compartilhamos nenhum dado pessoal com terceiros.
			</Text>

			<ActionButton
				onPress={submitSection0Data}
				preset="next"
				label="Continuar"
				textProps={{
					className: "font-logoRegular text-white text-md",
				}}
			/>

			<DatePickerModal
				isVisible={isDatePickerVisible}
				hasCancelButton
				toggleVisibility={() =>
					setDatePickerModalVisible(!isDatePickerVisible)
				}
				onDateChange={(date) => setBirthday(date)}
			/>
		</>
	);
}

interface DatePickerModal {
	isVisible: boolean;
	toggleVisibility: ModalProps["toggleVisibility"];
	initialDate?: Date;
	onDateChange: (date: Date | undefined) => void;
	hasCancelButton?: boolean;
}

export function DatePickerModal({
	isVisible,
	toggleVisibility,
	initialDate,
	onDateChange,
	hasCancelButton,
}: DatePickerModal) {
	const { colorScheme } = useColorScheme();

	const newDate = useRef(initialDate ?? new Date());

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

	const CONFIRM_BUTTON = {
		label: "Confirmar",
		onPress: onConfirm,
		closeOnPress: true,
	};

	return (
		<Modal
			isVisible={isVisible}
			toggleVisibility={toggleVisibility}
			title={"Selecione a data de nascimento"}
			icon="calendar-today"
			buttons={
				hasCancelButton
					? [
							{
								label: "Cancelar",
								onPress: onClean,
								closeOnPress: true,
								color: colors.red,
							},
							CONFIRM_BUTTON,
					  ]
					: [CONFIRM_BUTTON]
			}
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
