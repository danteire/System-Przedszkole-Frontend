import { redirect, type ActionFunctionArgs } from "react-router";
import { Form } from "react-router";

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

// Loader dla GET /login
export async function loader() {
  // Możesz sprawdzić czy użytkownik jest już zalogowany
  // const token = localStorage.getItem('token');
  // if (token) {
  //   return redirect('/dashboard');
  // }
  return {};
}

// Action dla POST /login (gdy formularz zostanie wysłany)
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const { token } = await login({ email, password });
    localStorage.setItem("token", token);
    return redirect("/dashboard"); // Przekieruj po zalogowaniu
  } catch (error) {
    return { error: "Nieprawidłowe dane logowania" };
  }
}

// Komponent strony logowania (WYMAGANY!)
export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold">Logowanie</h1>
        
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Hasło
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            Zaloguj się
          </button>
        </Form>
      </div>
    </div>
  );
}