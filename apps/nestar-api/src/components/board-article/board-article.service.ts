import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { BoardArticle } from "../../libs/dto/board-article/board-article";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class BoardArticleService {
  @InjectModel("BoardArticle")
  private readonly boardArticleModel: Model<BoardArticle>;
}
