import {forwardRef, Module} from '@nestjs/common';
import {BroadcastsService} from './broadcasts.service';
import {BroadcastsController} from './broadcasts.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Widget} from "../widgets/widgets.entity";
import {Broadcast} from "./broadcasts.entity";
import {WidgetsModule} from "../widgets/widgets.module";
import {WsModule} from "../websocket/ws.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Broadcast, Widget]),
        forwardRef(() => WidgetsModule)
    ],
    controllers: [BroadcastsController],
    providers: [BroadcastsService],
    exports: [BroadcastsService]
})
export class BroadcastsModule {
}
