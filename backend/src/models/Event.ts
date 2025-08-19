import { Schema, model, Document, Types } from "mongoose";

export interface IEvent extends Document {
  user: Types.ObjectId;
  date: Date;
  type: "office" | "vacation";
}

const eventSchema = new Schema<IEvent>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["office", "vacation"],
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IEvent>("Event", eventSchema);
