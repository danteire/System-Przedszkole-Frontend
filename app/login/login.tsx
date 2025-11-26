import { redirect, type ActionFunctionArgs } from "react-router";
import LoginForm from "./LoginForm";

// Funkcja logowania
export const login = async (creds: {
  email: string;
  password: string;
}): Promise<{ token: string }> => {
  const response = await fetch("http://3.71.11.3:8080/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(creds),
  });

  if (!response.ok) {
    throw new Error("Nieprawidłowe dane logowania");
  }

  const data = await response.json();
  return data;
};

// clientLoader - wykonuje się TYLKO w przeglądarce
export async function clientLoader() {
  const token = localStorage.getItem('token');
  if (token) {
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
    const { token } = await login({ email, password });
    localStorage.setItem("token", token);
    return redirect("/dashboard");
  } catch (error) {
    return { error: "Nieprawidłowe dane logowania" };
  }
}

// Eksportuj komponent jako default
export default LoginForm;