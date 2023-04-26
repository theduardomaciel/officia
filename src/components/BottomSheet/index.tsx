import React from "react";
import { Text, TextProps, View, ViewProps } from "react-native";
import BottomSheetUI from "./BottomSheet";
import { SharedValue } from "react-native-reanimated";

export interface BottomSheetVariables {
	screenHeight: number;
	newActiveHeight: number;
	/**
	 * Current sheet position.
	 * @type SharedValue<number>
	 */
	animatedPosition: SharedValue<number>;
	onBackdropPress: () => void;
}

export interface BottomSheetBackdropProps
	extends Pick<ViewProps, "style">,
		BottomSheetVariables {}

export interface BottomSheetProps {
	children: React.ReactNode;
	id: string;
	height: string;
	heightLimitBehaviour?: /* 'top' | */ "lock" | "contentHeight";
	// a animação do lock muda dependendo de se no futuro haverá a opção de adicionar uma propriedade de altura adicional para o bottom sheet. Possuindo essa altura adicional a animação passa a ser de spring
	overDragAmount?: number;
	canDismiss?: boolean;
	colors?: {
		backdrop?: string;
		background?: string;
	};
	backdropComponent?: React.FC<BottomSheetBackdropProps> | null;
	dismissOnBackdropPress?: boolean;
	defaultValues?: {
		expanded?: boolean;
	};
	suppressHandle?: boolean;
	suppressBackdrop?: boolean;
	suppressPortal?: boolean;
	onDismiss?: () => any;
	onDismissed?: () => any;
	onExpand?: () => any;
	onExpanded?: () => any;
}

export interface BottomSheetActions {
	getId: () => string;
	expand: () => any;
	close: () => any;
	update: (updateFunction: () => any) => any;
}

const BottomSheetRoot = React.forwardRef(
	({ children, id, ...rest }: BottomSheetProps, ref) => {
		const bottomSheetRef = React.useRef<BottomSheetActions>(null);

		const expand = React.useCallback(() => {
			bottomSheetRef.current?.expand();
		}, []);

		const close = React.useCallback(() => {
			bottomSheetRef.current?.close();
		}, []);

		// This must use useCallback to ensure the ref doesn't get set to null and then a new ref every render.
		React.useImperativeHandle(
			ref,
			React.useCallback(
				() => ({
					expand,
					close,
					getId: () => id,
				}),
				[close, expand]
			)
		);

		return (
			<BottomSheetUI ref={bottomSheetRef} id={id} {...rest}>
				{children}
			</BottomSheetUI>
		);
	}
);

type BottomSheetRefObj = {
	current: BottomSheetActions | null;
};

let refs: BottomSheetRefObj[] = [];

/**
 * Adds a ref to the end of the array, which will be used to show the toasts until its ref becomes null.
 *
 * @param newRef the new ref, which must be stable for the life of the Toast instance.
 */
function addNewRef(newRef: BottomSheetActions) {
	refs.push({
		current: newRef,
	});
}

/**
 * Removes the passed in ref from the file-level refs array using a strict equality check.
 *
 * @param oldRef the exact ref object to remove from the refs array.
 */
function removeOldRef(oldRef: BottomSheetActions | null) {
	refs = refs.filter((r) => r.current !== oldRef);
}

export default function BottomSheet({ children, ...rest }: BottomSheetProps) {
	const toastRef = React.useRef<BottomSheetActions | null>(null);

	/*
      This must use `useCallback` to ensure the ref doesn't get set to null and then a new ref every render.
      Failure to do so will cause whichever BottomSheet *renders or re-renders* last to be the instance that is used,
      rather than being the BottomSheet that was *mounted* last.
    */
	const setRef = React.useCallback((ref: BottomSheetActions | null) => {
		// Since we know there's a ref, we'll update `refs` to use it.
		if (ref) {
			// store the ref in this bottom sheet instance to be able to remove it from the array later when the ref becomes null.
			toastRef.current = ref;
			addNewRef(ref);
		} else {
			// remove the this bottom sheet's ref, wherever it is in the array.
			removeOldRef(toastRef.current);
		}
	}, []);

	return (
		<BottomSheetRoot ref={setRef} {...rest}>
			{children}
		</BottomSheetRoot>
	);
}

function getRef(id: string) {
	const activeRef = refs.find((ref) => ref.current?.getId() === id)?.current;
	return activeRef;
}

BottomSheet.expand = (id: string) => {
	getRef(id)?.expand();
};

BottomSheet.close = (id: string) => {
	getRef(id)?.close();
};

interface TitleProps extends TextProps {
	children: React.ReactNode;
}

BottomSheet.Title = ({ children, ...rest }: TitleProps) => {
	return (
		<View className="w-full items-center justify-center ">
			<Text
				className="font-titleBold text-2xl text-black text-center dark:text-white"
				{...rest}
			>
				{children}
			</Text>
		</View>
	);
};
