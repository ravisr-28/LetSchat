import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Prevent duplicate friend requests in either direction
friendshipSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

const FriendshipModel = mongoose.model("Friendship", friendshipSchema);
export default FriendshipModel;
