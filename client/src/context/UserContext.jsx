
import { useState, useEffect } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true khi đang kiểm tra session

    useEffect(() => {
        axios
            .get("http://localhost:5000/auth/me", { withCredentials: true })
            .then((res) => setUser(res.data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
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
