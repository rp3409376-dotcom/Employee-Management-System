import { useMemo, useState } from "react";
import { AuthContext } from "./authStore";

const getStoredUser = () => {
    try {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return null;
    }
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser);

    const login = (nextUser, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(nextUser));
        setUser(nextUser);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    const value = useMemo(() => ({ user, login, logout }), [user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
