import { useState, useEffect, createContext } from "react";
import axios from "axios";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true khi đang kiểm tra session

    useEffect(() => {
        console.log("UserProvider: Checking session via /auth/me...");
        axios
            .get("http://localhost:5000/auth/me", { withCredentials: true })
            .then((res) => {
                console.log("UserProvider: Session check success:", res.data.user);
                setUser(res.data.user);
            })
            .catch((err) => {
                console.log("UserProvider: Session check failed/no user.");
                setUser(null);
            })
            .finally(() => {
                console.log("UserProvider: Loading set to false.");
                setLoading(false);
            });
    }, []);

    const logout = async () => {
        await axios.post(
            "http://localhost:5000/auth/logout",
            {},
            { withCredentials: true },
        );
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </UserContext.Provider>
    );
}
