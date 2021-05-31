import {BadRequestException, forwardRef, Inject, Injectable} from '@nestjs/common';
import {Widget} from "./widgets.entity";
import {DeleteResult, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {CreateWidgetDto} from "./widgets.dto";
import {FindConditions} from "typeorm/find-options/FindConditions";
import {BroadcastsService} from "../broadcast/broadcasts.service";
import {WsConnService} from "../websocket/ws-conn-service";

@Injectable()
export class WidgetsService {
    constructor(
        @InjectRepository(Widget)
        private readonly widgetsRepository: Repository<Widget>,
        @Inject(forwardRef(() => BroadcastsService))
        private readonly broadcastsService: BroadcastsService,
        @Inject(forwardRef(() => WsConnService))
        private readonly wsConnService: WsConnService
    ) {
    }

    async findAll(broadcastId: number): Promise<Widget[]> {
        return this.widgetsRepository.find({where: {broadcast: {id: broadcastId}}})
    }

    async remove(id: number): Promise<DeleteResult> {
        if (!await this.broadcastsService.isActiveSingular()) {
            throw new BadRequestException('Broadcast is not active')
        }

        let result = this.widgetsRepository.delete(id)
        await this.wsConnService.triggerUpdate(true)
        return result
    }

    async removeWhere(criteria: FindConditions<Widget>) {
        let result = this.widgetsRepository.delete(criteria)
        await this.wsConnService.triggerUpdate(true)
        return result
    }

    async create(createWidgetDto: CreateWidgetDto): Promise<Widget> {
        if (!await this.broadcastsService.isActiveSingular()) {
            throw new BadRequestException('Broadcast is not active')
        }

        let widget = new Widget()

        widget.type = createWidgetDto.type
        widget.data = JSON.stringify(createWidgetDto.data)
        widget.start_time = new Date(createWidgetDto.start_time)
        widget.duration = createWidgetDto.duration
        widget.broadcast = await this.broadcastsService.findSingular()

        let result = await this.widgetsRepository.save(widget)
        await this.wsConnService.triggerUpdate(true)
        return result
    }
}
