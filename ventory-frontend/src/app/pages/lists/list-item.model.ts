export interface ListItem {
    id: number;
    listTypeId: number;
    name: string;
    description?: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
    listType?: {
        id: number;
        name: string;
        code: string;
        description?: string;
    };
}
