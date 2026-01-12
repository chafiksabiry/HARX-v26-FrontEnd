import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAIMessage extends Document {
  callId: Types.ObjectId;
  role: 'assistant' | 'system';
  content: string;
  category: 'suggestion' | 'alert' | 'info' | 'action';
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  isProcessed: boolean;
}

const aiMessageSchema = new Schema<IAIMessage>({
  callId: {
    type: Schema.Types.ObjectId,
    ref: 'Call',
    required: true
  },
  role: {
    type: String,
    enum: ['assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['suggestion', 'alert', 'info', 'action'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isProcessed: {
    type: Boolean,
    default: false
  }
});

const AIMessage: Model<IAIMessage> = mongoose.models.AIMessage || mongoose.model<IAIMessage>('AIMessage', aiMessageSchema);

export default AIMessage;

