import {Schema, model, Document} from 'mongoose';

export interface IUser extends Document {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'coworker';
  team?: string[];
}

const userSchema = new Schema<IUser>(
  {
    id: {type: String, required: true, unique: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {
      type: String,
      enum: ['admin', 'manager', 'coworker'],
      default: 'coworker',
    },
    team: {type: [String], default: []},
  },
  {timestamps: true}
);

export default model<IUser>('User', userSchema);
