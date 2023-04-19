import { BusinessData } from "screens/Main/Business";

type BusinessScreen = {
	businessData?: BusinessData;
};

export declare global {
	namespace ReactNavigation {
		interface RootParamList {
			home: {
				service: "created" | "deleted";
			};
			overview: undefined;
			schedule: {
				serviceId: string;
			};
			invoice: {
				serviceId: string;
			};
			service: {
				serviceId: string;
				updated?: boolean;
			};
			dayAgenda: {
				dateString: string;
			};
			business: undefined;
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
