import mongoose from "mongoose";

const searchSessionSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    originalQuery: {
      type: String,
      default: "",
    },
    structuredInput: {
      type: Object,
      default: {},
    },
    expandedQueries: {
      type: [String],
      default: [],
    },
    topPublicationIds: {
      type: [String],
      default: [],
    },
    topTrialIds: {
      type: [String],
      default: [],
    },
    resultCounts: {
      publications: { type: Number, default: 0 },
      trials: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const SearchSession = mongoose.model("SearchSession", searchSessionSchema);

export default SearchSession;
