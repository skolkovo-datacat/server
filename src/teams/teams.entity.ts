import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('team')
export class Team {
    @PrimaryGeneratedColumn()
     id: number

    @Column({ nullable: false })
     color: string

    @Column({ nullable: false })
    name: string
}
