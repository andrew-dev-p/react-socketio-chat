import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: {
        $ne: loggedInUserId,
      },
    });

    res.status(200).json(filteredUsers);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  const { id: targetUserId } = req.params;
  const currentUserId = req.user._id;

  try {
    const chatMessages = await Message.find({
      $or: [
        {
          senderId: currentUserId,
          recieverId: targetUserId,
        },
        {
          senderId: targetUserId,
          receiverId: currentUserId,
        },
      ],
    });

    res.status(200).json(chatMessages);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: recieverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      recieverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // todo: socketio logic

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
