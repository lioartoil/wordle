import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Matches, Max, Min, ValidateNested } from 'class-validator';

export class Try {
  @Matches(/^[a-z]{5}$/i)
  word: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 }, { each: true })
  @Min(0, { each: true })
  @Max(4, { each: true })
  yellows?: number[];

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 }, { each: true })
  @Min(0, { each: true })
  @Max(4, { each: true })
  greens?: number[];
}

export class Wordle {
  @ValidateNested({ each: true })
  @Type(() => Try)
  tries: Try[];
}

export class GetWordsRequest {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Wordle)
  wordles: Wordle[];
}
