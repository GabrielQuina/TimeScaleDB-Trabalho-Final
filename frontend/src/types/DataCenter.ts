
export type DataCenter = {
    id : number;
    dataCenter: string;
    temperature : number;
    sector : string;
    room: string;
    tags: string[];
    metadata: {
        rack?: string;
        humidity?: number;
        sensors?: {
            name: string;
            status: string;
        }[];
    };
    recordedAt?: string;
}

export type DataCenterFormData = Omit<DataCenter, 'id' | 'metadata' | 'recordedAt'> & {
    rack: string;
    humidity: number;
}

export type DataCenterStats = {
    setores: {
        sector: string;
        total: number;
        averageTemperature: number;
        maxTemperature: number;
        minTemperature: number;
    }[];
    tags: {
        tag: string;
        total: number;
    }[];
    sensores: {
        dataCenter: string;
        sensor: string;
        status: string;
    }[];
}
