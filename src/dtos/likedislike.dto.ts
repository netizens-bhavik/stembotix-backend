import { IsString, IsBoolean } from "class-validator";

export class LikeDislikeDTO {
    @IsBoolean()
    public like: boolean;

    @IsBoolean()
    public dislike: boolean
}