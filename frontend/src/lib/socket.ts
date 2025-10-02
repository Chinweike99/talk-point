import { Socket } from "socket.io-client";


class SocketService{
    private socket: Socket | null = null
    private listeners: Map<string, Function[]> = new Map()

    


}