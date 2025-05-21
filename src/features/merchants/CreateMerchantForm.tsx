import React, { useState, useEffect } from "react";
import { useCreateMerchantMutation } from "../../store/api";
import type { CreateMerchantRequest } from "../../store/api";
import { FormField } from "../../components/common/FormField";
import { SubmitButton } from "../../components/common/SubmitButton";
import { AlertMessage } from "../../components/common/AlertMessage";
import type { SerializedError } from "@reduxjs/toolkit";
import type { AppFetchBaseQueryError } from "../../utils/errorUtils";

interface CreateMerchantFormProps {
  onSuccess?: () => void;
}

function isDataWithMessage(data: unknown): data is { message: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    Object.prototype.hasOwnProperty.call(data, "message") &&
    typeof (data as { message: unknown }).message === "string"
  );
}

export const CreateMerchantForm: React.FC<CreateMerchantFormProps> = ({
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [
    createMerchant,
    { isLoading, error: apiCallError, isSuccess, data: newMerchant },
  ] = useCreateMerchantMutation();
  const [formFeedback, setFormFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isSuccess && newMerchant) {
      setFormFeedback({
        type: "success",
        message: `Merchant "${newMerchant.name}" created successfully!`,
      });
      setName("");
      setCnpj("");
      if (onSuccess) onSuccess();
    }
  }, [isSuccess, newMerchant, onSuccess]);

  useEffect(() => {
    if (apiCallError) {
      const error = apiCallError as AppFetchBaseQueryError | SerializedError;
      let message = "An unexpected error occurred.";
      if (typeof error === "object" && error !== null) {
        if ("data" in error && isDataWithMessage(error.data)) {
          message = error.data.message;
        } else if ("message" in error && typeof error.message === "string") {
          message = error.message;
        } else if ("error" in error && typeof error.error === "string") {
          message = error.error;
        }
      }
      setFormFeedback({ type: "error", message: message });
    }
  }, [apiCallError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    if (cnpj.length !== 14 || !/^\d{14}$/.test(cnpj)) {
      setFormFeedback({
        type: "error",
        message: "CNPJ must be exactly 14 digits.",
      });
      return;
    }
    if (name.length < 2 || name.length > 100) {
      setFormFeedback({
        type: "error",
        message: "Name must be between 2 and 100 characters.",
      });
      return;
    }

    const merchantData: CreateMerchantRequest = { name, cnpj };
    await createMerchant(merchantData);
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Merchant Name"
          type="text"
          id="merchantName"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          required
          placeholder="E.g., Acme Corp"
        />
        <FormField
          label="CNPJ (14 digits, no punctuation)"
          type="text"
          id="merchantCnpj"
          value={cnpj}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCnpj(e.target.value)
          }
          required
          placeholder="12345678000199"
          maxLength={14}
          autoComplete="off"
        />
        <SubmitButton
          isLoading={isLoading}
          text="Create Merchant"
          loadingText="Creating..."
          className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
        />
      </form>
    </div>
  );
};
