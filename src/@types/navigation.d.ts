export declare global {
    namespace ReactNavigation {
        interface RootParamList {
            home: {
                service: 'created' | 'deleted',
            };
            overview: undefined;
            business: undefined;
            schedule: {
                serviceId: string
            };
            invoice: {
                serviceId: string
            };
            service: {
                serviceId: string;
                updated?: boolean
            };
            dayAgenda: {
                dateString: string
            };
            bankAccount: undefined;
            socialMedia: undefined;
            additionalInfo: undefined;
            phoneAndAddress: undefined;
        }
    }
}