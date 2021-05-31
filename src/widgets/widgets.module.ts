import {forwardRef, Module} from '@nestjs/common';
import {WidgetsService} from './widgets.service';
import {WidgetsController} from './widgets.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Widget} from "./widgets.entity";
import {Team} from "../teams/teams.entity";
import {TeamsModule} from "../teams/teams.module";
import {BroadcastsModule} from "../broadcast/broadcasts.module";
import {WsModule} from "../websocket/ws.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Widget]),
        BroadcastsModule,
        forwardRef(() => WsModule)
    ],
    controllers: [WidgetsController],
    providers: [WidgetsService],
    exports: [WidgetsService]
})
export class WidgetsModule {
}
