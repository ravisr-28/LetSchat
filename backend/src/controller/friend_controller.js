import FriendshipModel from "../models/friendship_model.js";
import UserModel from "../models/user_model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Helper: check if two users are friends
export async function areFriends(userA, userB) {
  const friendship = await FriendshipModel.findOne({
    $or: [
      { requesterId: userA, recipientId: userB, status: "accepted" },
      { requesterId: userB, recipientId: userA, status: "accepted" },
    ],
  });
  return !!friendship;
}

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const requesterId = req.user._id;
    const { id: recipientId } = req.params;

    if (requesterId.equals(recipientId)) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself" });
    }

    const recipientExists = await UserModel.findById(recipientId);
    if (!recipientExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends or pending in either direction
    const existing = await FriendshipModel.findOne({
      $or: [
        { requesterId, recipientId },
        { requesterId: recipientId, recipientId: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(400).json({ message: "Already friends" });
      }
      if (existing.status === "pending") {
        return res.status(400).json({ message: "Friend request already sent" });
      }
      // If declined, allow re-sending by updating
      existing.requesterId = requesterId;
      existing.recipientId = recipientId;
      existing.status = "pending";
      await existing.save();
    } else {
      await FriendshipModel.create({ requesterId, recipientId });
    }

    // Notify recipient via socket
    const recipientSocketId = getReceiverSocketId(recipientId.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("friendRequestReceived", {
        _id: requesterId,
        username: req.user.username,
        profilePic: req.user.profilePic,
      });
    }

    res.status(200).json({ message: "Friend request sent" });
  } catch (err) {
    console.log("Error sending friend request:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const recipientId = req.user._id;
    const { id: requesterId } = req.params;

    const friendship = await FriendshipModel.findOne({
      requesterId,
      recipientId,
      status: "pending",
    });

    if (!friendship) {
      return res.status(404).json({ message: "No pending request found" });
    }

    friendship.status = "accepted";
    await friendship.save();

    // Get both user profiles for the socket events
    const requester = await UserModel.findById(requesterId).select("-password");
    const recipient = await UserModel.findById(recipientId).select("-password");

    // Notify the requester that their request was accepted
    const requesterSocketId = getReceiverSocketId(requesterId.toString());
    if (requesterSocketId) {
      io.to(requesterSocketId).emit("friendRequestAccepted", recipient);
    }

    res.status(200).json({ message: "Friend request accepted", friend: requester });
  } catch (err) {
    console.log("Error accepting friend request:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Decline a friend request
export const declineFriendRequest = async (req, res) => {
  try {
    const recipientId = req.user._id;
    const { id: requesterId } = req.params;

    const friendship = await FriendshipModel.findOne({
      requesterId,
      recipientId,
      status: "pending",
    });

    if (!friendship) {
      return res.status(404).json({ message: "No pending request found" });
    }

    friendship.status = "declined";
    await friendship.save();

    res.status(200).json({ message: "Friend request declined" });
  } catch (err) {
    console.log("Error declining friend request:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all friends (accepted)
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const friendships = await FriendshipModel.find({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: "accepted",
    });

    const friendIds = friendships.map((f) =>
      f.requesterId.toString() === userId.toString()
        ? f.recipientId
        : f.requesterId,
    );

    const friends = await UserModel.find({ _id: { $in: friendIds } }).select(
      "-password",
    );
    res.status(200).json(friends);
  } catch (err) {
    console.log("Error fetching friends:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get pending incoming requests
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const pending = await FriendshipModel.find({
      recipientId: userId,
      status: "pending",
    });

    const requesterIds = pending.map((p) => p.requesterId);
    const requesters = await UserModel.find({
      _id: { $in: requesterIds },
    }).select("-password");

    res.status(200).json(requesters);
  } catch (err) {
    console.log("Error fetching pending requests:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get sent pending requests (to show "Pending" on contacts)
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const sent = await FriendshipModel.find({
      requesterId: userId,
      status: "pending",
    });

    const recipientIds = sent.map((s) => s.recipientId.toString());
    res.status(200).json(recipientIds);
  } catch (err) {
    console.log("Error fetching sent requests:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove a friend
export const removeFriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: friendId } = req.params;

    const result = await FriendshipModel.findOneAndDelete({
      $or: [
        { requesterId: userId, recipientId: friendId, status: "accepted" },
        { requesterId: friendId, recipientId: userId, status: "accepted" },
      ],
    });

    if (!result) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    res.status(200).json({ message: "Friend removed" });
  } catch (err) {
    console.log("Error removing friend:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel a sent friend request
export const cancelFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: recipientId } = req.params;

    const result = await FriendshipModel.findOneAndDelete({
      requesterId: userId,
      recipientId,
      status: "pending",
    });

    if (!result) {
      return res.status(404).json({ message: "No pending request found" });
    }

    res.status(200).json({ message: "Friend request cancelled" });
  } catch (err) {
    console.log("Error cancelling friend request:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
