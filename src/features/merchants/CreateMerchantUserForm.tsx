import React, { useState, useEffect } from "react";
import { useCreateMerchantUserMutation } from "../../store/api";
import type { CreateMerchantUserRequest } from "../../store/api";
import { FormField } from "../../components/common/FormField";
import { SubmitButton } from "../../components/common/SubmitButton";
import { AlertMessage } from "../../components/common/AlertMessage";
import type { SerializedError } from "@reduxjs/toolkit";
import type { AppFetchBaseQueryError } from "../../utils/errorUtils";

function isDataWithMessage(data: unknown): data is { message: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    Object.prototype.hasOwnProperty.call(data, "message") &&
    typeof (data as { message: unknown }).message === "string"
  );
}

interface CreateMerchantUserFormProps {
  merchantId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  allowedRoles?: ("ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER")[];
}

const ALL_USER_ROLES: ("ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER")[] = [
  "MERCHANT_USER",
  "MERCHANT_ADMIN",
  "ADMIN",
];

export const CreateMerchantUserForm: React.FC<CreateMerchantUserFormProps> = ({
  merchantId,
  onSuccess,
  onCancel,
  allowedRoles = ALL_USER_ROLES,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<
    "ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER"
  >(
    allowedRoles.includes("MERCHANT_USER")
      ? "MERCHANT_USER"
      : allowedRoles[0] || "MERCHANT_USER"
  );

  const [
    createMerchantUser,
    { isLoading, error: apiCallError, isSuccess, data: newUser },
  ] = useCreateMerchantUserMutation();

  const [formFeedback, setFormFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isSuccess && newUser) {
      setFormFeedback({
        type: "success",
        message: `User "${newUser.username}" created successfully for merchant!`,
      });
      setUsername("");
      setPassword("");
      setEmail("");
      setFullName("");
      setRole(
        allowedRoles.includes("MERCHANT_USER")
          ? "MERCHANT_USER"
          : allowedRoles[0] || "MERCHANT_USER"
      );
      if (onSuccess) onSuccess();
    }
  }, [isSuccess, newUser, onSuccess, allowedRoles]);

  useEffect(() => {
    if (apiCallError) {
      const error = apiCallError as AppFetchBaseQueryError | SerializedError;
      let message = "An unexpected error occurred.";
      if (typeof error === "object" && error !== null) {
        if ("data" in error && isDataWithMessage(error.data))
          message = error.data.message;
        else if ("message" in error && typeof error.message === "string")
          message = error.message;
      }
      setFormFeedback({ type: "error", message });
    }
  }, [apiCallError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);
    if (username.length < 3 || username.length > 50) {
      setFormFeedback({
        type: "error",
        message: "Username must be 3-50 characters.",
      });
      return;
    }
    if (password.length < 8 || password.length > 100) {
      setFormFeedback({
        type: "error",
        message: "Password must be 8-100 characters.",
      });
      return;
    }
    if (!email.includes("@")) {
      setFormFeedback({ type: "error", message: "Invalid email format." });
      return;
    }
    if (fullName.trim() === "") {
      setFormFeedback({ type: "error", message: "Full name is required." });
      return;
    }

    const userData: CreateMerchantUserRequest = {
      username,
      password,
      email,
      fullName,
      role,
      merchantId,
    };
    await createMerchantUser(userData);
  };

  return (
    <div className="">
      {formFeedback && (
        <AlertMessage
          type={formFeedback.type}
          message={formFeedback.message}
          title={formFeedback.type === "success" ? "Success" : "Creation Error"}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <FormField
          label="Username"
          type="text"
          id="mu_username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="off"
        />
        <FormField
          label="Password"
          type="password"
          id="mu_password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <FormField
          label="Email"
          type="email"
          id="mu_email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label="Full Name"
          type="text"
          id="mu_fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <div>
          <label
            htmlFor="mu_role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role
          </label>
          <select
            id="mu_role"
            name="role"
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value as "ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER"
              )
            }
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {allowedRoles.map((r) => (
              <option key={r} value={r}>
                {r.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          )}
          <SubmitButton
            isLoading={isLoading}
            text="Create User"
            loadingText="Creating..."
            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
          />
        </div>
      </form>
    </div>
  );
};
