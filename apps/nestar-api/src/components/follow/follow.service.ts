import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import {
  Follower,
  Followers,
  Following,
  Followings,
} from "../../libs/dto/follow/follow";
import { MemberService } from "../member/member.service";
import { Direction, Message } from "../../libs/enums/common.enum";
import { FollowInquiry } from "../../libs/dto/follow/follow.input";
import { T } from "../../libs/types/common";
import {
  lookupAuthMemberFollowed,
  lookupAuthMemberLiked,
  lookupFollowerData,
  lookupFollowingData,
} from "../../libs/config";
import { exec } from "child_process";

@Injectable()
export class FollowService {
  constructor(
    @InjectModel("Follow")
    private readonly followModel: Model<Follower | Following>,
    private readonly memberService: MemberService
  ) {}

  public async subscribe(
    followerId: ObjectId,
    followingId: ObjectId
  ): Promise<Follower> {
    // murojatchi=> followerId, bosqa bir member => followingId: Usha followingid ga biz subscribe bolmoqchimz
    if (followerId.toString() === followingId.toString()) {
      // har ikkala ObjectId ni Stringga otkazgan holda qiymatlarni solshtrb olamz: sababi qiymatlari bir xil bolsada => reference har xil tushuncha
      throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED); // followerId, followingId bir xil qiymatdagi malumot bolganda err beradi(yani oziga ozi subscription bolshi mn emas!)
    }

    const targetMember = await this.memberService.getMember(null, followingId); // 1-murojatchini null kornshda beramz, followingId => subscription bolmoqchi bolgan member
    if (!targetMember)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const result = await this.registerSubscription(followerId, followingId); // registerSubscriptionni royxatga olsh

    await this.memberService.memberStatsEditor({
      _id: followerId,
      targetKey: "memberFollowings",
      modifier: 1,
    }); // ozmi memberFollowings birga oshadi
    await this.memberService.memberStatsEditor({
      _id: followingId,
      targetKey: "memberFollowers",
      modifier: 1,
    }); // boshqa memberni memberFollowers ham 1ga oshadi

    return result;
  }

  private async registerSubscription(
    followerId: ObjectId,
    followingId: ObjectId
  ): Promise<Follower> {
    // followerId => Biz, followingId => boshqa member (usha memberga bz follow qmoqchimz)
    try {
      return await this.followModel.create({
        // yangi follower hosl qlnadi
        followingId: followingId,
        followerId: followerId,
      });
    } catch (err) {
      console.log("Error, Service.model: ", err.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async unsubscribe(
    followerId: ObjectId,
    followingId: ObjectId
  ): Promise<Follower> {
    const targetMember = await this.memberService.getMember(null, followingId); // unsubscribe qmochi bolgan memberni bor yoqligi tek qlnadi
    if (!targetMember)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const result = await this.followModel
      .findOneAndDelete({
        followingId: followingId,
        followerId: followerId,
      })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    await this.memberService.memberStatsEditor({
      _id: followerId,
      targetKey: "memberFollowings",
      modifier: -1,
    }); // bz boshqa bir memberni memberFollowingni 1 ga ishirtramz => follow bolsak
    await this.memberService.memberStatsEditor({
      _id: followingId,
      targetKey: "memberFollowers",
      modifier: -1,
    }); //

    return result;
  }

  public async getMemberFollowings(
    memberId: ObjectId,
    input: FollowInquiry
  ): Promise<Followings> {
    const { page, limit, search } = input;
    if (!search?.followerId)
      throw new InternalServerErrorException(Message.BAD_REQUEST);
    const match: T = { followerId: search?.followerId }; // followerId: ni searchni ichidan kelyotgan followerId ga tenglemz
    console.log("match: ", match);

    const result = await this.followModel
      .aggregate([
        { $match: match },
        { $sort: { createdAt: Direction.DESC } },
        {
          $facet: {
            // 2 xil array natijani oberad: list hamda metaCounter
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              // meLiked
              lookupAuthMemberLiked(memberId, "$followingId"),
              // meFollowed
              lookupAuthMemberFollowed({
                followerId: memberId,
                followingId: "$followingId",
              }),
              lookupFollowingData,
              { $unwind: "$followingData" }, // following bolgan memberimzni toliq malumotini oberadi
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

  public async getMemberFollowers(
    memberId: ObjectId,
    input: FollowInquiry
  ): Promise<Followers> {
    const { page, limit, search } = input;
    if (!search?.followingId)
      throw new InternalServerErrorException(Message.BAD_REQUEST);

    const match: T = { followingId: search?.followingId }; // followingId: ni searchni ichidan kelyotgan followingId ga tenglemz
    console.log("match: ", match);

    const result = await this.followModel
      .aggregate([
        // agregate mantigi => DB ichida sodir boladi, BACKEND DA EMAS!
        { $match: match },
        { $sort: { createdAt: Direction.DESC } },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              // meLiked => bz like bosganmzi
              lookupAuthMemberLiked(memberId, "$followerId"),
              // meFollowed
              lookupAuthMemberFollowed({
                followerId: memberId,
                followingId: "$followerId",
              }),
              lookupFollowerData,
              { $unwind: "$followerData" },
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
}
