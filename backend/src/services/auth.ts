import argon2  from "argon2";
import prisma from "../config/database"
import { excludeFields, generateToken } from "../utils/helpers";




export const registerUser = async (email: string, username: string, password: string) =>{
    const existingUser = await prisma.user.findFirst({where: {email}});

    if(existingUser){
        throw new Error("Email exists, try loging in")
    };

    const hashedPassword = await argon2.hash(password)
    const user = await prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword,
            role: 'USER'
        }
    });

    const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
    })

    const userWithoutPassword = excludeFields(user, ['password']);

    return {
        user: userWithoutPassword,
        token
    }
}


export const loginUser = async(email: string, password: string) => {
    const existingUser = await prisma.user.findUnique({where: {email}});
    if(!existingUser){
        throw new Error("User does not exist, create an account to continue")
    };

    const comparePassword = await argon2.verify(existingUser.password, password);
    if(!comparePassword){
        throw new Error('Invalid email or password')
    };

    // Update user online status
    await prisma.user.update({
        where: {id: existingUser.id},
        data: { isOnline: true}
    });

    // generate JWT token
    const token = generateToken({
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role
    });

    const userWithoutPassword = excludeFields(existingUser, ['password'])
    return {
        user: userWithoutPassword,
        token
    };
}


export const logoutUser = async(userId: string) => {
    await prisma.user.update({
        where: {id: userId},
        data: {
            isOnline:false,
            lastSeen: new Date()
        }
    })
}




