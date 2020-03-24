
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import { GenerateHistory } from "grunt-generate-history-model";

@Entity("y_hero")
@GenerateHistory({historyPath: "./test/src/model/hero"})
export class Hero {
    @PrimaryGeneratedColumn()
    public id?: number;
    @Column()
    public name: string;
    public data: string;
    @Column()
    public detailId?: number;
    @Column({type: "integer", array: true, nullable: true})
    public simpleArray: number[];
}