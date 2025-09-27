'use server';

import dbConnect from "@/lib/mongodb";
import { UserModel, TeacherModel } from "@/lib/models";
import type { User, Teacher } from "@/lib/types";
import { revalidatePath } from "next/cache";

type AuthInput = {
    email: string;
    password?: string;
    role: 'admin' | 'teacher';
}

type AuthResult = {
    success: boolean;
    message?: string;
    user?: User | Teacher;
}

export async function authenticate(credentials: AuthInput): Promise<AuthResult> {
    await dbConnect();
    try {
        let userDoc;
        if (credentials.role === 'admin') {
            userDoc = await UserModel.findOne({ email: credentials.email }).lean();
        } else {
            userDoc = await TeacherModel.findOne({ email: credentials.email }).lean();
        }
        
        if (!userDoc) {
            return { success: false, message: 'المستخدم غير موجود.' };
        }

        if (userDoc.role !== credentials.role) {
             return { success: false, message: 'الدور المحدد غير صحيح لهذا المستخدم.' };
        }

        // In a real app, you would use bcrypt.compare to check the password
        if (userDoc.password !== credentials.password) {
            return { success: false, message: 'كلمة المرور غير صحيحة.' };
        }
        
        const userObject: User | Teacher = { ...userDoc, id: userDoc._id.toString() };
        delete userObject.password;

        return { success: true, user: JSON.parse(JSON.stringify(userObject)) };

    } catch (error) {
        console.error('Authentication error:', error);
        return { success: false, message: 'حدث خطأ في الخادم.' };
    }
}

export async function getUser(userId: string, role: 'admin' | 'teacher'): Promise<User | Teacher> {
    await dbConnect();
    let user;
    if (role === 'admin') {
        user = await UserModel.findById(userId).lean();
    } else {
        user = await TeacherModel.findById(userId).lean();
    }
    
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

export async function updateUser(userId: string, role: 'admin' | 'teacher', payload: UpdatePayload): Promise<User | Teacher> {
    await dbConnect();
    const { name, email, avatarDataUrl } = payload;
    const updateData: Partial<User | Teacher> = { name, email };
    if (avatarDataUrl) {
        updateData.avatarUrl = avatarDataUrl;
    }
    
    let updatedUser;
    if (role === 'admin') {
         updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true }).lean();
    } else {
         updatedUser = await TeacherModel.findByIdAndUpdate(userId, updateData, { new: true }).lean();
    }

    if (!updatedUser) throw new Error("فشل تحديث المستخدم.");

    revalidatePath(`/${updatedUser.role}/profile`);

    const userObject = { ...updatedUser, id: updatedUser._id.toString() };
    delete userObject.password;
    return JSON.parse(JSON.stringify(userObject));
}

export async function updatePassword(userId: string, role: 'admin' | 'teacher', password: string): Promise<{ success: boolean }> {
    await dbConnect();
    // In a real app, hash the password with bcrypt before saving
    if (role === 'admin') {
        await UserModel.findByIdAndUpdate(userId, { password: password });
    } else {
        await TeacherModel.findByIdAndUpdate(userId, { password: password });
    }
    return { success: true };
}
