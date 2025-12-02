import { useEffect } from "react";
import { replace, Route, useNavigate } from "react-router";
import DashBoard from "~/dashboard/dashboard";

export function loader() {
  return null;
}


export default function GroupsPage() {
    return(
      <DashBoard></DashBoard>
    );
}
