import React, {
	Dispatch,
	SetStateAction,
	memo,
	useCallback,
	useId,
	useImperativeHandle,
	useMemo,
	useReducer,
	useState,
} from "react";
import {
	TouchableOpacity,
	TouchableOpacityProps,
	View,
	Text,
	SectionList,
} from "react-native";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";

import colors from "global/colors";
import clsx from "clsx";

import Label from "./Label";
import BottomSheet from "./BottomSheet/index";
import CustomBackdrop from "./BottomSheet/CustomBackdrop";
import SearchBar, { SearchBarProps } from "./SearchBar";
import { Checkbox, CheckboxesGroup, checkboxesGroupReducer } from "./Checkbox";
import { ActionButton } from "./Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeViewGestureHandler } from "react-native-gesture-handler";

type Category = {
	title: string;
	data: MultiselectData[];
};

export type MultiselectData = {
	name: string;
	icon?: string;
	color?: string;
};

interface Props extends TouchableOpacityProps {
	label?: string;
	description?: string;
	placeholder: string;
	data: Category[];
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
	bottomSheetHeight?: string;
	bottomSheetLabel?: string;
	overDragAmount?: number;
	pallette?: "dark";
	selectAllButton?: boolean;
	searchBarProps?: SearchBarProps;
}

const Multiselect = React.forwardRef((props: Props, ref) => {
	const {
		label,
		description,
		placeholder,
		bottomSheetLabel,
		overDragAmount,
		data,
		bottomSheetHeight,
		pallette,
		searchBarProps,
		selected: parentSelected,
		setSelected: parentSetSelected,
		selectAllButton,
		...rest
	} = props;

	const insets = useSafeAreaInsets();
	const { colorScheme } = useColorScheme();
	const id = useId();

	const openHandler = useCallback(() => {
		BottomSheet.expand(id);
	}, []);

	const closeHandler = useCallback(() => {
		BottomSheet.close(id);
	}, []);

	useImperativeHandle(ref, () => ({
		open: () => openHandler(),
		close: () => closeHandler(),
	}));

	const [search, setSearch] = React.useState("");

	return (
		<>
			{!ref && (
				<View className="flex-col align-middle justify-center gap-y-2">
					{label && (
						<View
							className="w-full flex-row items-center justify-between"
							style={{ marginBottom: 10 }}
						>
							<View className="w-full flex-col items-start justify-start">
								<Label>{label}</Label>
								{description && (
									<Text className="text-sm leading-4 text-text-200">
										{description}
									</Text>
								)}
							</View>
						</View>
					)}
					<TouchableOpacity
						activeOpacity={0.8}
						className={clsx(
							"flex-row justify-between items-center w-full px-4 py-3 rounded-lg bg-black dark:bg-gray-200",
							{
								"bg-black dark:bg-gray-300":
									pallette === "dark",
							}
						)}
						onPress={() => openHandler()}
						{...rest}
					>
						{parentSelected.length === 0 && (
							<Text className="text-text-200 opacity-80">
								{placeholder}
							</Text>
						)}
						{parentSelected.length > 0 && (
							<View
								className="flex-1 flex-row items-start justify-start flex-wrap"
								style={{
									gap: 10,
								}}
							>
								{data.map((category) =>
									category.data.map((item) => {
										if (
											parentSelected.includes(item.name)
										) {
											return (
												<SelectItem
													key={item.name}
													item={item}
												/>
											);
										} else {
											return null;
										}
									})
								)}
							</View>
						)}
						<MaterialIcons
							name="expand-more"
							size={18}
							color={
								colorScheme === "dark"
									? colors.text[200]
									: colors.white
							}
						/>
					</TouchableOpacity>
				</View>
			)}

			{/* <BottomSheet
				overDragAmount={overDragAmount || 0}
				height={bottomSheetHeight || "90%"}
				suppressBackdrop={true}
				//backdropComponent={(props) => <CustomBackdrop {...props} />}
				id={id}
			>
				<View
					className="flex flex-1"
					style={{
						paddingLeft: 24,
						paddingRight: 24,
						rowGap: 15,
					}}
				>
					<View
						className="w-full flex-col items-start justify-start"
						style={{
							rowGap: 10,
						}}
					>
						{props.bottomSheetLabel && (
							<Label style={{ marginBottom: 5 }}>
								{props.bottomSheetLabel}
							</Label>
						)}
						{props.searchBarProps && (
							<SearchBar
								palette={props.pallette}
								{...props.searchBarProps}
							/>
						)}
					</View>
					<ItemsList
						data={data}
						selected={selected}
						dispatch={dispatch}
					/>
				</View>
			</BottomSheet> */}
			<BottomSheet
				overDragAmount={0}
				height={"90%"}
				suppressBackdrop={true}
				backdropComponent={(props) => <CustomBackdrop {...props} />}
				id={id}
			>
				<View
					className="flex flex-1"
					key={id}
					style={{
						paddingLeft: 24,
						paddingRight: 24,
						paddingBottom: insets.bottom,
						rowGap: 15,
					}}
				>
					{props.bottomSheetLabel && (
						<Label style={{ marginBottom: 5 }}>
							{props.bottomSheetLabel}
						</Label>
					)}
					<ItemsList
						data={data}
						searchBarProps={{
							palette: pallette,
							...searchBarProps,
						}}
						parentSetSelected={parentSetSelected}
						initialValue={parentSelected}
						closeHandler={closeHandler}
					/>
				</View>
			</BottomSheet>
		</>
	);
});

