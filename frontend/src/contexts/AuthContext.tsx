// 'use client'

// import { usersAPI } from "@/lib/api";
// import { socketService } from "@/lib/socket";
// import { User } from "@/types";
// import React, { createContext, useContext, useEffect, useState } from "react";


// interface AuthContextType {
//     user: User | null;
//     isLoading: boolean;
//     login: (user: User, token: string) => void;
//     logout: ()=> void;
//     isAdmin: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children}) => {
//     const [user, setUser] = useState<User | null>(null);
//     const [isLoading, setIsLoading] = useState(true)

//     useEffect(() => {
//         const initAuth = async() =>   {
//             try {
//                 const token = localStorage.getItem('chat-token')
//                     const userData = localStorage.getItem('chat-user')
//                     if(token && userData) {
//                         const parsedUser = JSON.parse(userData)
//                         setUser(parsedUser)
//                         socketService.connect(token);

//                         await usersAPI.getMyProfile()
//                     }
//             } catch (error) {
//                 console.error("Auth initialization: ", error)
//                 localStorage.removeItem('chat-token')
//                 localStorage.removeItem('chat-user')
//                 setUser(null)
//             }finally{
//                 setIsLoading(false)
//             }
//         }
//         initAuth()
//     }, [])

//     const login = (userData: User, token: string) => {
//         localStorage.setItem('chat-token', token);
//         localStorage.setItem('chat-user', JSON.stringify(userData))
//         setUser(userData)
//         socketService.connect(token)
//     };

//     const logout = () => {
//         localStorage.removeItem('chat-token')
//         localStorage.removeItem('chat-user')
//         setUser(null)
//         socketService.disconnect()
//     }

//     const isAdmin = user?.role === 'ADMIN';

//     return (
//         <AuthContext.Provider value={{user, isLoading, login, logout, isAdmin}}>
//             {children}
//         </AuthContext.Provider>
//     )
// }


// export const useAuth =()=>{
//     const context = useContext(AuthContext)
//     if(context === undefined){
//         throw new Error('useAuth must be used within AuthProvider')
//     }
//     return context;
// }



'use client'

import { usersAPI } from "@/lib/api";
import { socketService } from "@/lib/socket";
import { User } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("chat-token");
        const userData = localStorage.getItem("chat-user");

        if (token && userData && userData !== "undefined") {
          try {
            const parsedUser: User = JSON.parse(userData);
            setUser(parsedUser);
            socketService.connect(token);

            const profile = await usersAPI.getMyProfile();
            if (profile?.data) setUser(profile.data);
          } catch (err) {
            console.error("Failed to parse userData from localStorage:", err);
            localStorage.removeItem("chat-token");
            localStorage.removeItem("chat-user");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization: ", error);
        localStorage.removeItem("chat-token");
        localStorage.removeItem("chat-user");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem("chat-token", token);
    localStorage.setItem("chat-user", JSON.stringify(userData));
    setUser(userData);
    socketService.connect(token);
  };

  const logout = () => {
    localStorage.removeItem("chat-token");
    localStorage.removeItem("chat-user");
    setUser(null);
    socketService.disconnect();
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
