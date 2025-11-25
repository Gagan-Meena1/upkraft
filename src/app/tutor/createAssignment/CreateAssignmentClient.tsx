"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Calendar,
  Music,
  BookOpen,
  Users,
  UserCheck,
  ArrowLeft
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CreateAssignmentClient() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("id");

  useEffect(() => {
    if (assignmentId) {
      // Fetch the assignment data from the server and populate the state variables
      // Example:
      // fetchAssignmentData(assignmentId).then(data => {
      //   setTitle(data.title);
      //   setDescription(data.description);
      //   setDueDate(data.dueDate);
      //   setFile(data.file);
      //   setCollaborators(data.collaborators);
      //   setIsPublic(data.isPublic);
      // });
    }
  }, [assignmentId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCollaboratorsChange = (e) => {
    const value = e.target.value;
    setCollaborators(
      typeof value === "string" ? value.split(",") : Array.isArray(value) ? value : []
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, either create a new assignment or update an existing one
    // Example:
    // const action = assignmentId ? updateAssignment : createAssignment;
    // action({ title, description, dueDate, file, collaborators, isPublic, assignmentId })
    //   .then(() => {
    //     router.push("/assignments");
    //   })
    //   .catch((error) => {
    //     console.error("Error saving assignment:", error);
    //   });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">
          {assignmentId ? "Edit Assignment" : "Create Assignment"}
        </h1>
        <button
          onClick={() => router.push("/assignments")}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Collaborators
          </label>
          <input
            type="text"
            value={collaborators.join(", ")}
            onChange={handleCollaboratorsChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter email addresses, separated by commas"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring focus:ring-blue-500"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Make assignment public
          </label>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.push("/assignments")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
          >
            {assignmentId ? "Update Assignment" : "Create Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}