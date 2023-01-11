export type User = {
    user_id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    dob: Date;
    password: string;
    password_salt: string;
    password_iterations: number;
    lastLogin: Date;
    lastModifiedBy: number;
    lastModifiedByDate: Date;
    created_date: Date;
};
