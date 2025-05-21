import React, { useState } from "react";
import { useMerchantLoginMutation } from "../../store/api";
import type { AuthResponse } from "../../store/api";
import { useNavigate } from "react-router-dom";
import { FormField } from "../../components/common/FormField";
import { SubmitButton } from "../../components/common/SubmitButton";
import { AlertMessage } from "../../components/common/AlertMessage";
import type { ApiErrorType } from "../../types";

export const MerchantLoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useMerchantLoginMutation();
  const navigate = useNavigate();
  const [formFeedback, setFormFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);
    try {
      const response: AuthResponse = await login({
        username,
        password,
      }).unwrap();
      if (response.token) {
        localStorage.setItem("merchantToken", response.token);
        localStorage.setItem("activeUserType", "merchant");
        setFormFeedback({
          type: "success",
          message: "Login successful! Redirecting...",
        });
        setTimeout(() => {
          navigate("/merchant/dashboard");
        }, 1500);
      } else {
        setFormFeedback({
          type: "error",
          message: "Login failed: No token received from server.",
        });
      }
    } catch (err) {
      console.error("Merchant login failed:", err);
      const caughtError = err as ApiErrorType;
      let errorMessage = "Invalid credentials or server error.";
      if (caughtError.data?.message) {
        errorMessage = caughtError.data.message;
      } else if (caughtError.error) {
        errorMessage = caughtError.error;
      }
      setFormFeedback({ type: "error", message: errorMessage });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-8 bg-white shadow-xl rounded-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Merchant Login
        </h2>

        {formFeedback && (
          <AlertMessage
            type={formFeedback.type}
            message={formFeedback.message}
            title={formFeedback.type === "success" ? "Success" : "Login Error"}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Username"
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />
          <FormField
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />

          <SubmitButton
            isLoading={isLoading}
            text="Login"
            loadingText="Logging in..."
            className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 mt-8"
          />
        </form>
      </div>
    </div>
  );
};
