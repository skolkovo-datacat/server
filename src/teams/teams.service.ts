import {Injectable} from '@nestjs/common';
import {UpdateTeamDto} from "./teams.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository, UpdateResult} from "typeorm";
import {Team} from "./teams.entity";

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team)
        private readonly teamsRepository: Repository<Team>
    ) {
    }

    async update(id: number, updateTeamDto: UpdateTeamDto): Promise<UpdateResult> {
        return this.teamsRepository.update(+id, updateTeamDto)
    }

    async findAll(): Promise<Team[]> {
        return this.teamsRepository.find()
    }

    async findOne(id: number): Promise<Team> {
        return this.teamsRepository.findOneOrFail(id)
    }
}
