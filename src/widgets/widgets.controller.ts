import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post} from '@nestjs/common';
import { WidgetsService } from './widgets.service';
import {DeleteResult} from "typeorm";
import {CreateWidgetDto} from "./widgets.dto";
import {Widget} from "./widgets.entity";

@Controller('widgets')
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Get()
  async findAll() {
    return this.widgetsService.findAll(1);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return this.widgetsService.remove(id)
  }

  @Post()
  async create(@Body() createWidgetDto: CreateWidgetDto): Promise<Widget> {
    return this.widgetsService.create(createWidgetDto)
  }
}
