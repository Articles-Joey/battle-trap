"use client";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";

export default function SocketLogicHandler() {
    const router = useRouter();
    const pathname = usePathname();
    const nickname = useStore((state) => state.nickname);
    const socket = useSocketStore((state) => state.socket);
    const connected = useSocketStore((state) => state.connected);
    const connectSocket = useSocketStore((state) => state.connectSocket);
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            connectSocket();
        }
    }, [connectSocket]);

    useEffect(() => {
        const connect = () => {
            useSocketStore.getState().setConnected(true);
            socket.emit("getUserCount");
        };
        const disconnect = () => useSocketStore.getState().setConnected(false);
        const forcePage = (data) => router.push(data.page);
        const userCount = (count) => useSocketStore.getState().setTotalUsers(count);
        const landing = (data) => useStore.getState().setLobbyDetails(data);
        socket.on("connect", connect);
        socket.on("disconnect", disconnect);
        socket.on("force-page", forcePage);
        socket.on("userCount", userCount);
        socket.on("game:battle-trap-landing-details", landing);
        if (socket.connected) connect();
        else disconnect();
        return () => {
            socket.off("connect", connect);
            socket.off("disconnect", disconnect);
            socket.off("force-page", forcePage);
            socket.off("userCount", userCount);
            socket.off("game:battle-trap-landing-details", landing);
        };
    }, [socket, router]);

    useEffect(() => {
        if (connected) socket.emit("nickname", nickname);
    }, [nickname, connected, socket]);

    useEffect(() => {
        if (connected) socket.emit("activePage", pathname);
    }, [pathname, connected, socket]);
    return null;
}
