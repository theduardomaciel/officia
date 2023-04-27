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
import BottomSheet, { BottomSheetProps } from "./BottomSheet/index";
import CustomBackdrop from "./BottomSheet/CustomBackdrop";
import SearchBar, { SearchBarProps } from "./SearchBar";
import { Checkbox, checkboxesGroupReducer } from "./Checkbox";
import { ActionButton } from "./Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	FlatList,
	NativeViewGestureHandler,
} from "react-native-gesture-handler";
import { Error, Loading } from "./StatusMessage";

interface TriggerProps {
	children?: React.ReactNode;
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
				<View
					className="flex-1 flex-row items-start justify-start flex-wrap"
					style={{
						gap: 10,
					}}
				>
					{children}
				</View>
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

interface TriggerHolderProps extends ViewProps {
	children: React.ReactNode;
	label?: string;
	description?: string;
}

function TriggerHolder({ children, label, description }: TriggerHolderProps) {
	return (
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
			{children}
		</View>
	);
}

interface MultiselectBottomSheetProps {
	id: BottomSheetProps["id"];
	children: React.ReactNode;
	overDragAmount?: BottomSheetProps["overDragAmount"];
	height?: BottomSheetProps["height"];
	title?: string;
}

function MultiselectBottomSheet({
	children,
	id,
	overDragAmount,
	height,
	title,
}: MultiselectBottomSheetProps) {
	const insets = useSafeAreaInsets();

	return (
		<BottomSheet
			overDragAmount={overDragAmount ?? 0}
			height={height ?? "90%"}
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
				{title && <Label style={{ marginBottom: 5 }}>{title}</Label>}
				{children}
			</View>
		</BottomSheet>
	);
}

export type MultiselectCategory = {
	title: string;
	data: MultiselectData[];
};

export type MultiselectData = {
	id: string;
	name: string;
	icon?: string;
	color?: string;
};

interface Props extends ViewProps {
	label?: string;
	description?: string;
	placeholder: string;
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
	bottomSheetProps?: Omit<MultiselectBottomSheetProps, "children" | "id">;
	pallette?: "dark";
	selectAllButton?: boolean;
	searchBarProps?: SearchBarProps;
}

const Multiselect = React.forwardRef(
	(
		{
			label,
			description,
			placeholder,
			data,
			bottomSheetProps,
			searchBarProps,
			selected: parentSelected,
			setSelected: parentSetSelected,
			selectAllButton,
			pallette,
			...rest
		}: Props & { data?: MultiselectData[] | null },
		ref
	) => {
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
					<TriggerHolder
						label={label}
						description={description}
						{...rest}
					>
						<Trigger
							onPress={openHandler}
							placeholder={placeholder}
							palette={pallette}
						>
							{data && parentSelected.length > 0
								? data.map((item) => {
										if (parentSelected.includes(item.id)) {
											return (
												<SelectItem
													key={item.id}
													item={item}
												/>
											);
										} else {
											return null;
										}
								  })
								: undefined}
						</Trigger>
					</TriggerHolder>
				)}

				<MultiselectBottomSheet id={id} {...bottomSheetProps}>
					{data ? (
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
					) : data === undefined ? (
						<Loading />
					) : (
						<Error
							message={`Um erro no servidor nos impediu de obter os segmentos disponíveis para seleção.\nPor favor, tente novamente mais tarde.`}
						/>
					)}
				</MultiselectBottomSheet>
			</>
		);
	}
);

export default Multiselect;

