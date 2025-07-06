import { Schema } from "mongoose";
import {
  PropertyLocation,
  PropertyStatus,
  PropertyCollection,
} from "../libs/enums/property.enum";

const PropertySchema = new Schema(
  {
    propertyCollection: {
      type: String,
      enum: PropertyCollection,
      required: true,
    },

    propertyStatus: {
      type: String,
      enum: PropertyStatus,
      default: PropertyStatus.ACTIVE,
    },

    propertyLocation: {
      type: String,
      enum: PropertyLocation,
      required: true,
    },

    propertyAddress: {
      type: String,
      required: true,
    },

    propertyTitle: {
      type: String,
      required: true,
    },

    propertyPrice: {
      type: Number,
      required: true,
    },

    propertyRarityScore: {
      type: Number,
      required: true,
    },

    propertyEditions: {
      type: Number,
      required: true,
    },

    propertyTraitGroups: {
      type: Number,
      required: true,
    },

    propertyViews: {
      type: Number,
      default: 0,
    },

    propertyLikes: {
      type: Number,
      default: 0,
    },

    propertyComments: {
      type: Number,
      default: 0,
    },

    propertyRank: {
      type: Number,
      default: 0,
    },

    propertyImages: {
      type: [String],
      required: true,
    },

    propertyDesc: {
      type: String,
    },

    propertyBarter: {
      type: Boolean,
      default: false,
    },

    propertyRent: {
      type: Boolean,
      default: false,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },

    soldAt: {
      type: Date,
    },

    deletedAt: {
      type: Date,
    },

    constructedAt: {
      type: Date,
    },
  },
  { timestamps: true, collection: "properties" }
);

PropertySchema.index(
  { propertyCollection: 1, propertyLocation: 1, propertyTitle: 1, propertyPrice: 1 },
  { unique: true }
);

export default PropertySchema;
