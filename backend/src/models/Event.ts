import {Schema, model, Document, Types} from 'mongoose';

export interface IEvent extends Document {
  id: string;
  userId: string;
  date: Date;
  type: 'office' | 'vacation';
}

const eventSchema = new Schema<IEvent>(
  {
    id: {type: String, required: true, unique: true},
    userId: {type: String, required: true},
    date: {type: Date, required: true},
    type: {
      type: String,
      enum: ['office', 'vacation'],
      required: true,
    },
  },
  {timestamps: true}
);

export default model<IEvent>('Event', eventSchema);
