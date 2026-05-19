import React from "react";
import { X, AlertCircle } from "lucide-react";

interface CancelClassModalProps {
  cancellationReason: string;
  onReasonChange: (reason: string) => void;
  isCancelling: boolean;
  errorMessage: string;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelClassModal = ({
  cancellationReason,
  onReasonChange,
  isCancelling,
  errorMessage,
  onClose,
  onConfirm,
}: CancelClassModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-red-50/80 via-orange-50/80 to-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-lg border border-white/20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Cancel Class</h2>
            <p className="text-sm text-gray-500 mt-1">
              Please provide a reason for cancelling this class
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-2 text-sm font-medium">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="e.g., Instructor illness, scheduling conflict, etc."
              required
              className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 h-32 transition-all"
            />
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isCancelling}
              className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Keep Class
            </button>
            <button
              onClick={onConfirm}
              disabled={!cancellationReason.trim() || isCancelling}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCancelling ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                "Cancel Class"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelClassModal;