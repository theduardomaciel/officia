import { memo } from "react";
import {
	Text,
	TextStyle,
	TouchableOpacity,
	TouchableOpacityProps,
	View,
	ViewStyle,
	useWindowDimensions,
} from "react-native";
import Animated, {
	withSpring,
	withTiming,
	ZoomOut,
} from "react-native-reanimated";

import { Feather } from "@expo/vector-icons";
import colors from "global/colors";

interface Props extends TouchableOpacityProps {
	checked?: boolean;
	inverted?: boolean;
	title?: string;
	customKey: string;
	preset?: "dark";
	labelStyle?: TextStyle;
}

export function Checkbox({
	title,
	style,
	checked = false,
	preset,
	inverted,
	customKey,
	labelStyle,
	...rest
}: Props) {
	const { fontScale } = useWindowDimensions();

	const entering = (targetValues: any) => {
		"worklet";
		const animations = {
			opacity: withTiming(1, { duration: 150 }),
			transform: [
				{
					scale: withSpring(1, {
						mass: 0.2,
						damping: 10,
						stiffness: 50,
					}),
				},
			],
		};
		const initialValues = {
			opacity: 0,
			transform: [{ scale: 0 }],
		};
		return {
			initialValues,
			animations,
		};
	};

	console.log("rendering checkbox");

	const size = 30 * fontScale;

	return (
		<TouchableOpacity
			key={customKey}
			activeOpacity={0.8}
			className="flex-row items-center"
			style={[
				style,
				{
					flexDirection: inverted ? "row-reverse" : "row",
				},
			]}
			{...rest}
		>
			{checked ? (
				<Animated.View
					className="bg-primary rounded-lg items-center justify-center"
					style={{
						width: size,
						height: size,
					}}
					entering={entering}
					exiting={ZoomOut.duration(100)}
				>
					<Feather name="check" size={20} color={colors.white} />
				</Animated.View>
			) : (
				<View
					className="rounded-lg items-center justify-center bg-transparent border border-text-200"
					style={{
						width: size,
						height: size,
					}}
					/* style={{
						borderStyle: preset === "dark" ? "solid" : undefined,
						borderWidth: preset === "dark" ? 1 : 0,
					}} */
				/>
			)}
			{title && (
				<Text
					className={"text-white flex-1 font-normal"}
					ellipsizeMode="tail"
					style={[
						labelStyle,
						{
							marginLeft: inverted ? 0 : 10,
							marginRight: inverted ? 10 : 0,
						},
					]}
					/* numberOfLines={1} */
				>
					{title}
				</Text>
			)}
		</TouchableOpacity>
	);
}

export function checkboxesGroupReducer(state: any, action: any) {
	switch (action.type) {
		case "add":
			return [...state, action.payload];
		case "remove":
			return state.filter((item: any) => item !== action.payload);
		case "reset":
			return [];
		case "all":
			return action.payload;
		default:
			return state;
	}
}

interface GroupProps {
	data: string[];
	checked: string[];
	dispatch: (action: { type: "add" | "remove"; payload: string }) => void;
	style?: ViewStyle;
}

export const CheckboxesGroup = memo(
	({ data, checked, dispatch, style }: GroupProps) => {
		return (
			<View
				className="flex-row flex-wrap items-center justify-between"
				style={style}
			>
				{data.map((tag, index) => (
					<View key={index} className="w-1/2">
						<Checkbox
							customKey={`${tag}-${index}`}
							style={{ marginVertical: 5 }}
							title={tag}
							checked={checked.includes(tag)}
							onPress={() => {
								if (checked.includes(tag)) {
									/* setChecked(checked.filter(item => item !== tag)) */
									/* updateTags(tag, "remove") */
									dispatch({ type: "remove", payload: tag });
								} else {
									/* setChecked([...checked, tag]) */
									/* updateTags(tag, "add") */
									dispatch({ type: "add", payload: tag });
								}
							}}
						/>
					</View>
				))}
			</View>
		);
	}
);
