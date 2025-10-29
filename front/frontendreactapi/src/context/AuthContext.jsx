import React, {createContext, useContext, useState, useEffect, use} from "react";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(() => localStorage.getItem("authToken") || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem("authToken", token);
        setToken(token);
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{token, login, logout, loading, setLoading}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
