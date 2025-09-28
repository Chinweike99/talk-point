import prisma from "../config/database"
import { excludeFields } from "../utils/helpers";



export const getAllUsers = async() => {
    const users = await prisma.user.findMany({
        orderBy: {createdAt: 'desc'}
    });

    return users.map(user => excludeFields(user, ['password']))
}


export const getUserById = async(userId: string) => {
    const user = await prisma.user.findUnique({
        where: {id: userId},
        include: {
            sentMessages: {
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    receiver: {
                        select:{
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            },
            receivedMessages: {
                take: 10,
                orderBy: { createdAt: 'desc'},
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            }
        }
    });

    if(!user){
        throw new Error("User not found")
    }
    return excludeFields(user, ['password'])
};

export const getAdminProfile = async()=>{
    const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });
    if(!admin){
        throw new Error("Admin not found")
    }
    return excludeFields(admin, ['password'])
}


export const updateUserStatus = async (userId: string, isOnline: boolean) => {
    return await prisma.user.update({
        where: {id: userId},
        data: {
            isOnline,
            lastSeen: isOnline ? new Date() : undefined
        }
    });
}

