import React from "react";

interface SubmitButtonProps {
  isLoading: boolean;
  text: string;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading,
  text,
  loadingText = "Processing...",
  className = "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
  disabled = false,
}) => {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? loadingText : text}
    </button>
  );
};
