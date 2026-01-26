import * as React from "react";
import { Form, useActionData, useNavigation, Link } from "react-router";
import { FaGraduationCap } from "react-icons/fa"; // Dodano import ikony
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

        {/* Header - Zaktualizowane Logo */}
        <div className="login-header">
          <div className="login-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            {/* Ikona w białym kółku */}
            <div style={{ 
                background: "white", 
                color: "#C2410C", /* Primary dark orange */
                padding: "10px", 
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}>
                <FaGraduationCap size={28} />
            </div>
            {/* Napis Preschool + */}
            <span style={{ 
                color: "white", 
                textShadow: "2px 2px 0 #9a3412", 
                fontWeight: "800", 
                fontSize: "2rem",
                letterSpacing: "-0.5px"
            }}>
                Preschool +
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="login-body">
          <Form method="post">
            {(actionData?.error || error) && (
              <p className="login-error">{actionData?.error || error}</p>
            )}

            <div className="form-group">
              <label className="form-label">E-mail *</label>
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