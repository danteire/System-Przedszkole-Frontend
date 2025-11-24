import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export default [
  route("/", "layouts/testlayout.tsx", [
    index("home/home.tsx"),
    route("login", "login/loginLayout.tsx", [index("login/login.tsx")]),
    route("groups", "groups/groups.tsx"),
    route("attendence", "attendence/attendence.tsx"),
    route("meals", "meals/meals.tsx"),
    route("messages", "messages/messages.tsx"),
    route("events", "events/events.tsx"),
  ]),
] satisfies RouteConfig;