export default Multiselect;

/* function Teste({ data, parentSetSelected, initialValue }: any) {
	const [selected, dispatch] = useReducer(
		checkboxesGroupReducer,
		initialValue
	);

	return (
		<CheckboxesGroup
			data={data
				.map((category) => category.data)
				.flat()
				.map((item) => item.name)}
			checked={selected}
			dispatch={dispatch}
		/>
	);
} */

function SelectItem({ item }: { item: MultiselectData }) {
	return (
		<View className="flex flex-col items-center justify-center px-4 py-1 bg-transparent border border-primary rounded-3xl">
			<Text className="text-text-100 text-sm font-titleSemiBold">
				{item.name}
			</Text>
		</View>
	);
}

interface List {
	data: Category[];
	searchBarProps?: SearchBarProps;
	parentSetSelected: Dispatch<SetStateAction<string[]>>;
	initialValue: string[];
	closeHandler: () => void;
}

function ItemsList({
	data,
	searchBarProps,
	parentSetSelected,
	initialValue,
	closeHandler,
}: List) {
	const [selected, dispatch] = useReducer(
		checkboxesGroupReducer,
		initialValue
	);

	const [search, setSearch] = useState("");

	const updateState = useCallback(
		(value: string) => {
			if (selected.includes(value)) {
				dispatch({ type: "remove", payload: value });
			} else {
				dispatch({ type: "add", payload: value });
			}
		},
		[selected]
	);

	const onSubmit = useCallback(() => {
		parentSetSelected(selected);
		closeHandler();
	}, [selected]);

	const filteredData = useMemo(() => {
		if (!search) return data;
		return data
			.map((category) => ({
				...category,
				data: category.data.filter((item) =>
					item.name.toLowerCase().includes(search.toLowerCase())
				),
			}))
			.filter((category) => category.data.length > 0);
	}, [search, data]);

	const dataLength = useMemo(
		() => filteredData.reduce((acc, curr) => acc + curr.data.length, 0),
		[filteredData]
	);

	return (
		<>
			<SearchBar
				value={search}
				onChange={setSearch}
				{...searchBarProps}
			/>
			<NativeViewGestureHandler disallowInterruption>
				<SectionList
					sections={filteredData}
					keyExtractor={(_, index) => index.toString()}
					showsVerticalScrollIndicator={false}
					style={{ flex: 1 }}
					ListHeaderComponent={() => (
						<Checkbox
							checked={selected.length === dataLength}
							title="Selecionar todos"
							onPress={() =>
								selected.length === dataLength
									? dispatch({ type: "reset" })
									: dispatch({
											type: "all",
											payload: filteredData
												.map((category) =>
													category.data.map(
														(item) => item.name
													)
												)
												.flat(),
									  })
							}
							customKey={"select-all"}
							inverted
							labelStyle={{ fontWeight: "bold" }}
							style={{ width: "100%" }}
						/>
					)}
					renderSectionHeader={({ section: { title } }) => (
						<Text className="text-text-100 text-sm font-titleBold pt-6 pb-2">
							{title}
						</Text>
					)}
					ItemSeparatorComponent={() => (
						<View className="w-full h-px bg-gray-300 dark:bg-gray-100 opacity-40" />
					)}
					renderItem={({ item, index }) => (
						<ListItem
							key={index}
							item={item}
							onPress={() => updateState(item.name)}
							isSelected={selected.includes(item.name)}
						/>
					)}
				/>
			</NativeViewGestureHandler>
			<ActionButton label="Selecionar" onPress={onSubmit} />
		</>
	);
}

function ListItem({
	item,
	onPress,
	isSelected,
}: {
	item: MultiselectData;
	onPress: () => void;
	isSelected?: boolean;
}) {
	const { colorScheme } = useColorScheme();

	return (
		<TouchableOpacity
			activeOpacity={0.8}
			className="flex-row items-center justify-between w-full py-3"
			onPress={onPress}
		>
			<View className="flex-row items-center justify-start">
				{item.icon && (
					<MaterialIcons
						name={item.icon as unknown as any}
						size={18}
						color={
							colorScheme === "dark"
								? colors.text[100]
								: colors.white
						}
						style={{ marginRight: 10 }}
					/>
				)}
				<Text
					className={
						"text-black dark:text-white text-sm font-semibold"
					}
				>
					{item.name}
				</Text>
			</View>
			<Checkbox customKey={item.name} checked={isSelected} disabled />
		</TouchableOpacity>
	);
}
