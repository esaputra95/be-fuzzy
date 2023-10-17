export interface FactorsInterface {
    id?: number;
    code?: string;
    name: string,
    description?: string
}

export interface FactorsQueryInterface extends FactorsInterface {
    limit: string,
    page: string
}

export interface FactorsBodyInterface {
    body: FactorsBodyInterface
}