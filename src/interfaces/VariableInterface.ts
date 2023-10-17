export interface VariablesInterface {
    id?: number;
    code?: string;
    name: string,
    description?: string
}

export interface VariablesQueryInterface extends VariablesInterface {
    limit: string,
    page: string
}

export interface VariablesBodyInterface {
    body: VariablesBodyInterface
}