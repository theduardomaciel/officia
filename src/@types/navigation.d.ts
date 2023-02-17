export declare global {
    namespace ReactNavigation {
        interface RootParamList {
            home: {
                service: 'created' | 'deleted',
            };
            overview: undefined;
            business: undefined;
            service: {
                serviceId: string
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