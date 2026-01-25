// app/login/LoginForm.tsx
import * as React from "react";
import { Form, useActionData, useNavigation, Link } from "react-router";
import "./loginForm.css";

interface LoginState {
  password: string;
  email: string; // Used as "Code1" in screenshot? Placeholder says "Enter your code1 or e-mail"
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

        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            <span style={{ color: "black", background: "white", padding: "0 5px", marginRight: "2px", borderRadius: "4px" }}>K</span>
            <span style={{ color: "white", textShadow: "2px 2px 0 #C2410C" }}>inder</span>
          </div>
        </div>

        {/* Body */}
        <div className="login-body">
          <Form method="post">
            {(actionData?.error || error) && (
              <p className="login-error">{actionData?.error || error}</p>
            )}

            <div className="form-group">
              <label className="form-label">Code1 *</label>
              <input
                type="text"
                name="email"
                className="login-form-input"
                placeholder="Enter your code1 or e-mail"
                value={email}
                onChange={(e) =>
                  dispatch({
                    type: "field",
                    fieldName: "email",
                    payload: e.currentTarget.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="login-form-input"
                placeholder="Enter a password"
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
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
            </div>

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
    </div>
  );
}
