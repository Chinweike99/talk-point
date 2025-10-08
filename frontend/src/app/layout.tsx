import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
// import { ChatProvider } from "@/contexts/ChatContext";
import { EnhancedChatProvider } from "@/contexts/EnhancedChatContext";
import { ChatProvider } from "@/contexts/ChatContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'talk-point - Real-time Messaging',
  description: 'Professional chat application built with Next.js, Socket.io, and RabbitMQ',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ChatProvider>
          {/* <EnhancedChatProvider> */}
            {children}
          {/* </EnhancedChatProvider> */}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
