import { useEffect } from "react";
import { replace, Route, useNavigate } from "react-router";

export const login = async (creds: {
  username: string;
  password: string;
}): Promise<{ token: string }> => {
  const response = await fetch("https://twój-serwer.com/api/login", {
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
  return data; // np. { token: "abc123" }
};

