import {Module} from '@nestjs/common';
import {TeamsService} from './teams.service';
import {TeamsController} from './teams.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Team} from "./teams.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Team])],
    controllers: [TeamsController],
    providers: [TeamsService],
    exports: [TeamsService]
})
export class TeamsModule {
}
