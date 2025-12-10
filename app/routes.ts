// routests
import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export default [
  route("/", "layouts/testlayout.tsx", [
    index("login/login.tsx"),
    route("groups", "groups/groups.tsx"),
    route("home","home/home.tsx"),
    route("attendance", "attendence/attendence.tsx"),
    route("meals", "meals/meals.tsx"),
    route("messages", "messages/messages.tsx"),
    route("events", "events/events.tsx"),
    route("adminPanel", "admin/adminPanel.tsx"),
  ]),
] satisfies RouteConfig;