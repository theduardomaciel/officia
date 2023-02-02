export interface Service {
    date: Date | string;
    type: string;
    description: string;
    value: number;
    quantity: number;
    client: {
        name: string;
        phone: string;
        address: string;
    };
}