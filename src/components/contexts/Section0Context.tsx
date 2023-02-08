import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

// Types
import type { CalendarDate } from 'components/Calendar';
import type { MaterialModel } from 'database/models/materialModel';
import type { SubServiceModel } from 'database/models/subServiceModel';

interface ScheduleFormContextProps {
    data: {
        // Section 0
        name: string;
        subServices: SubServiceModel[];
        date: CalendarDate | undefined;
        time: Date;
        additionalInfo: string;
        materials: MaterialModel[];
    },
    setData: {
        // Section 0
        setName: Dispatch<SetStateAction<string>>;
        setSubServices: Dispatch<SetStateAction<SubServiceModel[]>>;
        setDate: Dispatch<SetStateAction<CalendarDate | undefined>>;
        setTime: Dispatch<SetStateAction<Date>>;
        setAdditionalInfo: Dispatch<SetStateAction<string>>;
        setMaterials: Dispatch<SetStateAction<MaterialModel[]>>;
    }
}

const ScheduleFormContext = createContext<ScheduleFormContextProps>({} as ScheduleFormContextProps);

export function Section0ContextProvider({ children }: { children: React.ReactNode }) {
    // Section 0
    const [name, setName] = useState('')
    const [subServices, setSubServices] = useState<SubServiceModel[]>([]);
    const [date, setDate] = useState<CalendarDate | undefined>(undefined);
    const [time, setTime] = useState(new Date())
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [materials, setMaterials] = useState<MaterialModel[]>([]);

    const contextProps = {
        data: {
            name, subServices, date, time, additionalInfo, materials,
        },
        setData: {
            setName, setSubServices, setDate, setTime, setAdditionalInfo, setMaterials,
        }
    }

    return (
        <ScheduleFormContext.Provider value={contextProps}>
            {children}
        </ScheduleFormContext.Provider>
    )
}

export function useScheduleFormSection0Context() {
    return useContext(ScheduleFormContext);
}