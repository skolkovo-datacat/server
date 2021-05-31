import {Broadcast} from "../broadcast/broadcasts.entity";
import {IsDate, IsDateString, IsInt, IsObject, IsString} from "class-validator";

export class CreateWidgetDto {
    @IsString()
    readonly type: string

    @IsObject()
    readonly data: any

    @IsInt()
    readonly duration: number

    @IsDateString()
    readonly start_time: string

    @IsInt()
    readonly broadcastId: number
}