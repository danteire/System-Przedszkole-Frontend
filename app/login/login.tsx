// app/routes/login/login.tsx
import { redirect, type ActionFunctionArgs } from "react-router";
import LoginForm from "./LoginForm";
import { api } from "../utils/serviceAPI";

// clientLoader - sprawdza czy użytkownik jest już zalogowany
export async function clientLoader() {
  if (api.isAuthenticated()) {
    throw redirect('/dashboard');
  }
  return {};
}

// Action dla POST /login
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // api.login automatycznie zapisze tokeny do localStorage
    await api.login({ email, password });
    return redirect("/home");
  } catch (error) {
    return { error: "Nieprawidłowe dane logowania" };
  }
}

// Eksportuj komponent jako default
export default LoginForm;