export const SectionsMultiselect = React.forwardRef(
	(
		{
			label,
			description,
			placeholder,
			data,
			bottomSheetProps,
			searchBarProps,
			selected: parentSelected,
			setSelected: parentSetSelected,
			selectAllButton,
			pallette,
			...rest
		}: Props & { data?: MultiselectCategory[] | null },
		ref
	) => {
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
					<TriggerHolder
						label={label}
						description={description}
						{...rest}
					>
						<Trigger
							onPress={openHandler}
							placeholder={placeholder}
							palette={pallette}
						>
							{data && parentSelected.length > 0
								? data.map((category) =>
										category.data.map((item) => {
											if (
												parentSelected.includes(item.id)
											) {
												return (
													<SelectItem
														key={item.id}
														item={item}
													/>
												);
											} else {
												return null;
											}
										})
								  )
								: undefined}
						</Trigger>
					</TriggerHolder>
				)}

				<MultiselectBottomSheet id={id} {...bottomSheetProps}>
					{data ? (
						<SectionsList
							data={data}
							searchBarProps={{
								palette: pallette,
								...searchBarProps,
							}}
							parentSetSelected={parentSetSelected}
							initialValue={parentSelected}
							closeHandler={closeHandler}
						/>
					) : data === undefined ? (
						<Loading />
					) : (
						<Error
							message={`Um erro no servidor nos impediu de obter os segmentos disponíveis para seleção.\nPor favor, tente novamente mais tarde.`}
						/>
					)}
				</MultiselectBottomSheet>
			</>
		);
	}
);

function SelectItem({ item }: { item: MultiselectData }) {
	return (
		<View className="flex flex-col items-center justify-center px-4 py-1 bg-transparent border border-primary rounded-3xl">
			<Text className="text-text-100 text-sm font-titleSemiBold">
				{item.name}
			</Text>
		</View>
	);
}

interface ListProps {
	searchBarProps?: SearchBarProps;
	parentSetSelected: Props["setSelected"];
	initialValue: Props["selected"];
	closeHandler: () => void;
}

function List({
	data,
	searchBarProps,
	parentSetSelected,
	initialValue,
	closeHandler,
}: ListProps & { data: MultiselectData[] }) {
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

	const renderItem = useCallback(
		({ item }: { item: MultiselectData }) => (
			<ListItem
				item={item}
				onPress={() => updateState(item.id)}
				isSelected={selected.includes(item.id)}
			/>
		),
		[selected]
	);

	return (
		<>
			<SearchBar
				value={search}
				onChange={setSearch}
				{...searchBarProps}
			/>
			<FlatList
				data={filteredData}
				keyExtractor={(_, index) => index.toString()}
				showsVerticalScrollIndicator={false}
				style={{ flex: 1 }}
				removeClippedSubviews
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
											.map((item) => item.id)
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
				renderItem={renderItem}
			/>
			<ActionButton label="Selecionar" onPress={onSubmit} />
		</>
	);
}

function SectionsList({
	data,
	searchBarProps,
	parentSetSelected,
	initialValue,
	closeHandler,
}: ListProps & { data: MultiselectCategory[] }) {
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

	const renderItem = useCallback(
		({ item }: { item: MultiselectData }) => (
			<ListItem
				item={item}
				onPress={() => updateState(item.id)}
				isSelected={selected.includes(item.id)}
			/>
		),
		[selected]
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
					removeClippedSubviews
					windowSize={21}
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
														(item) => item.id
													)
												)
												.flat(),
									  })
							}
							customKey={"select-all"}
							inverted
							labelStyle={{ fontWeight: "bold" }}
							style={{ width: "100%", marginBottom: 8 }}
						/>
					)}
					//stickyHeaderHiddenOnScroll
					stickySectionHeadersEnabled
					renderSectionHeader={({ section: { title } }) => (
						<Text className="text-text-100 text-sm font-titleBold py-3 dark:bg-gray-200">
							{title}
						</Text>
					)}
					SectionSeparatorComponent={SectionSpace}
					ItemSeparatorComponent={() => (
						<View className="w-full h-px bg-gray-300 dark:bg-gray-100 opacity-40" />
					)}
					renderItem={renderItem}
				/>
			</NativeViewGestureHandler>
			<ActionButton label="Selecionar" onPress={onSubmit} />
		</>
	);
}

function SectionSpace() {
	return <View className="w-full h-2 bg-transparent" />;
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
			<Checkbox customKey={item.id} checked={isSelected} disabled />
		</TouchableOpacity>
	);
}
