import {PartialType} from "@nestjs/swagger";
import {IsHexColor, IsNotEmpty} from 'class-validator';

export class CreateTeamDto {
    @IsHexColor()
    readonly color: string

    @IsNotEmpty()
    readonly name: string
}

export class UpdateTeamDto extends PartialType(CreateTeamDto) {}
