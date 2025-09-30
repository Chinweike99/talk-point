import prisma from "../config/database"



export const creatRoom = async (name: string, description: string, isPublic: boolean, createdBy: string,) => {
  
    const existingRoom = await prisma.room.findUnique({where: {name}});

    if(existingRoom){
        throw new Error("Room name exists")
    };

    const room = await prisma.room.create({
        data: {
            name, description, isPublic, createdBy,
            members: {
                create: {
                    userId: createdBy,
                    role: 'ADMIN'
                }
            }
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            isOnline: true
                        }
                    }
                }
            },
            creator: {
                select :{
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        }
    })
    return room
};

export const getAllRooms = async(userId?: string) => {
    const rooms = await prisma.room.findMany({
        where: {
            OR: [
                {isPublic: true },
                ...(userId ? [{ members: {some: {userId}}}] : [])
            ]
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            isOnline: true
                        }
                    }
                }
            },
            creator: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            _count: {
                select: {
                    members: true,
                    messages: true
                }
            }
        },
        orderBy: { createdAt: 'desc'}
    });
    return rooms
};


export const getRoomById = async(roomId: string, userId?: string) => {
    const room = await prisma.room.findUnique({
        where: {id: roomId},
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            isOnline: true,
                            role: true
                        }
                    }
                }
            },
            creator: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            messages: {
                take: 50,
                orderBy: {createdAt: 'desc'},
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
    if(!room){
        throw new Error('Room not found')
    };

    if(!room.isPublic && userId) {
        const isMember = room.members.some(member => member.userId === userId);
        if(!isMember){
            throw new Error('You do not have Access to this room')
        }
    }

    return room
};


export const joinRoom = async(roomId: string, userId: string) => {
    const room = await prisma.room.findUnique({where: {id: roomId}});

    if(!room){
        throw new Error('Room not found');
    };

    if(!room.isPublic){
        throw new Error('This is a private room. You need an invitation to join.');
    };

    const existingMember = await prisma.roomMember.findUnique({
        where: {
            userId_roomId: {
                userId, roomId
            }
        }
    });

    if(existingMember){
        throw new Error("You are already a member of this room")
    };

    // Add room member
    const roomMember = await prisma.roomMember.create({
        data:{
            userId, roomId, role: "MEMBER"
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    isOnline: true
                }
            },
            room: true
        }
    });
    return roomMember;
}

export const addUserToRoom = async(roomId: string, userId: string, addedBy: string) => {
   // Verify that the adder is an admin 
    const adderMembership = await prisma.roomMember.findUnique({
        where: {
            userId_roomId:{
                userId: addedBy,
                roomId
            }
        }
    });

    if(!adderMembership || adderMembership.role !== 'ADMIN') {
        throw new Error('You must be an admin of the room to add members');
    }

  // Check if user is already a member
  const existingMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId
      }
    }
  });

  if (existingMember) {
    throw new Error('User is already a member of this room');
  }

  // Add user to room
  const roomMember = await prisma.roomMember.create({
    data: {
      userId,
      roomId,
      role: 'MEMBER'
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
          isOnline: true
        }
      },
      room: true
    }
  });

  return roomMember;
};



export const leaveRoom = async (roomId: string, userId: string) => {
  // Check if user is a member
  const membership = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId
      }
    },
    include: {
      room: true
    }
  });

  if (!membership) {
    throw new Error('You are not a member of this room');
  }

  // If user is the last admin, prevent leaving or transfer admin rights
  if (membership.role === 'ADMIN') {
    const adminCount = await prisma.roomMember.count({
      where: {
        roomId,
        role: 'ADMIN'
      }
    });

    if (adminCount === 1) {
      // Find another member to make admin or delete room if empty
      const otherMember = await prisma.roomMember.findFirst({
        where: {
          roomId,
          userId: { not: userId }
        }
      });

      if (otherMember) {
        await prisma.roomMember.update({
          where: { id: otherMember.id },
          data: { role: 'ADMIN' }
        });
      } else {
        // No other members, delete the room
        await prisma.room.delete({
          where: { id: roomId }
        });
        return { action: 'room_deleted' };
      }
    }
  }

  // Remove user from room
  await prisma.roomMember.delete({
    where: {
      userId_roomId: {
        userId,
        roomId
      }
    }
  });

  return { action: 'left_room' };
};


export const getMyRooms = async (userId: string) => {
  const rooms = await prisma.room.findMany({
    where: {
      members: {
        some: { userId }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              isOnline: true
            }
          }
        }
      },
      creator: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              username: true
            }
          }
        }
      },
      _count: {
        select: {
          members: true,
          messages: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return rooms;
};

