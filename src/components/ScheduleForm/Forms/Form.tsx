import React from 'react';

interface FormProps {
    editableData?: any;
    onSubmitForm: (data: any) => void;
}

type FormRef = {
    expand: (params: FormProps) => void;
    close: () => void;
};

type FormType = 'material' | 'subService';

import MaterialBottomSheet from './MaterialBottomSheet';
import SubServiceBottomSheet from './SubServiceBottomSheet';

const FormRoot = React.forwardRef((props: { type: 'material' | 'subService' }, ref) => {
    const [config, setConfig] = React.useState<FormProps | undefined>(undefined);

    const formRef = React.useRef<any | null>(null);

    const expand = React.useCallback((newProps: FormProps) => {
        setConfig(newProps);
        formRef.current?.expand();
    }, []);

    const close = React.useCallback(() => {
        formRef.current?.close();
    }, []);

    // This must use useCallback to ensure the ref doesn't get set to null and then a new ref every render.
    React.useImperativeHandle(
        ref,
        React.useCallback(
            () => ({
                expand,
                close
            }),
            [close, expand]
        )
    );

    return (
        props.type === 'material' ?
            <MaterialBottomSheet
                bottomSheetRef={formRef}
                {...config}
            />
            :
            <SubServiceBottomSheet
                bottomSheetRef={formRef}
                {...config}
            />
    );
});

type FormRefObject = {
    current: FormRef | null;
    type: FormType;
};

let refs: FormRefObject[] = [];

function addNewRef(newRef: FormRef, type: FormType) {
    refs.push({
        current: newRef,
        type: type
    });
}

/*
    Removes the passed in ref from the file-level refs array using a strict equality check.
*/
function removeOldRef(oldRef: FormRef | null) {
    refs = refs.filter((r) => r.current !== oldRef);
}

export default function Form(props: { type: 'material' | 'subService' }) {
    const formRef = React.useRef<FormRef | null>(null);

    /*
      This must use `useCallback` to ensure the ref doesn't get set to null and then a new ref every render.
      Failure to do so will cause whichever Toast *renders or re-renders* last to be the instance that is used,
      rather than being the Toast that was *mounted* last.
    */
    const setRef = React.useCallback((ref: FormRef | null) => {
        // Since we know there's a ref, we'll update `refs` to use it.
        if (ref) {
            // store the ref in this toast instance to be able to remove it from the array later when the ref becomes null.
            formRef.current = ref;
            addNewRef(ref, props.type);
        } else {
            // remove the this toast's ref, wherever it is in the array.
            removeOldRef(formRef.current);
        }
    }, []);

    return (
        <FormRoot ref={setRef} {...props} />
    );
}

function getRef(type: FormType) {
    const reversePriority = [...refs].reverse();
    const activeRef = reversePriority.find((ref) => ref?.current !== null && ref.type === type);
    if (!activeRef) {
        return null;
    }
    return activeRef.current;
}

Form.expand = (showParams: FormProps & { type: FormType }) => {
    getRef(showParams.type)?.expand(showParams);
};

Form.close = (type: FormType) => {
    getRef(type)?.close();
};