import { useEffect } from "react";
import { replace, Route, useNavigate } from "react-router";
import DashBoard from "~/commons/dashboard";
import EventsPage from "~/events/events";

export function loader() {
  return null;
}


export default function HomePage() {
    return(
      <>
      <DashBoard></DashBoard>
      <EventsPage></EventsPage>
      </>);
}
