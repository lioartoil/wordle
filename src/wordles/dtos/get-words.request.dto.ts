import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Matches, Max, Min, ValidateNested } from 'class-validator';

export class Match {
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
  @Matches(/^[a-z]{5}$/i)
  word: string;

  @ValidateNested({ each: true })
  @Type(() => Match)
  matches: Match[];
}

export class GetWordsRequest {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Wordle)
  wordles: Wordle[];
}
