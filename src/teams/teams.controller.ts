import {Controller, Get, Body, Patch, Param, UseInterceptors, ClassSerializerInterceptor} from '@nestjs/common';
import { TeamsService } from './teams.service';
import {UpdateTeamDto} from "./teams.dto";
import {UpdateResult} from "typeorm";
import {ApiTags} from "@nestjs/swagger";
import {Team} from "./teams.entity";

@Controller('teams')
@ApiTags('Teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(): Promise<Team[]> {
    return this.teamsService.findAll()
  }
  //
  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto): Promise<UpdateResult> {
  //   return this.teamsService.update(+id, updateTeamDto);
  // }
}
