export interface UserInterface {
    id: number;
    name: string;
    username: string,
    password: string,
    role?: string | null
}

export interface UserQueryInterface extends UserInterface {
    limit: string,
    page: string
}

export interface UserBodyInterface {
    body: UserBodyInterface
}