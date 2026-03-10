import cloudinary from "../lib/cloudinary.js";
import UserModel from "../models/user_model.js";
import MessageModel from "../models/message_model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUser = await UserModel.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUser);
  } catch (err) {
    console.log("Error fetching contacts:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const message = await MessageModel.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(message);
  } catch (err) {
    console.log("Error fetching messages:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res
        .status(400)
        .json({ message: "Message text or image is required" });
    }
    if (senderId.equals(receiverId)) {
      return res
        .status(400)
        .json({ message: "You cannot send a message to yourself" });
    }

    const reveiverExists = await UserModel.findById({ _id: receiverId });
    if (!reveiverExists) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let imageUrl;
    if (image) {
      // Retry logic for transient network errors (e.g. ECONNRESET in dev)
      let uploadResponse;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          uploadResponse = await cloudinary.uploader.upload(image, {
            resource_type: "image",
            timeout: 30000,
          });
          break; // success, exit loop
        } catch (uploadErr) {
          console.log(
            `Cloudinary upload attempt ${attempt}/3 failed:`,
            uploadErr.message,
          );
          if (attempt === 3) throw uploadErr;
          await new Promise((r) => setTimeout(r, 1000)); // wait 1s before retry
        }
      }
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new MessageModel({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (err) {
    console.log("Error sending message:", err.message || err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const message = await MessageModel.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        message.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString(),
        ),
      ),
    ];

    const chatPartners = await UserModel.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");
    res.status(200).json(chatPartners);
  } catch (err) {
    console.log("Error fetching chat partners:", err);
    res.status(500).json({ message: "Server error" });
  }
};
