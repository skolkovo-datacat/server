import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {TeamsModule} from './teams/teams.module';
import {PlayersModule} from './players/players.module';
import {BroadcastsModule} from './broadcast/broadcasts.module';
import {WidgetsModule} from './widgets/widgets.module';
import { WsModule } from './websocket/ws.module';
import {ConfigModule} from "@nestjs/config";
import { MetricsService } from './metrics/metrics.service';

@Module({
    imports: [
        TypeOrmModule.forRoot({autoLoadEntities: true}),
        TeamsModule,
        PlayersModule,
        BroadcastsModule,
        WidgetsModule,
        WsModule,
        ConfigModule.forRoot()
    ],
    controllers: [],
    providers: [MetricsService],
})
export class AppModule {
}
