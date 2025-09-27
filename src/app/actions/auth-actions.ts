'use server';

import dbConnect from "@/lib/mongodb";
import { UserModel, TeacherModel, ClassModel } from "@/lib/models";
import type { User, Teacher } from "@/lib/types";
import { revalidatePath } from "next/cache";

type AuthRole = 'admin' | 'teacher';

type AuthInput = {
    email: string;
    password?: string;
    role: AuthRole;
}

type UnifiedUser = Omit<User & Teacher, '_id'> & { id: string };

type AuthResult = {
    success: boolean;
    message?: string;
    user?: UnifiedUser;
}

export async function authenticate(credentials: AuthInput): Promise<AuthResult> {
    await dbConnect();
    try {
        let userDoc: User | Teacher | null = null;
        
        if (credentials.role === 'admin') {
            userDoc = await UserModel.findOne({ email: credentials.email }).lean();
        } else if (credentials.role === 'teacher') {
            userDoc = await TeacherModel.findOne({ email: credentials.email }).lean();
        }

        if (!userDoc) {
            return { success: false, message: 'المستخدم غير موجود.' };
        }

        // In a real app, you would use bcrypt.compare to check the password
        if (userDoc.password !== credentials.password) {
            return { success: false, message: 'كلمة المرور غير صحيحة.' };
        }
        
        const userObject = { ...userDoc, id: userDoc._id.toString() };
        delete userObject.password;
        delete (userObject as any)._id;

        return { success: true, user: userObject as UnifiedUser };

    } catch (error) {
        console.error('Authentication error:', error);
        return { success: false, message: 'حدث خطأ في الخادم.' };
    }
}

export async function getUser(userId: string, role: AuthRole): Promise<UnifiedUser | null> {
    await dbConnect();
    let userDoc: User | Teacher | null = null;
    
    if (role === 'admin') {
        userDoc = await UserModel.findById(userId).lean();
    } else {
        userDoc = await TeacherModel.findById(userId).lean();
    }
    
    if (!userDoc) return null;

    const userObject = { ...userDoc, id: userDoc._id.toString() };
    delete userObject.password;
    delete (userObject as any)._id;
    return userObject as UnifiedUser;
}

type UpdatePayload = {
    name: string;
    email: string;
    avatarDataUrl?: string | null;
}

export async function updateUser(userId: string, role: AuthRole, payload: UpdatePayload): Promise<UnifiedUser> {
    await dbConnect();
    const { name, email, avatarDataUrl } = payload;
    const updateData: Partial<User | Teacher> = { name, email };
    if (avatarDataUrl) {
        updateData.avatarUrl = avatarDataUrl;
    }
    
    let updatedUser: User | Teacher | null = null;

    if (role === 'admin') {
        updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true }).lean();
    } else {
        updatedUser = await TeacherModel.findByIdAndUpdate(userId, updateData, { new: true }).lean();
    }

    if (!updatedUser) throw new Error("فشل تحديث المستخدم.");

    revalidatePath(`/${updatedUser.role}/profile`);

    const userObject = { ...updatedUser, id: updatedUser._id.toString() };
    delete userObject.password;
    delete (userObject as any)._id;
    return userObject as UnifiedUser;
}

export async function updatePassword(userId: string, role: AuthRole, password: string): Promise<{ success: boolean }> {
    await dbConnect();
    // In a real app, hash the password with bcrypt before saving
    if (role === 'admin') {
        await UserModel.findByIdAndUpdate(userId, { password: password });
    } else {
         await TeacherModel.findByIdAndUpdate(userId, { password: password });
    }
    return { success: true };
}
