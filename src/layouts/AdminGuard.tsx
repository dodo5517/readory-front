import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { fetchCurrentUser } from "../api/Auth";

export default function AdminGuard() {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const { setUser } = useUser();

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/login", { replace: true });
            return;
        }

        fetchCurrentUser()
            .then((u) => {
                setUser(u);

                const isAdmin = u?.role === "ADMIN";
                if (!isAdmin) {
                    navigate("/", { replace: true });
                    return;
                }

                setChecking(false);
            })
            .catch(() => {
                localStorage.removeItem("accessToken");
                navigate("/login", { replace: true });
            });
    }, [navigate, setUser]);

    if (checking) return null; // 또는 로딩 UI
    return <Outlet />;
}
