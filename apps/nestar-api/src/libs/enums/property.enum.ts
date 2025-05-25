import { registerEnumType } from "@nestjs/graphql";

export enum PropertyCollection {
  // APARTMENT = "APARTMENT",
  // VILLA = "VILLA",
  // HOUSE = "HOUSE",
  ART = "ART",
  MUSIC = "MUSIC",
  COLLECTIBLE = "COLLECTIBLE",
  SPORTS = "SPORTS",
}
registerEnumType(PropertyCollection, {
  name: "PropertyCollection",
});

export enum PropertyStatus {
  ACTIVE = "ACTIVE",
  SOLD = "SOLD",
  DELETE = "DELETE",
}
registerEnumType(PropertyStatus, {
  name: "PropertyStatus",
});

export enum PropertyLocation {
  SEOUL = "SEOUL",
  BUSAN = "BUSAN",
  INCHEON = "INCHEON",
  DAEGU = "DAEGU",
  GYEONGJU = "GYEONGJU",
  GWANGJU = "GWANGJU",
  CHONJU = "CHONJU",
  DAEJON = "DAEJON",
  JEJU = "JEJU",
}
registerEnumType(PropertyLocation, {
  name: "PropertyLocation",
});
