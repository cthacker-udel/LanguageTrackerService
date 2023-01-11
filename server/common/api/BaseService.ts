/**
 * The base service class, which is used to establish a standard when creating services
 */
export class BaseService {
    protected TABLE_NAME: string;

    /**
     * The name of the table we are primarily accessing
     *
     * @param tableName - The name of the table we are accessing
     */
    public constructor(tableName: string) {
        this.TABLE_NAME = `"${tableName}"`;
    }

    public setTableName = (tableName: string): void => {
        this.TABLE_NAME = `"${tableName}"`;
    };
}
