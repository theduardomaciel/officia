import { useCallback, useEffect, useState } from "react";

import SaveButton from "components/Business/SaveButton";

export interface StateToWatch {
	name: string;
	state: any;
}

export interface FormChangesObserver {
	currentData: any;
	watch?: (callback: (value: any) => void) => { unsubscribe: () => void };
	statesToWatch?: StateToWatch[];
}

export default function useFormChangesObserver({
	watch,
	currentData,
	statesToWatch,
}: FormChangesObserver) {
	const [hasDifferences, setHasDifferences] = useState(false);

	useEffect(() => {
		if (watch) {
			const subscription = watch((value) => {
				setHasDifferences(
					JSON.stringify(currentData) !== JSON.stringify(value)
				);
			});
			return () => subscription.unsubscribe();
		}
	}, [watch, currentData]);

	useEffect(() => {
		if (statesToWatch) {
			const hasDifferences = statesToWatch.some(
				({ name, state }) => currentData[name] !== state
			);
			setHasDifferences(hasDifferences);
		}
	}, [statesToWatch]);

	const FormSaveButton = useCallback(
		({ onPress }: { onPress: () => void }) => (
			<SaveButton hasDifferences={hasDifferences} submitData={onPress} />
		),
		[hasDifferences]
	);

	return { FormSaveButton, hasDifferences };
}
