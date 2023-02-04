interface Client {
    name: string;
    phone: string;
    address?: string;
}

export interface SubService {
    id: string;
    description: string;
    details: string;
    types: ['hydraulic', 'electric'];
    price: number;
    amount: number;
    service?: Service;
}

export interface Material {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    price: number;
    amount: number;
    profitMargin?: number;
    availability?: boolean;
}

export interface Service {
    id: string;
    name: string;
    subServices: SubService[];
    materials: Material[];
    date: Date | string;
    client?: Client;
}