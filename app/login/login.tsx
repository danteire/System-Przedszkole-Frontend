import { redirect, type ActionFunctionArgs } from "react-router";
import LoginForm from "./LoginForm";
import { api } from "../utils/serviceAPI";

export async function clientLoader() {
  if (api.isAuthenticated()) {
    throw redirect('/dashboard');
  }
  return {};
}

export async function clientAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await api.login({ email, password });
    return redirect("/home");
  } catch (error) {
    return { error: "Nieprawidłowe dane logowania" };
  }
}

export default LoginForm;