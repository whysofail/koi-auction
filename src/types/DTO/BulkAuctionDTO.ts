import {
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsDateString,
  IsPositive,
  Min,
} from "class-validator";
import { AuctionStatus } from "../../entities/Auction";

export class BulkAuctionDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsOptional()
  @IsString()
  rich_description?: string;

  @IsString()
  @MinLength(1)
  item!: string;

  @IsDateString()
  start_datetime!: string;

  @IsDateString()
  end_datetime!: string;

  @IsOptional()
  @IsEnum(AuctionStatus)
  status?: AuctionStatus;

  @IsOptional()
  @IsPositive()
  @Min(0)
  buynow_price?: number;

  @IsPositive()
  participation_fee!: number;

  @IsPositive()
  bid_increment!: number;

  @IsPositive()
  bid_starting_price!: number;
}
