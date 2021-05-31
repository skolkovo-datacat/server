import {Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe} from '@nestjs/common';
import { PlayersService } from './players.service';
import {CreatePlayerDto, UpdatePlayerDto} from "./players.dto";
import {ApiTags} from "@nestjs/swagger";
import {Player} from "./players.entity";
import {DeleteResult, UpdateResult} from "typeorm";

@Controller('players')
@ApiTags('Players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  async create(@Body() createPlayerDto: CreatePlayerDto): Promise<Player> {
    return this.playersService.create(createPlayerDto);
  }

  @Get()
  async findAll(): Promise<Player[]> {
    return this.playersService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return this.playersService.remove(id);
  }
}
