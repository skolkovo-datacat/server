import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Broadcast} from "../broadcast/broadcasts.entity";

@Entity('widget')
export class Widget {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    type: string

    @Column({nullable: false})
    data: string

    @Column({nullable: false})
    duration: number

    @Column({default: new Date().toISOString(), nullable: false})
    start_time: Date

    @ManyToOne(() => Broadcast, {nullable: false, onDelete: "CASCADE"})
    broadcast: Broadcast
}