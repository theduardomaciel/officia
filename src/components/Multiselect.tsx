import React, {
	RefObject,
	createRef,
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useId,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { TouchableOpacity, View, Text, ViewProps, Button } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeViewGestureHandler } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import { ScrollView } from "react-native-gesture-handler";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";

import colors from "global/colors";
import clsx from "clsx";

// Components
import Label from "./Label";
import BottomSheet, { BottomSheetProps } from "./BottomSheet/index";
import SearchBar, { SearchBarProps } from "./SearchBar";
import { Checkbox } from "./Checkbox";
import { ActionButton } from "./Button";
import { Empty, ErrorStatus, ErrorStatusProps, Loading } from "./StatusMessage";

interface TriggerProps {
	children?: React.ReactNode;
	onPress: () => void;
	placeholder: string;
	palette?: "dark";
	isDisabled?: boolean;
	disabledPlaceholder?: string;
	allSelectedPlaceholder?: string;
}

function Trigger({
	children,
	onPress,
	placeholder,
	palette,
	isDisabled,
	disabledPlaceholder,
	allSelectedPlaceholder,
}: TriggerProps) {
	const { colorScheme } = useColorScheme();

	return (
		<TouchableOpacity
			activeOpacity={0.8}
			className={clsx(
				"flex-row justify-between items-center w-full px-4 py-3 rounded-lg bg-black dark:bg-gray-200",
				{
					"bg-black dark:bg-gray-300": palette === "dark",
					"bg-black dark:bg-gray-100 border-text-200": isDisabled,
				}
			)}
			disabled={isDisabled}
			onPress={onPress}
		>
			{children && !allSelectedPlaceholder ? (
				<View
					className="flex-1 flex-row items-start justify-start flex-wrap"
					style={{
						gap: 10,
					}}
				>
					{children}
				</View>
			) : (
				<Text className="text-text-200 opacity-80">
					{isDisabled
						? disabledPlaceholder
						: allSelectedPlaceholder ?? placeholder}
				</Text>
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

function TriggerSelectedItem({ item }: { item: MultiselectItem }) {
	return (
		<View className="flex flex-col items-center justify-center px-4 py-1 bg-transparent border border-primary rounded-3xl">
			<Text className="text-text-100 text-sm font-titleSemiBold">
				{item.name}
			</Text>
		</View>
	);
}

interface MultiselectBottomSheetProps extends Partial<BottomSheetProps> {
	title?: string;
}

function MultiselectBottomSheet({
	children,
	id,
	overDragAmount,
	height,
	title,
	...rest
}: MultiselectBottomSheetProps) {
	const insets = useSafeAreaInsets();

	return (
		<BottomSheet
			overDragAmount={overDragAmount ?? 0}
			height={height ?? "90%"}
			/* suppressBackdrop={true}
			backdropComponent={(props) => <CustomBackdrop {...props} />} */
			id={id as string}
			{...rest}
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

export interface MultiselectItem {
	id: string;
	name: string;
	icon?: string;
	color?: string;
}

export type MultiselectData = (string | MultiselectItem)[] | null | undefined;

export interface MultiselectProps extends ViewProps {
	label?: string;
	description?: string;
	placeholder: string;
	data: React.MutableRefObject<MultiselectData>;
	fetchData?: () => Promise<MultiselectData>;
	type?: "sections";
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
	bottomSheetProps?: Omit<MultiselectBottomSheetProps, "children" | "id">;
	pallette?: "dark";
	showSelectAllButton?: boolean;
	allSelectedPlaceholder?: string;
	searchBarProps?: SearchBarProps;
	disabled?: boolean;
	disabledPlaceholder?: string;
	fetchErrorProps?: ErrorStatusProps;
	updateDataOnExpand?: boolean;
}

export default function MultiSelect({
	label,
	description,
	placeholder,
	data: initialData,
	fetchData,
	type,
	bottomSheetProps,
	searchBarProps,
	selected: parentSelected,
	setSelected: parentSetSelected,
	showSelectAllButton = true,
	pallette,
	disabled,
	disabledPlaceholder,
	allSelectedPlaceholder,
	fetchErrorProps,
	updateDataOnExpand,
	...rest
}: MultiselectProps) {
	const id = useId();

	const [data, setData] = useState<MultiselectData>(
		initialData ? initialData.current : undefined
	);

	const cachedData = useRef<MultiselectData>(undefined);

	const openHandler = useCallback(() => {
		1;
		BottomSheet.expand(id);
	}, []);

	const closeHandler = useCallback(() => {
		BottomSheet.close(id);
	}, []);

	const listScrollRef = useRef();
	const panRef = useRef();

	const BottomSheetContent = memo(function BottomSheetContent() {
		if (data) {
			if (type === "sections") {
				return (
					<SectionsList
						data={data}
						searchBarProps={
							searchBarProps
								? {
										palette: pallette,
										...searchBarProps,
								  }
								: undefined
						}
						parentSetSelected={parentSetSelected}
						initialValue={parentSelected}
						closeHandler={closeHandler}
						showSelectAllButton={showSelectAllButton}
						panRef={panRef}
						listScrollRef={listScrollRef}
					/>
				);
			} else {
				return (
					<List
						data={data as MultiselectItem[]}
						searchBarProps={
							searchBarProps
								? {
										palette: pallette,
										...searchBarProps,
								  }
								: undefined
						}
						parentSetSelected={parentSetSelected}
						initialValue={parentSelected}
						closeHandler={closeHandler}
						showSelectAllButton={showSelectAllButton}
						listScrollRef={listScrollRef}
						panRef={panRef}
					/>
				);
			}
		} else if (data === null) {
			if (fetchErrorProps && fetchData) {
				const { onPress, ...rest } = fetchErrorProps;

				return (
					<View className="flex-1 items-center justify-center">
						<ErrorStatus onPress={fetchHandler} {...rest} />
					</View>
				);
			} else {
				return (
					<View className="flex-1 items-center justify-center">
						<ErrorStatus defaultText="Não foi possível obter os dados." />
					</View>
				);
			}
		} else {
			return (
				<View className="flex-1 items-center justify-center">
					<Loading />
				</View>
			);
		}
	});

	console.log("Multiselect holder rerender");

	const fetchHandler = async () => {
		if (!cachedData.current && fetchData) {
			setData(undefined);

			const updatedData = await fetchData();
			if (updatedData) {
				cachedData.current = updatedData;
				setData(updatedData);
			} else {
				setData(null);
			}
		}
	};

	const updateData = useCallback(() => {
		if (!cachedData.current && initialData.current) {
			console.log("Atualizando dados internos do MultiSelect...");
			setData(initialData.current);
			cachedData.current = initialData.current;
		}
	}, []);

	useEffect(() => {
		updateData();
	}, []);

	return (
		<>
			<TriggerHolder label={label} description={description} {...rest}>
				<Trigger
					onPress={openHandler}
					placeholder={placeholder}
					palette={pallette}
					isDisabled={disabled}
					disabledPlaceholder={disabledPlaceholder}
					allSelectedPlaceholder={
						allSelectedPlaceholder &&
						parentSelected.length === data?.length
							? allSelectedPlaceholder
							: undefined
					}
				>
					{data && parentSelected.length > 0
						? data.map((item) => {
								if (typeof item === "string") return null;

								if (parentSelected.includes(item.id)) {
									return (
										<TriggerSelectedItem
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

			<MultiselectBottomSheet
				id={id}
				scrollableContentRef={listScrollRef}
				panRef={panRef}
				onExpand={updateDataOnExpand ? updateData : undefined}
				//onExpanded={fetchHandler}
				{...bottomSheetProps}
			>
				<BottomSheetContent />
			</MultiselectBottomSheet>
		</>
	);
}

interface ListProps {
	searchBarProps?: SearchBarProps;
	parentSetSelected: MultiselectProps["setSelected"];
	initialValue: MultiselectProps["selected"];
	closeHandler: () => void;
	showSelectAllButton?: boolean;
	listScrollRef: RefObject<any>;
	panRef: BottomSheetProps["panRef"];
}

function List({
	data,
	searchBarProps,
	parentSetSelected,
	initialValue,
	closeHandler,
	showSelectAllButton = true,
	listScrollRef,
	panRef,
}: ListProps & { data: MultiselectItem[] }) {
	const [search, setSearch] = useState("");

	const filteredData = useMemo(() => {
		if (!search) return data;
		return data.filter((item) =>
			item.name
				.toLowerCase()
				.replaceAll(" ", "")
				.includes(search.toLocaleLowerCase().replace(/\s/g, ""))
		);
	}, [search, data]);

	const dataItems = useMemo(
		() => filteredData.map((item) => item.id),
		[filteredData]
	);

	const itemsRef = useMemo(
		() =>
			Object.fromEntries(
				data.map((item) => [item.id, createRef<ListItemRef>()])
			),
		[]
	);
	const itemsSelected = useRef(
		Object.fromEntries(
			data.map((item) => [item.id, initialValue.includes(item.id)])
		)
	);

	const checkAllRef = useRef<CheckAllObject>(null);

	const renderItem = useCallback(
		({ item }: { item: MultiselectItem }) => (
			<ListItem
				item={item}
				ref={itemsRef[item.id]}
				onPress={(checked: boolean) => {
					checkAllRef.current?.updateSelectedAmount(checked);
					itemsSelected.current[item.id] = checked;
				}}
				initialChecked={itemsSelected.current[item.id]}
			/>
		),
		[]
	);

	const memoizedEmpty = useMemo(
		() => <ListEmpty search={search} />,
		[search]
	);

	const onSubmit = useCallback(() => {
		const selectedIds = Object.entries(itemsSelected.current)
			.filter(([_, checked]) => checked === true)
			.map(([id, _]) => id);

		//console.log(selectedIds.length, "Quantidade de elementos selecionados");

		if (selectedIds) {
			parentSetSelected(selectedIds);
		}

		closeHandler();
	}, []);

	return (
		<>
			{searchBarProps && (
				<SearchBar
					value={search}
					onChange={setSearch}
					{...searchBarProps}
				/>
			)}
			{/* <NativeViewGestureHandler disallowInterruption> */}
			<View className="flex-1">
				<FlashList
					ref={listScrollRef}
					data={filteredData}
					overrideProps={
						{
							//simultaneousHandlers: panRef,
							//disallowInterruption: true,
						}
					}
					renderScrollComponent={ScrollView}
					showsVerticalScrollIndicator={false}
					estimatedItemSize={ITEM_HEIGHT}
					ListHeaderComponent={() =>
						showSelectAllButton ? (
							<CheckAll
								ref={checkAllRef}
								itemsRef={itemsRef}
								data={dataItems}
								itemsSelected={itemsSelected}
							/>
						) : null
					}
					ListEmptyComponent={memoizedEmpty}
					ItemSeparatorComponent={ListSeparator}
					renderItem={renderItem}
				/>
			</View>
			{/* </NativeViewGestureHandler> */}
			<ActionButton label="Selecionar" onPress={onSubmit} />
		</>
	);
}

type SectionData = string | MultiselectItem;

function SectionsList({
	data,
	searchBarProps,
	parentSetSelected,
	initialValue,
	closeHandler,
	showSelectAllButton,
	listScrollRef,
	panRef,
}: ListProps & { data: SectionData[] }) {
	const [search, setSearch] = useState("");

	const dataContent = useMemo(
		() =>
			data.filter(
				(item) => typeof item !== "string"
			) as MultiselectItem[],
		[data]
	);

	/* const filteredData = useMemo(() => {
		if (!search) return data;
		return data.filter(
			(item) =>
				typeof item === "string" ||
				item.name
					.toLowerCase()
					.replaceAll(" ", "")
					.includes(search.toLocaleLowerCase().replace(/\s/g, ""))
		);
	}, [search, data]); */

	// Cálculo de filtragem complexo para que os headers só apareçam caso haja algum item abaixo dele
	const filteredData = useMemo(() => {
		if (!search) return data;
		return data
			.filter(
				(item) =>
					typeof item === "string" ||
					item.name
						.toLowerCase()
						.replaceAll(" ", "")
						.includes(search.toLocaleLowerCase().replace(/\s/g, ""))
			)
			.filter((item, index, array) => {
				const isHeader = typeof item === "string";
				if (!isHeader) return true;
				if (isHeader && array[index + 1]) {
					const nextItem = array[index + 1];
					return (
						typeof nextItem !== "string" &&
						nextItem.name
							.toLowerCase()
							.replaceAll(" ", "")
							.includes(
								search.toLocaleLowerCase().replace(/\s/g, "")
							)
					);
				}
				return false;
			});
	}, [search, data]);

	const dataItems = useMemo(
		() => dataContent.map((item) => item.id),
		[filteredData]
	);

	const listSeparator = useCallback(
		({ leadingItem }: { leadingItem: MultiselectItem }) =>
			typeof leadingItem !== "string" &&
			typeof filteredData[
				filteredData.findIndex(
					(item) =>
						typeof item !== "string" && item.id === leadingItem.id
				) + 1
			] !== "string" ? (
				<ListSeparator /> // Gambiarra: filtragem usada para não mostrar o separador no final da lista, pode causar problemas com desempenho
			) : null,
		[]
	);

	const stickyHeaderIndices = useMemo(
		() =>
			filteredData
				.map((item, index) => {
					if (typeof item === "string") {
						return index;
					} else {
						return null;
					}
				})
				.filter((item) => item !== null) as number[],
		[filteredData]
	);

	const itemsRef = useMemo(
		() =>
			Object.fromEntries(
				dataContent.map((item) => [item.id, createRef<ListItemRef>()])
			),
		[]
	);

	const itemsSelected = useRef(
		Object.fromEntries(
			dataContent.map((item) => [item.id, initialValue.includes(item.id)])
		)
	);

	/* console.log(
		Object.values(itemsSelected.current).filter((item) => item === true)
			.length,
		"Quantidade de elementos selecionados inicial"
	); */

	const checkAllRef = useRef<CheckAllObject>(null);

	const renderItem = useCallback(({ item }: { item: MultiselectItem }) => {
		return (
			<ListItem
				item={item}
				ref={itemsRef[item.id]}
				onPress={(checked: boolean) => {
					checkAllRef.current?.updateSelectedAmount(checked);
					itemsSelected.current[item.id] = checked;
				}}
				initialChecked={itemsSelected.current[item.id]}
			/>
		);
	}, []);

	const memoizedEmpty = useMemo(
		() => <ListEmpty search={search} />,
		[search]
	);

	const onSubmit = useCallback(() => {
		const selectedIds = Object.entries(itemsSelected.current)
			.filter(([_, checked]) => checked === true)
			.map(([id, _]) => id);

		// console.log(selectedIds.length, "Quantidade de elementos selecionados");

		if (selectedIds) {
			parentSetSelected(selectedIds);
		}

		closeHandler();
	}, []);

	// Gambiarra: a Section List só consegue ser rolada com o NativeViewGestureHandler e o "disallowInterruption" setado, no entanto,
	// não é possível deslizar para fechar o BottomSheet ao chegar no topo da lista.
	// Dar uma olhada em: https://docs.swmansion.com/react-native-gesture-handler/docs/gesture-handlers/api/create-native-wrapper/

	return (
		<>
			{searchBarProps && (
				<SearchBar
					value={search}
					onChange={setSearch}
					{...searchBarProps}
				/>
			)}
			{/* <NativeViewGestureHandler disallowInterruption={true}> */}
			<FlashList
				data={filteredData}
				overrideProps={
					{
						//simultaneousHandlers: panRef,
						//disallowInterruption: false,
					}
				}
				renderScrollComponent={ScrollView}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={() =>
					showSelectAllButton ? (
						<CheckAll
							ref={checkAllRef}
							itemsRef={itemsRef}
							data={dataItems}
							itemsSelected={itemsSelected}
						/>
					) : null
				}
				ItemSeparatorComponent={listSeparator}
				renderItem={({ item }) => {
					if (typeof item === "string") {
						// Rendering header
						//return <SectionHeader section={{ title: item }} />;
						return filteredData.includes(item) ? (
							<SectionHeader section={{ title: item }} />
						) : null; // Gambiarra: filtragem usada para não mostrar os títulos das seções após filtrar com a busca, pode causar problemas com desempenho
					} else return renderItem({ item });
				}}
				ListEmptyComponent={memoizedEmpty}
				stickyHeaderIndices={stickyHeaderIndices}
				getItemType={(item) => {
					// To achieve better performance, specify the type based on the item
					return typeof item === "string" ? "sectionHeader" : "row";
				}}
				estimatedItemSize={ITEM_HEIGHT}
			/>
			{/* </NativeViewGestureHandler> */}
			<ActionButton label="Selecionar" onPress={onSubmit} />
		</>
	);
}

function ListEmpty({ search }: { search: string }) {
	return (
		<Empty
			style={{ paddingTop: 25 }}
			message={
				search && search.length > 0
					? "Nenhum item encontrado com base em sua pesquisa."
					: "Nenhum item foi encontrado."
			}
		/>
	);
}

function SectionHeader({ section: { title } }: { section: { title: string } }) {
	return (
		<Text className="text-text-100 text-sm font-titleBold py-3 dark:bg-gray-200">
			{title}
		</Text>
	);
}

interface CheckAllProps {
	itemsRef: {
		[k: string]: React.RefObject<ListItemRef>;
	};
	itemsSelected: React.MutableRefObject<{
		[k: string]: boolean;
	}>;
	data: string[];
}

interface CheckAllObject {
	updateSelectedAmount: (checked: boolean) => void;
}

const CheckAll = forwardRef(function CheckAll(
	{ itemsRef, itemsSelected, data }: CheckAllProps,
	ref
) {
	const initialSelectedAmount = useMemo(() => {
		return data?.filter((id) => itemsSelected?.current[id]).length;
	}, [itemsSelected, data]);

	const [selectedAmount, setSelectedAmount] = useState(
		initialSelectedAmount ?? 0
	);

	useImperativeHandle(
		ref,
		() => ({
			updateSelectedAmount: (checked: boolean) => {
				if (checked) {
					setSelectedAmount((prev) => prev + 1);
					/* console.log(
						selectedAmount,
						"selectedAmount aumentou",
						data.length
					); */
				} else {
					setSelectedAmount((prev) => prev - 1);
					/* console.log(
						selectedAmount,
						"selectedAmount diminuiu",
						data.length
					); */
				}
			},
		}),
		[]
	);

	return (
		<Checkbox
			checked={selectedAmount === data.length}
			title="Selecionar todos"
			onPress={() => {
				if (selectedAmount === data.length) {
					for (const [id, ref] of Object.entries(itemsRef)) {
						if (data.includes(id)) {
							ref.current?.uncheck();
						}
					}
					if (itemsSelected.current) itemsSelected.current = {};
					setSelectedAmount(0);
				} else {
					for (const [id, ref] of Object.entries(itemsRef)) {
						if (data.includes(id)) {
							ref.current?.check(); // Gambiarra: não está checando todos quando a lista é muito longa
						}
					}
					if (itemsSelected.current) {
						itemsSelected.current = data
							.map((id) => ({ [id]: true }))
							.reduce((prev, curr) => ({ ...prev, ...curr }), {});
					}
					setSelectedAmount(data.length);
				}
			}}
			customKey={"select-all"}
			inverted
			labelStyle={{ fontWeight: "bold" }}
			style={{ width: "100%", marginBottom: 8 }}
		/>
	);
});

function SectionSpace() {
	return <View className="w-full h-2 bg-transparent" />;
}

interface ListItemProps {
	item: MultiselectItem;
	initialChecked?: boolean;
	onPress: (checked: boolean) => void;
}

interface ListItemRef extends Omit<TouchableOpacity, "props"> {
	check: () => void;
	uncheck: () => void;
	toggle: () => void;
}

const ITEM_HEIGHT = 75;

const getItemLayout = (data: any, index: number) => ({
	length: ITEM_HEIGHT,
	offset: ITEM_HEIGHT * index,
	index,
});

const ListItem = forwardRef(function ListItem(
	{ item, onPress, initialChecked = false }: ListItemProps,
	ref
) {
	const lastItemId = useRef(item.id);
	const [isSelected, setIsSelected] = useState(initialChecked);

	if (item.id !== lastItemId.current) {
		lastItemId.current = item.id;
		setIsSelected(initialChecked);
	}

	useImperativeHandle(
		ref,
		() => ({
			check: () => setIsSelected(true),
			uncheck: () => setIsSelected(false),
			toggle: () => setIsSelected((prev) => !prev),
		}),
		[]
	);

	// console.log("List item rerender.");

	return (
		<TouchableOpacity
			activeOpacity={0.4}
			className="flex-row items-center justify-between w-full py-3"
			//style={{ height: ITEM_HEIGHT }}
			onPress={() => {
				onPress(!isSelected);
				setIsSelected((prev) => !prev);
			}}
		>
			<View className="flex-row items-center justify-start">
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
});

function ListSeparator() {
	return (
		<View className="w-full h-px bg-gray-300 dark:bg-gray-100 opacity-40" />
	);
}
