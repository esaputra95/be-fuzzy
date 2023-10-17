export interface IndicatorsInterface {
    id?: number;
    subVariableId: number;
    code?: string;
    name: string,
    references?: string;
    description?: string;
    type: number
}

export interface IndicatorsQueryInterface extends IndicatorsInterface {
    limit: string,
    page: string
}

export interface IndicatorsBodyInterface {
    body: IndicatorsBodyInterface
}