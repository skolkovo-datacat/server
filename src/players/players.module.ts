import {forwardRef, Module} from '@nestjs/common';
import {PlayersService} from './players.service';
import {PlayersController} from './players.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Player} from "./players.entity";
import {TeamsModule} from "../teams/teams.module";
import {WsModule} from "../websocket/ws.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Player]),
        TeamsModule,
        WsModule
    ],
    controllers: [PlayersController],
    providers: [PlayersService],
    exports: [PlayersService]
})
export class PlayersModule {
}
