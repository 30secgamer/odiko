import mongoose from "mongoose";

const FavoriteDriverSchema =
  new mongoose.Schema(
    {
      passengerPhone: {
        type: String,
      },

      driverId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Driver",
      },
    },
    {
      timestamps: true,
    }
  );

export default
  mongoose.models
    .FavoriteDriver ||
  mongoose.model(
    "FavoriteDriver",
    FavoriteDriverSchema
  );