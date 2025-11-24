import { useEffect } from "react";
import { replace, Route, useNavigate } from "react-router";

export function loader() {
  return null;
}


export default function HomePage() {
    const navigate = useNavigate();
    useEffect(() =>{
        navigate("/login", {replace: true});
    }, [navigate]);
}
