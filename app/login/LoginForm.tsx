import * as React from "react";
import { Form, useActionData, useNavigation } from "react-router";
import "./loginForm.css";

interface LoginState {
  password: string;
  email: string;
  error: string;
}

type LoginAction =
  | { type: "error" }
  | { type: "field"; fieldName: string; payload: string };

const loginReducer = (state: LoginState, action: LoginAction): LoginState => {
  switch (action.type) {
    case "field":
      return { ...state, [action.fieldName]: action.payload };

    case "error":
      return {
        ...state,
        email: "",
        password: "",
        error: "Incorrect username or password!"
      };

    default:
      return state;
  }
};

const initialState: LoginState = {
  password: "",
  email: "",
  error: ""
};

export default function LoginForm() {
  const [state, dispatch] = React.useReducer(loginReducer, initialState);
  const { email, password, error } = state;

  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  return (
    <div className="app-login">
      <div className="login-container">
        <Form method="post">
          {(actionData?.error || error) && (
            <p className="login-error">{actionData?.error || error}</p>
          )}

          <p>Please Login!</p>

          <input
            type="text"
            name="email"
            className="login-form-input"
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
            name="password"
            className="login-form-input"
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

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </Form>
      </div>
    </div>
  );
}
