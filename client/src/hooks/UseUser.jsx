import { useContext } from "react";
import { UserContext } from "../context/UserContext";

// Custom hook để dùng ở mọi component
export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser phải dùng bên trong <UserProvider>");
    return ctx;
}