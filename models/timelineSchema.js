import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  timeline: {
    from: { 
        type: String,
        required: [true, "From date is required"],
    },
    to: {
        type: String,
        required: [true, "To date is required"],
    },
  }
});

export const Timeline = mongoose.model("Timeline", timelineSchema);