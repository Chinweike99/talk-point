import { PrismaClient } from "@prisma/client";
import argon2 from 'argon2';

const prisma = new PrismaClient();

const seed = async() => {
    try {
        const existingAdmin = await prisma.user.findFirst({
            where: {role: 'ADMIN'}
        });
        if(!existingAdmin){
            const hashedPassword = await argon2.hash("chinweike99");
            await prisma.user.create({
                data: {
                    email: 'talkpoint@gmail.com',
                    username: 'Admin Chinweike',
                    password: hashedPassword,
                    role: 'ADMIN'
                }
            })
        }
        console.log(`Admin created `)
    }  catch (error) {
    console.error('Seed error:', error);
    throw new Error("Unable to create admin")
  } finally {
    await prisma.$disconnect();
  }
};

seed();