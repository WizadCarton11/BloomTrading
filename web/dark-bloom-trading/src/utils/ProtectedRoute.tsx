import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthService } from "@/lib/api";

const ProtectedRoute = () => {
    const [authChecked, setAuthChecked] = useState(false);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await AuthService.get("/api/auth/me");
                if (res.status === 200) {
                    setIsAuth(true);
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
            } finally {
                setAuthChecked(true);
            }
        };

        checkAuth();
    }, []);

    if (!authChecked) {
        return <div className="flex items-center justify-center h-screen">Checking authentication...</div>;
    }

    return isAuth ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
