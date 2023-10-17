export interface KnowledgeManagementsInterface {
    id?: number;
    code?: string;
    name: string,
    description?: string
}

export interface KnowledgeManagementsQueryInterface extends KnowledgeManagementsInterface {
    limit: string,
    page: string
}

export interface KnowledgeManagementsBodyInterface {
    body: KnowledgeManagementsBodyInterface
}