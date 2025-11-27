import React from "react";
import { Navigate , Outlet} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateRoute = ({children, roles}) => {
    const { rol, loading } = useAuth();
    const rols = {
        'Administrador': 1,
        'User': 2,
    };
    // Mapear los roles de texto a sus valores numéricos
    const mappedRoles = roles.map(role => rols[role]);

    // Verificar si el rol del usuario está en los roles permitidos
    const isRoleAllowed = mappedRoles.includes(parseInt(rol));
    if (loading) {
        return <div>Loading...</div>; // or a spinner
    }
    if (!isRoleAllowed) {
        return (<div>
            No tienes permisos para ver este contenido.
        </div>);
    }

    return children;
}