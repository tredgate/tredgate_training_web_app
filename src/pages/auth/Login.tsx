import { useState, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useForm, type FormErrors } from "../../hooks/useForm";
import { TEST_IDS } from "../../shared/testIds";

interface LoginFormValues {
  username: string;
  password: string;
  [key: string]: unknown;
}

const INITIAL_VALUES: LoginFormValues = {
  username: "",
  password: "",
};

function validateLogin(values: LoginFormValues): FormErrors<LoginFormValues> {
  const errors: FormErrors<LoginFormValues> = {};
  if (!values.username.trim()) {
    errors.username = "Username is required";
  }
  if (!values.password.trim()) {
    errors.password = "Password is required";
  }
  return errors;
}

const REMEMBER_KEY = "tqh_remember_username";

const USER_HINTS = [
  {
    role: "tester",
    username: "tester",
    password: "test123",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    role: "qa_lead",
    username: "lead",
    password: "lead123",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    role: "admin",
    username: "admin",
    password: "admin123",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
  },
] as const;

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [remember, setRemember] = useState(() => {
    return localStorage.getItem(REMEMBER_KEY) !== null;
  });

  const initialValues: LoginFormValues = {
    username: localStorage.getItem(REMEMBER_KEY) ?? "",
    password: "",
  };

  const { values, errors, touched, setField, setFieldTouched, handleSubmit } =
    useForm<LoginFormValues>(initialValues, validateLogin);

  const onSubmit = useCallback(
    (formValues: LoginFormValues) => {
      const success = login(formValues.username, formValues.password);
      if (success) {
        if (remember) {
          localStorage.setItem(REMEMBER_KEY, formValues.username);
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
        setLoginError("");
        navigate("/dashboard");
      } else {
        setLoginError("Invalid username or password");
      }
    },
    [login, navigate, remember],
  );

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      data-testid={TEST_IDS.login.page}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="glass p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Shield className="text-neon-purple mb-3" size={48} />
          <h1 className="text-2xl font-bold text-white">TredGate QA Hub</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              data-testid={TEST_IDS.login.inputUsername}
              className="input-dark"
              placeholder="Enter username"
              value={values.username}
              onChange={(e) => setField("username", e.target.value)}
              onBlur={() => setFieldTouched("username")}
            />
            {touched.username && errors.username && (
              <p className="text-red-400 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              data-testid={TEST_IDS.login.inputPassword}
              className="input-dark"
              placeholder="Enter password"
              value={values.password}
              onChange={(e) => setField("password", e.target.value)}
              onBlur={() => setFieldTouched("password")}
            />
            {touched.password && errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              data-testid={TEST_IDS.login.checkboxRemember}
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-neon-purple focus:ring-neon-purple/30"
            />
            <label htmlFor="remember" className="text-sm text-gray-400">
              Remember me
            </label>
          </div>

          {loginError && (
            <p
              data-testid={TEST_IDS.login.error}
              className="text-red-400 text-sm text-center"
            >
              {loginError}
            </p>
          )}

          <button
            type="submit"
            data-testid={TEST_IDS.login.btnSubmit}
            className="btn-neon-purple w-full"
          >
            Sign In
          </button>
        </form>

        <div data-testid={TEST_IDS.login.userHints} className="mt-8 space-y-2">
          <p className="text-xs text-gray-500 text-center mb-3">
            Demo credentials
          </p>
          {USER_HINTS.map((hint) => (
            <div
              key={hint.role}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${hint.color}`}
            >
              <span className="font-medium capitalize">
                {hint.role.replace("_", " ")}
              </span>
              <span>
                {hint.username} / {hint.password}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
