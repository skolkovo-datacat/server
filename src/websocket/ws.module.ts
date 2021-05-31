import {forwardRef, Module} from '@nestjs/common';
import {WsStateService} from "./ws-state-service";
import {WsGatewayService} from "./ws-gateway-service";
import {ConfigModule} from "@nestjs/config";
import {PlayersModule} from "../players/players.module";
import {WsConnService} from "./ws-conn-service";
import {MetricsService} from "../metrics/metrics.service";
import {TeamsModule} from "../teams/teams.module";
import {WidgetsModule} from "../widgets/widgets.module";
import {BroadcastsModule} from "../broadcast/broadcasts.module";

@Module({
    imports: [
        ConfigModule,
        forwardRef(() => PlayersModule),
        TeamsModule,
        WidgetsModule,
        BroadcastsModule
    ],
    providers: [WsStateService, WsGatewayService, WsConnService, MetricsService],
    exports: [WsGatewayService, WsConnService]
})
export class WsModule {}
