import { useEffect } from "react";
import { replace, Route, useNavigate } from "react-router";
import DashBoard from "~/commons/dashboard";

export function loader() {
  return null;
}


export default function EventsPage() {
    return(
      <DashBoard></DashBoard>
    );
}