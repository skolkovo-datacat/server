import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Broadcast} from "./broadcasts.entity";
import {Repository} from "typeorm";
import {WsConnService} from "../websocket/ws-conn-service";

@Injectable()
export class BroadcastsService {
    constructor(
        @InjectRepository(Broadcast)
        private readonly broadcastsRepository: Repository<Broadcast>
    ) {
    }

    private async findOne(id: number): Promise<Broadcast> {
        return this.broadcastsRepository.findOneOrFail(id)
    }

    private async setActive(id: number, value: boolean): Promise<Broadcast> {
        let broadcast = await this.findOne(id)

        broadcast.active = value

        if (value) {
            broadcast.start_time = new Date()
        }

        return this.broadcastsRepository.save(broadcast)
    }

    private async isActive(id: number): Promise<boolean> {
        let broadcast = await this.findOne(id)
        return broadcast.active
    }

    async findSingular() {
        return this.findOne(1)
    }

    async setActiveSingular(value: boolean) {
        return this.setActive(1, value)
    }

    async isActiveSingular() {
        return this.isActive(1)
    }
}
