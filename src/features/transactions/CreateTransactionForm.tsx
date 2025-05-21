import React, { useState, useEffect } from "react";
import { useCreateTransactionMutation } from "../../store/api";
import type { CreateTransactionRequest } from "../../store/api";
import { FormField } from "../../components/common/FormField";
import { SubmitButton } from "../../components/common/SubmitButton";
import { AlertMessage } from "../../components/common/AlertMessage";
import CurrencyInput from "react-currency-input-field";
import type { SerializedError } from "@reduxjs/toolkit";
import type { AppFetchBaseQueryError } from "../../utils/errorUtils";

interface CreateTransactionFormProps {
  accountId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateTransactionForm: React.FC<CreateTransactionFormProps> = ({
  accountId,
  onSuccess,
  onCancel,
}) => {
  const [type, setType] = useState<"PAYIN" | "PAYOUT">("PAYIN");
  const [amount, setAmount] = useState<string | undefined>("");
  const [description, setDescription] = useState("");
  const [formFeedback, setFormFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [
    createTransaction,
    { isLoading, error: apiError, isSuccess, data: newTransaction },
  ] = useCreateTransactionMutation();

  useEffect(() => {
    if (isSuccess && newTransaction) {
      setFormFeedback({
        type: "success",
        message: `Transaction ${newTransaction.transactionId} created successfully!`,
      });
      setAmount("");
      setDescription("");
      setType("PAYIN");
      if (onSuccess) onSuccess();
    } else if (apiError) {
      const err = apiError as AppFetchBaseQueryError | SerializedError;
      let message = "An unexpected error occurred.";
      if (
        "data" in err &&
        typeof err.data === "object" &&
        err.data !== null &&
        "message" in err.data &&
        typeof err.data.message === "string"
      ) {
        message = err.data.message;
      } else if ("error" in err && typeof err.error === "string") {
        message = err.error;
      } else if ("message" in err && typeof err.message === "string") {
        message = err.message;
      }
      setFormFeedback({ type: "error", message: message });
    }
  }, [isSuccess, newTransaction, apiError, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const numericAmount = parseFloat(amount || "0");
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormFeedback({
        type: "error",
        message: "Amount must be a positive number.",
      });
      return;
    }

    const transactionData: CreateTransactionRequest = {
      accountId,
      type,
      amount: numericAmount,
      description: description || undefined,
    };

    await createTransaction(transactionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formFeedback && (
        <AlertMessage
          type={formFeedback.type}
          message={formFeedback.message}
          title={formFeedback.type === "success" ? "Success" : "Error"}
        />
      )}

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Transaction Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as "PAYIN" | "PAYOUT")}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="PAYIN">PAYIN</option>
          <option value="PAYOUT">PAYOUT</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Amount
        </label>
        <CurrencyInput
          id="amount"
          name="amount"
          placeholder="$0.00"
          value={amount}
          decimalsLimit={2}
          onValueChange={(value: string | undefined) => {
            setAmount(value);
          }}
          prefix="$"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
          allowNegativeValue={false}
        />
      </div>

      <FormField
        label="Description (Optional)"
        type="text"
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="E.g., Payment for services"
        maxLength={100}
      />
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <SubmitButton
          isLoading={isLoading}
          text="Create Transaction"
          loadingText="Creating..."
        />
      </div>
    </form>
  );
};
