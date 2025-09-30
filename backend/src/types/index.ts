export type User = {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Room = {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Message = {
  id: string;
  content: string;
  imageUrl?: string;
  messageType: 'TEXT' | 'IMAGE' | 'SYSTEM';
  senderId: string;
  receiverId?: string;
  roomId?: string;
  isRead: boolean;
  createdAt: Date;
};

// export type Request = Request & {
//   user: {
//     id: string;
//     email: string;
//     role: string;
//   };
// } ;

export type SocketAuth = {
  userId: string;
  username: string;
  role: string;
};