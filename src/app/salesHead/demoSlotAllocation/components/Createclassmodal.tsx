import React from "react";
import { X, AlertCircle } from "lucide-react";
import { Course, CreateClassForm } from "./Types";

interface CreateClassModalProps {
  form: CreateClassForm;
  courses: Course[];
  isSubmitting: boolean;
  errorMessage: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const CreateClassModal = ({
  form,
  courses,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
  onFormChange,
}: CreateClassModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto border border-white/20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Create New Class</h2>
            <p className="text-sm text-gray-500 mt-1">
              Date: {form.date} | Time: {form.startTime} - {form.endTime}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="courseId" className="block text-gray-600 mb-2 text-sm font-medium">
              Select Course
            </label>
            <select
              id="courseId"
              name="courseId"
              value={form.courseId}
              onChange={onFormChange}
              required
              className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">-- Select a course --</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-gray-600 mb-2 text-sm font-medium">
              Class Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={onFormChange}
              required
              placeholder="e.g., Introduction to Algebra"
              className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-600 mb-2 text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={onFormChange}
              required
              placeholder="Provide details about the class..."
              className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-28 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 mb-2 text-sm font-medium">Start Time</label>
              <input
                type="text"
                value={form.startTime}
                disabled
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 border border-gray-300/70 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2 text-sm font-medium">End Time</label>
              <input
                type="text"
                value={form.endTime}
                disabled
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 border border-gray-300/70 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !!errorMessage}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {isSubmitting ? "Creating..." : "Create Class"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;