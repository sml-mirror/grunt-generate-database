
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Hero {
    @PrimaryGeneratedColumn()
    public id?: number;
    @Column()
    public name: string;
    public data: string;
    @Column()
    public detailId?: number;
    @Column("int", { "isArray": true })
    public simpleArray: number[];
}