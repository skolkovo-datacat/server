import {PartialType} from "@nestjs/mapped-types";
import {IsInt, IsNotEmpty} from "class-validator";

export class CreatePlayerDto {
    @IsNotEmpty()
    readonly name: string

    @IsInt()
    readonly teamId: number
}

export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {}
