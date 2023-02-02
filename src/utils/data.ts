export interface SubService {
    id: string;
    description: string;
    details: string;
    types: ['hydraulic', 'electric'];
    price: number;
    amount: number;
    service?: {
        name: string;
        date: Date | string;
        client: {
            name: string;
            phone: string;
            address: string;
        };
    }
}