import { Table, Column, DataType, HasMany, Model, AllowNull, ForeignKey, BelongsTo } from "sequelize-typescript";
import Expense from "./Expense";
import User from "./User";

@Table({
    tableName: 'budgets'
})
class Budget extends Model {
    @AllowNull(false)
    @Column({
        type: DataType.STRING(100)
    })
    declare name: string;

    @AllowNull(false)
    @Column({
        type: DataType.DECIMAL
    })
    declare amount: number;
    // El atributo declare le indicamos al ts que el atributo ya esta definido en SQUELIZE, nostros solo nos enfocamos de crear el modelo

    // Un budget tiene varios expense
    @HasMany(() => Expense, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    declare expenses: Expense[];
    
    // Un budget tiene un solo usuario
    @ForeignKey(() => User)
    declare userId: number;

    @BelongsTo(() => User)
    declare user: User
}

export default Budget;