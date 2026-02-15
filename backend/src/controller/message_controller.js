import cloudinary from "../lib/cloudinary.js";
import UserModel from "../models/user_model.js";
import MessageModel from "../models/message_model.js";

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

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new MessageModel({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();
    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (err) {
    console.log("Error sending message:", err);
    res.status(500).json({ message: "Server error" });
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
