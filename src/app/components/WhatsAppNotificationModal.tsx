"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

interface WhatsAppGroup {
  name: string;
  link: string;
}

interface StudentData {
  _id: string;
  username?: string;
  email?: string;
  whatsappGroups?: WhatsAppGroup[];
}

interface ClassData {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  students: StudentData[];
  course?: string;
}

interface WhatsAppNotificationModalProps {
  classData: ClassData;
  userTz: string;
  onClose: () => void;
}

export default function WhatsAppNotificationModal({
  classData,
  userTz,
  onClose,
}: WhatsAppNotificationModalProps) {
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set(classData.students.map((s) => s._id))
  );
  const [selectedGroupLink, setSelectedGroupLink] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Collect all unique WhatsApp groups from all students
  const allGroups = useMemo(() => {
    const groupMap = new Map<string, WhatsAppGroup>();
    classData.students.forEach((student) => {
      student.whatsappGroups?.forEach((group) => {
        if (group.link && !groupMap.has(group.link)) {
          groupMap.set(group.link, {
            name: group.name || group.link,
            link: group.link,
          });
        }
      });
    });
    return Array.from(groupMap.values());
  }, [classData.students]);

  // Auto-select first group
  useEffect(() => {
    if (allGroups.length > 0 && !selectedGroupLink) {
      setSelectedGroupLink(allGroups[0].link);
    }
  }, [allGroups, selectedGroupLink]);

  // Format date/time from class data
  const formatClassDate = () => {
    try {
      const d = new Date(classData.startTime);
      const formatter = new Intl.DateTimeFormat("en-IN", {
        timeZone: userTz,
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      });
      return formatter.format(d);
    } catch {
      return "—";
    }
  };

  const formatClassTime = () => {
    try {
      const start = new Date(classData.startTime);
      const end = new Date(classData.endTime);
      const fmt = (d: Date) =>
        new Intl.DateTimeFormat("en-US", {
          timeZone: userTz,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(d);
      return `${fmt(start)} - ${fmt(end)}`;
    } catch {
      return "—";
    }
  };

  // Build message template based on selected students
  const buildMessage = () => {
    const selectedStudents = classData.students.filter((s) =>
      selectedStudentIds.has(s._id)
    );
    const studentMentions = selectedStudents
      .map((s) => `@~${s.username || s.email || "Student"}`)
      .join(", ");

    return `Hi ${studentMentions},
This is a reminder for the UpKraft class.
🗓️ Date: ${formatClassDate()}
⏰ Time: ${formatClassTime()}

Please ensure you will be ready 5–10 minutes before the class. Looking forward to a productive session.
Kindly ensure that the gate pass is issued at least 15 minutes before the scheduled class time. This will help the tutor enter the society smoothly and reach your home on time.
Looking forward to a productive session.
Thank you
Team UpKraft`;
  };

  // Rebuild message when students change
  useEffect(() => {
    setMessage(buildMessage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentIds, classData]);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllStudents = () => {
    if (selectedStudentIds.size === classData.students.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(
        new Set(classData.students.map((s) => s._id))
      );
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    if (selectedStudentIds.size === 0) {
      toast.error("Please select at least one student");
      return;
    }
    if (!selectedGroupLink) {
      toast.error("Please select a WhatsApp group");
      return;
    }

    try {
      // Copy message to clipboard
      await navigator.clipboard.writeText(message);
      toast.success("Message copied to clipboard! Paste it in the group.", {
        duration: 4000,
        icon: "📋",
      });

      // Open the WhatsApp group link in new tab
      window.open(selectedGroupLink, "_blank");
    } catch {
      // Fallback: use textarea trick for clipboard
      const textarea = document.createElement("textarea");
      textarea.value = message;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      toast.success("Message copied! Paste it in the group.", {
        duration: 4000,
        icon: "📋",
      });
      window.open(selectedGroupLink, "_blank");
    }
  };

  const allSelected = selectedStudentIds.size === classData.students.length;
  const noneSelected = selectedStudentIds.size === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-base">
                WhatsApp Notification
              </h3>
              <p className="text-white/80 text-xs">
                {classData.title || "Class"} · {classData.course || ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 72px)" }}
        >
          {/* Students Selection */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-800">
                Select Students
              </label>
              <button
                onClick={toggleAllStudents}
                className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {classData.students.map((student) => {
                const isSelected = selectedStudentIds.has(student._id);
                return (
                  <label
                    key={student._id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50 border border-gray-100 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStudent(student._id)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      style={{ accentColor: "#25D366" }}
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {student.username || student.email || "—"}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Group Selection */}
          <div className="px-6 py-4 border-b border-gray-100">
            <label className="text-sm font-semibold text-gray-800 block mb-3">
              Select WhatsApp Group
            </label>
            {allGroups.length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-amber-500 text-base">⚠️</span>
                <span className="text-xs text-amber-700">
                  No WhatsApp groups found. Students need to add their group
                  links in Settings.
                </span>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {allGroups.map((group) => {
                  const isSelected = selectedGroupLink === group.link;
                  return (
                    <label
                      key={group.link}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "bg-green-50 border border-green-300 shadow-sm"
                          : "bg-gray-50 border border-gray-100 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="whatsapp-group"
                        checked={isSelected}
                        onChange={() => setSelectedGroupLink(group.link)}
                        className="w-4 h-4 text-green-600"
                        style={{ accentColor: "#25D366" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {group.name}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {group.link}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Message Template */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-800">
                Message Preview
              </label>
              <button
                onClick={() => setMessage(buildMessage())}
                className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                Reset Template
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all"
              style={{ fontFamily: "inherit", lineHeight: "1.6" }}
            />
          </div>

          {/* Actions */}
          <div className="px-6 py-4 flex items-center justify-between gap-3 bg-gray-50/50">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={noneSelected || !selectedGroupLink || !message.trim()}
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  noneSelected || !selectedGroupLink || !message.trim()
                    ? "#ccc"
                    : "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                boxShadow:
                  noneSelected || !selectedGroupLink || !message.trim()
                    ? "none"
                    : "0 4px 12px rgba(37, 211, 102, 0.3)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              Copy & Open Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
