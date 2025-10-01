import prisma from "../config/database";



export const addReaction = async (messageId: string, userId: string, emoji: string) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId }
  });

  if (!message) {
    throw new Error('Message not found');
  }

  // Check if user has already reacted with this emoji
  const existingReaction = await prisma.message_reactions.findFirst({
    where: {
      message_id: messageId,
      user_id: userId,
      emoji
    }
  });

  if (existingReaction) {
    throw new Error('You have already reacted with this emoji');
  }

  const reaction = await prisma.message_reactions.create({
    data: {
      message_id: messageId,
      user_id: userId,
      emoji
    },
    include: {
      users: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    }
  });

  return reaction;
};

export const removeReaction = async (messageId: string, userId: string, emoji: string) => {
  const reaction = await prisma.message_reactions.findFirst({
    where: {
      message_id: messageId,
      user_id: userId,
      emoji
    }
  });

  if (!reaction) {
    throw new Error('Reaction not found');
  }

  await prisma.message_reactions.delete({
    where: { id: reaction.id }
  });

  return { success: true };
};


export const getMessageReactions = async (messageId: string) => {
  const reactions = await prisma.message_reactions.findMany({
    where: { message_id: messageId },
    include: {
      users: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    }
  });

  // Group by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction.users);
    return acc;
  }, {} as Record<string, any[]>);

  return groupedReactions;
};

