import {Injectable} from '@nestjs/common';
import {CreatePlayerDto, UpdatePlayerDto} from "./players.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {DeleteResult, Repository, UpdateResult} from "typeorm";
import {Player} from "./players.entity";
import {Team} from "../teams/teams.entity";
import {TeamsService} from "../teams/teams.service";
import {WsConnService} from "../websocket/ws-conn-service";

@Injectable()
export class PlayersService {
    constructor(
        @InjectRepository(Player)
        private readonly playersRepository: Repository<Player>,
        private readonly teamsService: TeamsService,
        private readonly wsConnService: WsConnService
    ) {
    }

    async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
        let player = await this.playersRepository.findOne({where: {name: createPlayerDto.name}})

        if (player == undefined) {
            let player = new Player()
            player.name = createPlayerDto.name
            player.team = await this.teamsService.findOne(createPlayerDto.teamId)
            return this.playersRepository.save(player)
        }
    }

    async findAll(): Promise<Player[]> {
        return this.playersRepository.find({loadRelationIds: true})
    }

    async findOne(id: number): Promise<Player> {
        return this.playersRepository.findOneOrFail(id)
    }

    async findOneByUsername(username: string): Promise<Player> {
        return this.playersRepository.findOneOrFail({
            relations: ['team'],
            where: {
                name: username
            }
        })
    }

    // async update(id: number, updatePlayerDto: UpdatePlayerDto): Promise<UpdateResult> {
    //     return this.playersRepository.update(id, updatePlayerDto)
    // }

    async remove(id: number): Promise<DeleteResult> {
        const result = await this.playersRepository.delete(id)

        if (result.affected) {
            this.wsConnService.terminateClient(id)
        }

        return result
    }
}
