import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Team} from "../teams/teams.entity";

@Entity('player')
export class Player {
    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true, nullable: false})
    name: string

    @ManyToOne(() => Team, {nullable: false, onDelete: "CASCADE"})
    team: Team
}
