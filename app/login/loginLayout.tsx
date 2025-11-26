import * as React from "react";
import "../app.css";
import { login } from "./login";
import { useNavigate } from "react-router";

interface LoginState {
  password: string;
  email: string;
  isLoading: boolean;
  error: string;
  isLoggedIn: boolean;
}

type LoginAction =
  | { type: "login" | "success" | "error" | "logout" }
  | { type: "field"; fieldName: string; payload: string };

const loginReducer = (state: LoginState, action: LoginAction): LoginState => {
  switch (action.type) {
    case "field": {
      return {
        ...state,
        [action.fieldName]: action.payload
      };
    }
    case "login": {
      return {
        ...state,
        error: "",
        isLoading: true
      };
    }
    case "success": {
      return { ...state, error: "", isLoading: false, isLoggedIn: true };
    }
    case "error": {
      return {
        ...state,
        isLoading: false,
        isLoggedIn: false,
        email: "",
        password: "",
        error: "Incorrect username or password!"
      };
    }
    case "logout": {
      return {
        ...state,
        isLoggedIn: false
      };
    }
    default:
      return state;
  }
};

const initialState: LoginState = {
  password: "",
  email: "",
  isLoading: false,
  error: "",
  isLoggedIn: false
};

export default function Login() {
  const [state, dispatch] = React.useReducer(loginReducer, initialState);
  const { email, password, isLoading, error, isLoggedIn } = state;

  const navigate = useNavigate(); // <--- hook w komponencie

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({ type: "login" });

    try {
      const data = await login({ email, password }); // wysyłamy dane do serwera
      localStorage.setItem("token", data.token);        // zapis tokenu
      dispatch({ type: "success" });
      navigate("/dashboard", { replace: true });        // przekierowanie
    } catch (err) {
      dispatch({ type: "error" });
    }
  };

  return (
    <div className="App">
      <div className="login-container">
        {isLoggedIn ? (
          <>
            <p>{`Hello ${email}`}</p>
            <button type="button" onClick={() => dispatch({ type: "logout" })}>
              Log out
            </button>
          </>
        ) : (
          <form className="form" onSubmit={onSubmit}>
            {error && <p className="error">{error}</p>}
            <p> PLease Login!</p>
            <input
              type="text"
              placeholder="email"
              value={email}
              onChange={(e) =>
                dispatch({
                  type: "field",
                  fieldName: "email",
                  payload: e.currentTarget.value
                })
              }
            />
            <input
              type="password"
              placeholder="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) =>
                dispatch({
                  type: "field",
                  fieldName: "password",
                  payload: e.currentTarget.value
                })
              }
            />
            <button type="submit" className="submit" disabled={isLoading}>
              {isLoading ? "Loggin in....." : "Login In"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
