import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from "class-validator";
import {
  PropertyLocation,
  PropertyStatus,
  PropertyCollection,
} from "../../enums/property.enum";
import { ObjectId } from "mongoose";

@InputType()
export class PropertyUpdate {
  @IsNotEmpty()
  @Field(() => String)
  _id: ObjectId;

  @IsOptional()
  @Field(() => PropertyCollection, { nullable: true })
  propertyCollection?: PropertyCollection;

  @IsOptional()
  @Field(() => PropertyStatus, { nullable: true })
  propertyStatus?: PropertyStatus;

  @IsOptional()
  @Field(() => PropertyLocation, { nullable: true })
  propertyLocation?: PropertyLocation;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  propertyAddress?: string;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  propertyTitle?: string;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  propertyPrice?: number;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  propertyRarityScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true })
  propertyEditions?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true })
  propertyTraitGroups?: number;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  propertyImages?: number;

  @IsOptional()
  @Length(5, 500)
  @Field(() => String, { nullable: true })
  propertyDesc?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  propertyBarter?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  propertyRent?: boolean;

  soldAt?: Date;

  deleteAt?: Date;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  constructedAt?: Date;
}
