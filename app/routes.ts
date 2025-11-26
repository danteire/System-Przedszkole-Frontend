// routests
import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export default [
  route("/", "layouts/testlayout.tsx", [
    index("home/home.tsx"),
    route("dashboard", "dashboard/dashboard.tsx"),
    route("login", "login/login.tsx"),
    route("groups", "groups/groups.tsx"),
    route("attendance", "attendence/attendence.tsx"),
    route("meals", "meals/meals.tsx"),
    route("messages", "messages/messages.tsx"),
    route("events", "events/events.tsx"),
  ]),
] satisfies RouteConfig;