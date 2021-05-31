import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('broadcast')
export class Broadcast {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    active: boolean

    @Column({default: new Date().toISOString(), nullable: false})
    start_time: Date
}