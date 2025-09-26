'use server';

import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/lib/models";
import type { User } from "@/lib/types";
import { revalidatePath } from "next/cache";

type AuthInput = {
    email: string;
    password?: string;
    role: 'admin' | 'teacher';
}

type AuthResult = {
    success: boolean;
    message?: string;
    user?: User;
}

export async function authenticate(credentials: AuthInput): Promise<AuthResult> {
    await dbConnect();
    try {
        const user = await UserModel.findOne({ email: credentials.email, role: credentials.role }).lean();

        if (!user) {
            return { success: false, message: 'المستخدم غير موجود أو الدور غير صحيح.' };
        }

        // In a real app, you would use bcrypt.compare to check the password
        if (user.password !== credentials.password) {
            return { success: false, message: 'كلمة المرور غير صحيحة.' };
        }
        
        const userObject: User = { ...user, id: user._id.toString() };
        delete userObject.password;

        return { success: true, user: JSON.parse(JSON.stringify(userObject)) };

    } catch (error) {
        console.error('Authentication error:', error);
        return { success: false, message: 'حدث خطأ في الخادم.' };
    }
}

export async function getUser(userId: string): Promise<User> {
    await dbConnect();
    const user = await UserModel.findById(userId).lean();
    if (!user) throw new Error("لم يتم العثور على المستخدم.");
    const userObject = { ...user, id: user._id.toString() };
    delete userObject.password;
    return JSON.parse(JSON.stringify(userObject));
}

type UpdatePayload = {
    name: string;
    email: string;
    avatarDataUrl?: string | null;
}

export async function updateUser(userId: string, payload: UpdatePayload): Promise<User> {
    await dbConnect();
    const { name, email, avatarDataUrl } = payload;
    const updateData: Partial<User> = { name, email };
    if (avatarDataUrl) {
        updateData.avatarUrl = avatarDataUrl;
    }
    
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true }).lean();
    if (!updatedUser) throw new Error("فشل تحديث المستخدم.");

    revalidatePath(`/${updatedUser.role}/profile`);

    const userObject = { ...updatedUser, id: updatedUser._id.toString() };
    delete userObject.password;
    return JSON.parse(JSON.stringify(userObject));
}

export async function updatePassword(userId: string, password: string): Promise<{ success: boolean }> {
    await dbConnect();
    // In a real app, hash the password with bcrypt before saving
    await UserModel.findByIdAndUpdate(userId, { password: password });
    return { success: true };
}
