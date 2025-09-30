import prisma from "../config/database"
import { sendToQueue } from "./rabbitmq";



export const banUser = async(userId: string, bannedBy: string, reason?: string) => {
    const admin = await prisma.user.findUnique({
        where: {id: bannedBy, role: 'ADMIN'}
    });
    if(!admin){
        throw new Error("Only Admins can ban user")
    };

    // Check if user exists and is not already banned
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (user.role === 'ADMIN') {
            throw new Error('Cannot ban another admin');
        }

        // Create ban user
        const bannedRecord = await prisma.user.update({
            where: {id: userId},
            data: {
                isOnline: false,
                lastSeen: new Date()
            },
            select: {
                id: true,
                username: true,
                email: true,
                isOnline: true
            }
        });
        // Send To notifications Queue
        await sendToQueue('notification_queue', {
            type: "USER_BANNED",
            userId,
            bannedBy,
            reason,
            timestamp: new Date()
        });

        return bannedRecord
};



export const unbanUser = async(userId: string, unbannedBy: string) => {
    const admin = await prisma.user.findUnique({
        where: {id: unbannedBy, role: 'ADMIN'}
    });

    if (!admin) {
        throw new Error('Only admins can unban users');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error('User not found');
    }

     await sendToQueue('notification_queue', {
        type: 'USER_UNBANNED',
        userId,
        unbannedBy,
        timestamp: new Date()
    });

    return { message: 'User unbanned successfully' };
}


