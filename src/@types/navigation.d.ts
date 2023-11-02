import { BusinessData } from "screens/Main/Business";

type BusinessScreen = {
    businessData?: BusinessData;
};

export declare global {
    namespace ReactNavigation {
        interface RootParamList {
            Home: {
                order: "created" | "deleted";
            };
            Overview: undefined;
            Schedule: {
                orderId: string;
            };
            invoice: {
                orderId: string;
            };
            order: {
                orderId: string;
                updated?: boolean;
            };
            dayAgenda: {
                dateString: string;
            };
            Business: undefined;
            bankAccount: BusinessScreen;
            socialMedia: BusinessScreen;
            basicInfo: BusinessScreen;
            categories: BusinessScreen;
            additionalInfo: BusinessScreen;
            contactAndAddress: BusinessScreen;
            settings: BusinessScreen;
            digitalSignature: BusinessScreen;
            /* Auth */
            register: {
                email: string;
            };
            businessRegister: undefined;
            /* Drawer Screens */
            profile: undefined;
            clients: undefined;
            catalog: undefined;
            customization: undefined;
            subscription: undefined;
            /* Drawer Menu Screens */
            manageData: undefined;
        }
    }
}
