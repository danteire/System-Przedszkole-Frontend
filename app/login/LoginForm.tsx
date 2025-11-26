import * as React from "react";
import { Form, useActionData, useNavigation } from "react-router";
import "../app.css";

interface LoginState {
  password: string;
  email: string;
  error: string;
  isLoggedin: boolean;
}

type LoginAction =
  | { type: "error" }
  | { type: "field"; fieldName: string; payload: string };

const loginReducer = (state: LoginState, action: LoginAction): LoginState => {
  switch (action.type) {
    case "field": {
      return {
        ...state,
        [action.fieldName]: action.payload
      };
    }
    case "error": {
      return {
        ...state,
        email: "",
        password: "",
        error: "Incorrect username or password!"
      };
    }
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
    <div className="App">
      <div className="login-container">
        <Form method="post" className="form">
          {(actionData?.error || error) && (
            <p className="error">{actionData?.error || error}</p>
          )}
          <p>Please Login!</p>
          <input
            type="text"
            name="email"
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
            {isLoading ? "Logging in....." : "Login"}
          </button>
        </Form>
      </div>
    </div>
  );
}