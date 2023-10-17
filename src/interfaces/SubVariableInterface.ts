export interface SubVariablesInterface {
    id?: number;
    variableId: number;
    code?: string;
    name: string,
    description?: string
}

export interface SubVariablesQueryInterface extends SubVariablesInterface {
    limit: string,
    page: string
}

export interface SubVariablesBodyInterface {
    body: SubVariablesBodyInterface
}