import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { Properties, Property } from "../../libs/dto/property/property";
import { Direction, Message } from "../../libs/enums/common.enum";
import {
  AgentPropertiesInquiry,
  AllPropertiesInquiry,
  OrdinaryInquiry,
  PropertiesInquiry,
  PropertyInput,
} from "../../libs/dto/property/property.input";
import { MemberService } from "../member/member.service";
import { StatisticModifier, T } from "../../libs/types/common";
import { PropertyStatus } from "../../libs/enums/property.enum";
import { ViewGroup } from "../../libs/enums/view.enum";
import { ViewService } from "../view/view.service";
import { PropertyUpdate } from "../../libs/dto/property/property.update";
import {
  lookupAuthMemberLiked,
  lookupMember,
  shapeIntoMongoObjectId,
} from "../../libs/config";
import * as moment from "moment";
import { LikeService } from "../like/like.service";
import { LikeInput } from "../../libs/dto/like/like.input";
import { LikeGroup } from "../../libs/enums/like.enum";

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel("Property") private readonly propertyModel: Model<Property>,
    private memberService: MemberService,
    private viewService: ViewService,
    private likeService: LikeService
  ) {}

  public async createProperty(input: PropertyInput): Promise<Property> {
    try {
      const result = await this.propertyModel.create(input);
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: "memberProperties",
        modifier: 1,
      });
      return result;
    } catch (err) {
      console.log("Error, Service.model:", err.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async getProperty(
    memberId: ObjectId,
    propertyId: ObjectId
  ): Promise<Property> {
    const search: T = {
      _id: propertyId,
      propertyStatus: PropertyStatus.ACTIVE,
    };

    const targetProperty: Property = await this.propertyModel
      .findOne(search)
      .lean()
      .exec();
    if (!targetProperty)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput = {
        memberId: memberId,
        viewRefId: propertyId,
        viewGroup: ViewGroup.PROPERTY,
      };
      const newView = await this.viewService.recordView(viewInput);
      if (newView) {
        await this.propertyStatsEditor({
          _id: propertyId,
          targetKey: "propertyViews",
          modifier: 1,
        });
        targetProperty.propertyViews++;
      }

      // mewLiked
      const likeInput = {
        memberId: memberId,
        likeRefId: propertyId,
        likeGroup: LikeGroup.PROPERTY,
      };
      targetProperty.meLiked =
        await this.likeService.checkLikeExistance(likeInput);
    }

    targetProperty.memberData = await this.memberService.getMember(
      null,
      targetProperty.memberId
    );
    console.log("target property:", targetProperty);

    return targetProperty;
  }

  public async updateProperty(
    memberId: ObjectId,
    input: PropertyUpdate
  ): Promise<Property> {
    let { propertyStatus, soldAt, deleteAt } = input;
    const search: T = {
      _id: input._id,
      memberId: memberId,
      propertyStatus: PropertyStatus.ACTIVE,
    };

    if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
    else if (propertyStatus === PropertyStatus.DELETE)
      deleteAt = moment().toDate();

    const result = await this.propertyModel
      .findOneAndUpdate(search, input, {
        new: true,
      })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (soldAt || deleteAt) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: "memberProperties",
        modifier: -1,
      });
    }

    return result;
  }

  public async getProperties(
    memberId: ObjectId,
    input: PropertiesInquiry
  ): Promise<Properties> {
    const match: T = {
      propertyStatus: PropertyStatus.ACTIVE,
    };

    if (input.search.memberId) {
      const thatMemberId = shapeIntoMongoObjectId(input.search.memberId);
      match.memberId = thatMemberId;
    }

    const sort: T = {
      [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC,
    };

    this.shapeMatchQuery(match, input);
    console.log("match", match);

    const result = await this.propertyModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupAuthMemberLiked(memberId),
              lookupMember,
              { $unwind: "$memberData" },
            ],
            metaCounter: [{ $count: "total" }],
          },
        },
      ])
      .exec();

    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  private shapeMatchQuery(match: T, input: PropertiesInquiry): void {
    const {
      memberId,
      locationList,
      roomList,
      bedsList: editionsList,
      collectionList,
      periodsRange,
      pricesRange,
      squaresRange,
      options,
      text,
    } = input.search;
    if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
    if (locationList) match.propertyLocation = { $in: locationList };
    if (roomList) match.propertyTraitGroups = { $in: roomList };
    if (editionsList) match.propertyEditions = { $in: editionsList };
    if (collectionList) match.propertyCollection = { $in: collectionList };

    if (pricesRange)
      match.propertyPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
    if (periodsRange)
      match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
    if (squaresRange)
      match.propertyRarityScore = {
        $gte: squaresRange.start,
        $lte: squaresRange.end,
      };

    if (text) match.propertyTitle = { $regex: new RegExp(text, "i") };
    if (options) {
      match["$or"] = options.map((ele) => {
        return { [ele]: true };
      });
    }
  }

  public async getFavorites(
    memberId: ObjectId,
    input: OrdinaryInquiry
  ): Promise<Properties> {
    return await this.likeService.getFavoriteProperties(memberId, input);
  }

  public async getVisited(
    memberId: ObjectId,
    input: OrdinaryInquiry
  ): Promise<Properties> {
    return await this.viewService.getVisitedProperties(memberId, input);
  }

  public async getAgentProperties(
    memberId: ObjectId,
    input: AgentPropertiesInquiry
  ): Promise<Properties> {
    const { propertyStatus } = input.search;
    if (propertyStatus === PropertyStatus.DELETE)
      throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

    const match: T = {
      memberId: memberId,
      propertyStatus: propertyStatus ?? { $ne: PropertyStatus.DELETE },
    };
    const sort: T = {
      [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC,
    };

    const result = await this.propertyModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              // meLiked
              lookupMember,
              { $unwind: "$memberData" },
            ],
            metaCounter: [{ $count: "total" }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  public async likeTargetProperty(
    memberId: ObjectId,
    likeRefId: ObjectId
  ): Promise<Property> {
    const target: Property = await this.propertyModel
      .findOne({ _id: likeRefId, propertyStatus: PropertyStatus.ACTIVE })
      .exec();
    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.PROPERTY,
    };

    const modifier: number = await this.likeService.toggleLike(input);
    const result = await this.propertyStatsEditor({
      _id: likeRefId,
      targetKey: "propertyLikes",
      modifier: modifier,
    });

    if (!result)
      throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
    return result;
  }

  public async getAllPropertiesByAdmin(
    input: AllPropertiesInquiry
  ): Promise<Properties> {
    const { propertyStatus, propertyLocationList } = input.search;
    const match: T = {};
    const sort: T = {
      [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC,
    };

    if (propertyStatus) match.propertyStatus = propertyStatus;
    if (propertyLocationList)
      match.propertyLocation = { $in: propertyLocationList };

    const result = await this.propertyModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: "$memberData" },
            ],
            metaCounter: [{ $count: "total" }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  public async updatePropertyByAdmin(input: PropertyUpdate): Promise<Property> {
    let { propertyStatus, soldAt, deleteAt } = input;
    const search: T = {
      _id: input._id,
      propertyStatus: PropertyStatus.ACTIVE,
    };

    if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
    else if (propertyStatus === PropertyStatus.DELETE)
      deleteAt = moment().toDate();

    const result = await this.propertyModel
      .findOneAndUpdate(search, input, {
        new: true,
      })
      .lean()
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (soldAt || deleteAt) {
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: "memberProperties",
        modifier: -1,
      });
    }

    return result;
  }

  public async removePropertyByAdmin(propertyId: ObjectId): Promise<Property> {
    console.log("propertyId", propertyId);

    const search: T = {
      _id: propertyId,
      propertyStatus: PropertyStatus.DELETE,
    };
    const result = await this.propertyModel.findOneAndDelete(search).exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

    return result;
  }

  public async propertyStatsEditor(
    input: StatisticModifier
  ): Promise<Property> {
    const { _id, targetKey, modifier } = input;
    return await this.propertyModel
      .findByIdAndUpdate(
        _id,
        { $inc: { [targetKey]: modifier } },
        { new: true }
      )
      .exec();
  }
}
