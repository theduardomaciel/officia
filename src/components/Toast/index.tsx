import React from 'react';

export interface ToastProps {
    title?: string,
    message?: string,
    icon?: string,
    preset?: "error" | "success";
}

export interface ToastConfig {
    toastProps?: ToastProps;
    toastPosition?: "top" | "bottom";
    toastOffset?: string;
    maxDragDistance?: number;
    autoDismissDelay?: number;
}

type ToastRef = {
    show: (params: ToastProps) => void;
    hide: () => void;
};

import ToastUI from './ToastUI';

const ToastRoot = React.forwardRef((defaultProps: ToastConfig, ref) => {
    const [config, setConfig] = React.useState<ToastConfig | undefined>(defaultProps);

    const toastRef = React.useRef<any | null>(null);

    const show = React.useCallback((newProps: ToastProps) => {
        setConfig(prevConfig => ({
            ...prevConfig,
            toastProps: newProps,
        }));
        toastRef.current?.show();
    }, []);

    const hide = React.useCallback(() => {
        toastRef.current?.hide();
    }, []);

    // This must use useCallback to ensure the ref doesn't get set to null and then a new ref every render.
    React.useImperativeHandle(
        ref,
        React.useCallback(
            () => ({
                show,
                hide
            }),
            [hide, show]
        )
    );

    return (
        <ToastUI ref={toastRef} {...config} />
    );
});

type ToastRefObj = {
    current: ToastRef | null;
};

let refs: ToastRefObj[] = [];

/**
 * Adds a ref to the end of the array, which will be used to show the toasts until its ref becomes null.
 *
 * @param newRef the new ref, which must be stable for the life of the Toast instance.
 */
function addNewRef(newRef: ToastRef) {
    refs.push({
        current: newRef
    });
}

/**
 * Removes the passed in ref from the file-level refs array using a strict equality check.
 *
 * @param oldRef the exact ref object to remove from the refs array.
 */
function removeOldRef(oldRef: ToastRef | null) {
    refs = refs.filter((r) => r.current !== oldRef);
}

export default function Toast(props: ToastConfig) {
    const toastRef = React.useRef<ToastRef | null>(null);

    /*
      This must use `useCallback` to ensure the ref doesn't get set to null and then a new ref every render.
      Failure to do so will cause whichever Toast *renders or re-renders* last to be the instance that is used,
      rather than being the Toast that was *mounted* last.
    */
    const setRef = React.useCallback((ref: ToastRef | null) => {
        // Since we know there's a ref, we'll update `refs` to use it.
        if (ref) {
            // store the ref in this toast instance to be able to remove it from the array later when the ref becomes null.
            toastRef.current = ref;
            addNewRef(ref);
        } else {
            // remove the this toast's ref, wherever it is in the array.
            removeOldRef(toastRef.current);
        }
    }, []);

    return (
        <ToastRoot ref={setRef} {...props} />
    );
}

/**
 * Get the active Toast instance `ref`, by priority.
 * The "highest" Toast in the `View` hierarchy has the highest priority.
 *
 * For example, a Toast inside a `Modal`, would have had its ref set later than a Toast inside App's Root.
 * Therefore, the library knows that it is currently visible on top of the App's Root
 * and will thus use the `Modal`'s Toast when showing/hiding.
 *
 * ```js
 * <>
 *  <Toast />
 *  <Modal>
 *    <Toast />
 *  </Modal>
 * </>
 * ```
 */
function getRef() {
    const reversePriority = [...refs].reverse();
    const activeRef = reversePriority.find((ref) => ref?.current !== null);
    if (!activeRef) {
        return null;
    }
    return activeRef.current;
}

Toast.show = (showParams: ToastProps) => {
    getRef()?.show(showParams);
};

Toast.hide = () => {
    getRef()?.hide();
};