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
	ViewProps,
} from "react-native";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";

import colors from "global/colors";
import clsx from "clsx";

import Label from "./Label";
import BottomSheet from "./BottomSheet/index";
import CustomBackdrop from "./BottomSheet/CustomBackdrop";
import SearchBar, { SearchBarProps } from "./SearchBar";
import { Checkbox, checkboxesGroupReducer } from "./Checkbox";
import { ActionButton } from "./Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	FlatList,
	NativeViewGestureHandler,
} from "react-native-gesture-handler";

type Category = {
	title: string;
	data: Data[];
};

export type Data = {
	name: string;
	icon?: string;
	color?: string;
};

interface Props extends ViewProps {
	label?: string;
	description?: string;
	placeholder: string;
	data?: Data[];
	sectionsData?: Category[];
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
	bottomSheetHeight?: string;
	bottomSheetLabel?: string;
	overDragAmount?: number;
	pallette?: "dark";
	selectAllButton?: boolean;
	searchBarProps?: SearchBarProps;
}

interface TriggerProps {
	children: React.ReactNode;
	onPress: () => void;
	placeholder: string;
	palette?: "dark";
}

function Trigger({ children, onPress, placeholder, palette }: TriggerProps) {
	const { colorScheme } = useColorScheme();

	return (
		<TouchableOpacity
			activeOpacity={0.8}
			className={clsx(
				"flex-row justify-between items-center w-full px-4 py-3 rounded-lg bg-black dark:bg-gray-200",
				{
					"bg-black dark:bg-gray-300": palette === "dark",
				}
			)}
			onPress={onPress}
		>
			{children ? (
				children
			) : (
				<Text className="text-text-200 opacity-80">{placeholder}</Text>
			)}
			<MaterialIcons
				name="expand-more"
				size={18}
				color={colorScheme === "dark" ? colors.text[200] : colors.white}
			/>
		</TouchableOpacity>
	);
}

const Multiselect = React.forwardRef((props: Props, ref) => {
	const {
		label,
		description,
		placeholder,
		data,
		sectionsData,
		bottomSheetLabel,
		overDragAmount,
		bottomSheetHeight,
		pallette,
		searchBarProps,
		selected: parentSelected,
		setSelected: parentSetSelected,
		selectAllButton,
		...rest
	} = props;

	const { colorScheme } = useColorScheme();
	const insets = useSafeAreaInsets();
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
								{sectionsData &&
									sectionsData.map((category) =>
										category.data.map((item) => {
											if (
												parentSelected.includes(
													item.name
												)
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
								{data &&
									data.map((item) => {
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
									})}
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

			<BottomSheet
				overDragAmount={overDragAmount ?? 0}
				height={bottomSheetHeight ?? "90%"}
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
					{data && (
						<List
							data={data}
							searchBarProps={{
								palette: pallette,
								...searchBarProps,
							}}
							parentSetSelected={parentSetSelected}
							initialValue={parentSelected}
							closeHandler={closeHandler}
						/>
					)}
					{sectionsData && (
						<SectionsList
							data={sectionsData}
							searchBarProps={{
								palette: pallette,
								...searchBarProps,
							}}
							parentSetSelected={parentSetSelected}
							initialValue={parentSelected}
							closeHandler={closeHandler}
						/>
					)}
				</View>
			</BottomSheet>
		</>
	);
});

export default Multiselect;

function SelectItem({ item }: { item: Data }) {
	return (
		<View className="flex flex-col items-center justify-center px-4 py-1 bg-transparent border border-primary rounded-3xl">
			<Text className="text-text-100 text-sm font-titleSemiBold">
				{item.name}
			</Text>
		</View>
	);
}

interface List {
	data: Data[];
	searchBarProps?: SearchBarProps;
	parentSetSelected: Dispatch<SetStateAction<string[]>>;
	initialValue: string[];
	closeHandler: () => void;
}

function List({
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
		return data.filter((item) => item.name.toLowerCase().includes(search));
	}, [search, data]);

	const dataLength = filteredData.length;

	return (
		<>
			<SearchBar
				value={search}
				onChange={setSearch}
				{...searchBarProps}
			/>
			<NativeViewGestureHandler disallowInterruption>
				<FlatList
					data={filteredData}
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
												.map((item) => item.name)
												.flat(),
									  })
							}
							customKey={"select-all"}
							inverted
							labelStyle={{ fontWeight: "bold" }}
							style={{ width: "100%" }}
						/>
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

interface SectionsListProps extends Omit<List, "data"> {
	data: Category[];
}

function SectionsList({
	data,
	searchBarProps,
	parentSetSelected,
	initialValue,
	closeHandler,
}: SectionsListProps) {
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
	item: Data;
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
