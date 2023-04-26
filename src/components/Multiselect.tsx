import React, { useCallback, useId, useImperativeHandle, useRef } from "react";
import {
	TouchableOpacity,
	TouchableOpacityProps,
	View,
	Text,
	Dimensions,
	SectionList,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";

import colors from "global/colors";
import clsx from "clsx";

import Label from "./Label";
import BottomSheet from "./BottomSheet/index";
import CustomBackdrop from "./BottomSheet/CustomBackdrop";
import SearchBar, { SearchBarProps } from "./SearchBar";
import { Checkbox } from "./Checkbox";
import { ActionButton } from "./Button";

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
		selected,
		setSelected,
		selectAllButton,
		...rest
	} = props;

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

	const updateState = useCallback((value: string) => {
		setSelected((prev) => {
			if (prev.includes(value)) {
				return prev.filter((item) => item !== value);
			} else {
				return [...prev, value];
			}
		});
	}, []);

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
						{selected.length === 0 && (
							<Text className="text-text-200 opacity-80">
								{placeholder}
							</Text>
						)}
						{selected.length > 0 && (
							<View
								className="flex-1 flex-row items-start justify-start flex-wrap"
								style={{
									gap: 10,
								}}
							>
								{data.map((category) =>
									category.data.map((item) => {
										if (selected.includes(item.name)) {
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

			<BottomSheet
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
					<BottomSheetContent
						state={selected}
						updateState={updateState}
						data={data}
					/>
					<ActionButton
						label="Selecionar"
						onPress={() => closeHandler()}
					/>
				</View>
			</BottomSheet>
		</>
	);
});

export default Multiselect;

function SelectItem({ item }: { item: MultiselectData }) {
	return (
		<View className="flex flex-col items-center justify-center px-4 py-1 bg-transparent border border-primary rounded-3xl">
			<Text className="text-text-100 text-sm font-titleSemiBold">
				{item.name}
			</Text>
		</View>
	);
}

function BottomSheetContent({
	state,
	updateState,
	data,
}: {
	updateState: (value: string) => void;
	state: Props["selected"];
	data: Props["data"];
}) {
	return (
		<SectionList
			sections={data}
			keyExtractor={(_, index) => index.toString()}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ paddingBottom: 100 }}
			style={{ flex: 1 }}
			ListHeaderComponent={() => (
				<Checkbox
					checked={true}
					title="Selecionar todos"
					customKey={"select-all"}
					inverted
					labelStyle={{ fontWeight: "bold" }}
					style={{ width: "100%" }}
				/>
			)}
			renderSectionHeader={({ section: { title } }) => (
				<Text className="text-text-100 text-sm font-titleSemiBold pt-4 pb-2">
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
					isSelected={state.includes(item.name)}
				/>
			)}
		/>
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
					className={clsx(
						"text-black dark:text-white text-sm font-semibold",
						{
							"font-bold": isSelected,
						}
					)}
				>
					{item.name}
				</Text>
			</View>
			<Checkbox customKey={item.name} checked={isSelected} disabled />
		</TouchableOpacity>
	);
}
