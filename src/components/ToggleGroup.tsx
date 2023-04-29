import React, {
	Dispatch,
	forwardRef,
	memo,
	SetStateAction,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	TouchableOpacity,
	View,
	Text,
	TextInput,
	TextInputProps,
	TouchableOpacityProps,
} from "react-native";

import colors from "global/colors";

import Input from "./Input";
import { Controller } from "react-hook-form";

interface ToggleProps extends TouchableOpacityProps {
	item: {
		label: string;
		value: string;
	};
	applyMarginRight?: boolean;
	isSelected?: boolean;
}

function Toggle({ item, isSelected, applyMarginRight, ...rest }: ToggleProps) {
	return (
		<TouchableOpacity
			activeOpacity={0.6}
			className="flex flex-1 flex-row items-center justify-center py-4 bg-black dark:bg-gray-300 border-opacity-40 rounded-lg border-primary"
			style={{
				borderWidth: isSelected ? 1 : 0,
				marginRight: applyMarginRight ? 10 : 0,
			}}
			{...rest}
		>
			<Text
				className="text-sm text-center text-white"
				style={{
					fontWeight: isSelected ? "600" : "400",
				}}
			>
				{item.label}
			</Text>
		</TouchableOpacity>
	);
}

interface DataProps {
	label: string;
	value: string;
}

interface ToggleGroupProps {
	data: DataProps[];
	selected: string | null;
	updateState: (value: any) => void;
	children?: React.ReactNode;
}

const ToggleGroup = React.memo(
	({ data, selected, updateState, children }: ToggleGroupProps) => {
		return (
			<View className="flex-row w-full items-center justify-between">
				<View className="flex-row items-center justify-between flex-1">
					{data.map((item, index) => {
						const update = useCallback(() => {
							updateState(item.value);
						}, []);

						return (
							<Toggle
								key={index.toString()}
								item={item}
								onPress={update}
								isSelected={selected === item.value}
								applyMarginRight={index !== data.length - 1}
							/>
						);
					})}
				</View>
				{children}
			</View>
		);
	}
);

export default ToggleGroup;

interface ToggleGroupWithManualValueProps {
	data: DataProps[];
	control: any;
	manualValue?: {
		inputProps: TextInputProps;
		maxValue?: number;
		unit?: {
			label: string;
			position: "start" | "end";
		};
	};
	defaultValue?: string;
	name: string;
}

export interface ToggleGroupWithManualValueRef {
	reset: () => void;
	getSelected: () => string | null;
}

export const ToggleGroupWithManualValue = forwardRef(
	(
		{
			defaultValue,
			data,
			control,
			manualValue,
			name,
		}: ToggleGroupWithManualValueProps,
		ref
	) => {
		const inputRef = useRef<TextInput>(null); // usamos o useRef para acessar o input manualmente, removendo o foco ao apertar em outro botão
		const [selected, setSelected] = useState<string | null>(
			defaultValue ?? data[0].value
		);
		//console.log(selected, defaultValue, data.flatMap(item => item.value));

		useImperativeHandle(
			ref,
			() => ({
				reset: () => {
					setSelected(null);
					inputRef.current?.blur();
				},
				getSelected: () => selected,
			}),
			[selected]
		);

		/* No caso de troca de tipo no parente, atualizamos o estado para o primeiro valor ou o valor padrão, caso exista */
		/* useEffect(() => {
        console.log("useEffect");
        setSelected(defaultValue ?? data[0].value);
    }, [data]); */

		return (
			<View
				className="flex-row w-full items-center justify-between"
				key={`${name}_container`}
			>
				<View
					className="flex-row items-center justify-between flex-1"
					key={`${name}_toggleContainer`}
				>
					{data.map((item, index) => (
						<Toggle
							key={index.toString()}
							item={item}
							onPress={() => {
								setSelected(item.value);
								inputRef.current?.blur();
							}}
							isSelected={selected === item.value}
							applyMarginRight={
								(data && index !== data.length - 1) ||
								(manualValue ? true : false)
							}
						/>
					))}
				</View>
				{manualValue && (
					<View key={`${name}_container`} className="flex flex-1">
						<Controller
							key={`${name}_controller`}
							control={control}
							name={name}
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<Input
									key={`${name}_input`}
									value={value}
									onChangeText={onChange}
									onFocus={() => {
										setSelected(null);
										if (manualValue.unit && value) {
											const replacedValue = value
												.replaceAll(
													manualValue.unit.label,
													""
												)
												.replaceAll(" ", "");
											onChange(replacedValue);
										}
									}}
									onBlur={() => {
										onBlur();
										const reducedValue =
											manualValue.maxValue &&
											parseInt(value) >
												manualValue.maxValue
												? manualValue.maxValue.toString()
												: value;
										if (
											manualValue.unit &&
											value &&
											value.length > 0
										) {
											onChange(
												`${
													manualValue.unit &&
													manualValue.unit
														.position === "start"
														? `${manualValue.unit.label} `
														: ""
												}${reducedValue}${
													manualValue.unit &&
													manualValue.unit
														.position === "end"
														? ` ${manualValue.unit.label}`
														: ""
												}`
											);
										}
									}}
									ref={inputRef}
									pallette="dark"
									style={{
										paddingHorizontal: 0,
										flex: 1,
										textAlign: "center",
										borderWidth: selected === null ? 1 : 0,
										borderTopColor:
											selected === null
												? colors.primary
												: colors.gray[200],
										borderBottomColor:
											selected === null
												? colors.primary
												: colors.gray[200],
										borderColor:
											selected === null
												? colors.primary
												: colors.gray[200],
									}}
									{...manualValue.inputProps}
									required
								/>
							)}
							rules={{ required: true }}
						/>
					</View>
				)}
			</View>
		);
	}
);
