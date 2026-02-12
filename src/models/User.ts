import { Table, Column, DataType, HasMany, Model, Default, Unique, AllowNull } from "sequelize-typescript";
import Budget from "./Budget";

@Table({
    tableName: 'users'
})
class User extends Model {
    @AllowNull(false)
    @Column({
        type: DataType.STRING(50)
    })
    declare name: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(60)
    })
    declare password: string;

    @AllowNull(false)
    @Unique(true)
    @Column({
        type: DataType.STRING(50)
    })
    declare email: string;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(6)
    })
    declare token: string;

    @AllowNull(false)
    @Default(false)
    @Column({
        type: DataType.BOOLEAN
    })
    declare confirmed: boolean;
    
    // Un usuario tiene varios budgets
    @HasMany(() => Budget, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    declare budgets: Budget[];
}

export default User;