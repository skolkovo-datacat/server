import {Controller, Get, ParseBoolPipe, Put, Query} from '@nestjs/common';
import {BroadcastsService} from './broadcasts.service';
import {Broadcast} from "./broadcasts.entity";
import {WidgetsService} from "../widgets/widgets.service";

@Controller('broadcast')
export class BroadcastsController {
    constructor(
        private readonly broadcastService: BroadcastsService,
        private readonly widgetsService: WidgetsService
    ) {
    }

    @Get()
    async findAll(): Promise<Broadcast> {
        return this.broadcastService.findSingular()
    }

    @Put('/active')
    async setActive(@Query('value', ParseBoolPipe) value: boolean): Promise<Broadcast> {
        let result = await this.broadcastService.setActiveSingular(value);
        await this.widgetsService.removeWhere({broadcast: result})
        return result
    }
}
