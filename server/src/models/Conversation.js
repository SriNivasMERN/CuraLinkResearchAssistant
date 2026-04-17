import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New research conversation",
    },
    activeDiseaseContext: {
      type: String,
      default: "",
    },
    activeLocationContext: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;

