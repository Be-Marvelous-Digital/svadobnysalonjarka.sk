import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
    {
        username: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['admin'], default: 'admin' },
    },
    { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User = model('User', userSchema);
