import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Timeline } from "../models/timelineSchema.js";
import ErrorHandler from "../middlewares/error.js";

export const postTimeline = catchAsyncErrors(async (req, res, next) => {
  const { title, description, from, to } = req.body;

  const newTimeline = await Timeline.create({
    title,
    description,
    timeline: {
      from,
      to
    }
  });

  res.status(201).json({
    success: true,
    message: "Timeline created successfully",
    data: newTimeline
  });
});

export const deleteTimeline = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const timeline = await Timeline.findByIdAndDelete(id);

  if (!timeline) {
    return next(new Error("Timeline not found", 400));
  }
  await timeline.deleteOne();
  res.status(200).json({
    success: true,
    message: "Timeline deleted successfully",
    data: {}
  });
});

export const getAllTimeline = catchAsyncErrors(async (req, res, next) => {
  const timelines = await Timeline.find();

  res.status(200).json({
    success: true,
    data: timelines
  });
});

