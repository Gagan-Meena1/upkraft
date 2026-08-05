"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

interface WhatsAppGroup {
  name: string;
  link: string;
}

interface StudentData {
  _id: string;
  username?: string;
  email?: string;
  contact?: string;
  address?: string;
  studentSociety?: string;
}

interface ClassData {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  students: StudentData[];
  course?: string;
}

interface DailySummaryWhatsAppModalProps {
  classes: ClassData[];
  dayLabel: string;
  userTz: string;
  whatsappGroups: WhatsAppGroup[];
  onClose: () => void;
}

export default function DailySummaryWhatsAppModal({
  classes,
  dayLabel,
  userTz,
  whatsappGroups,
  onClose,
}: DailySummaryWhatsAppModalProps) {
  const [selectedGroupLink, setSelectedGroupLink] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isEdited, setIsEdited] = useState(false);
  const [showEditWarning, setShowEditWarning] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(
    () => new Set(classes.map((c) => c._id))
  );

  // Auto-select first group
  useEffect(() => {
    if (whatsappGroups.length > 0 && !selectedGroupLink) {
      setSelectedGroupLink(whatsappGroups[0].link);
    }
  }, [whatsappGroups, selectedGroupLink]);

  const formatTime = (startTime: string, endTime: string) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
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

  // Build consolidated daily summary message (only selected classes)
  const buildMessage = () => {
    const selectedClasses = classes.filter((c) => selectedClassIds.has(c._id));
    const sortedClasses = [...selectedClasses].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    let msg = `📋 *Daily Schedule — ${dayLabel}*\n`;
    msg += `Total Classes: ${sortedClasses.length}\n`;
    msg += `━━━━━━━━━━━━━━━━━\n\n`;

    sortedClasses.forEach((cls, idx) => {
      const time = formatTime(cls.startTime, cls.endTime);
      msg += `📚 *Class ${idx + 1}: ${cls.title || "Class"}*\n`;
      if (cls.course) msg += `   Course: ${cls.course}\n`;
      msg += `   ⏰ ${time}\n`;

      if (cls.students.length > 0) {
        msg += `   👨‍🎓 Students:\n`;
        cls.students.forEach((s) => {
          const name = s.username || s.email || "—";
          const society = s.studentSociety ? ` | 🏠 ${s.studentSociety}` : "";
          const addr = s.address ? ` | 📍 ${s.address}` : "";
          msg += `      • ${name}${society}${addr}\n`;
        });
      } else {
        msg += `   ⚠️ No students enrolled\n`;
      }

      if (idx < sortedClasses.length - 1) {
        msg += `\n──────────────────\n\n`;
      }
    });

    msg += `\n━━━━━━━━━━━━━━━━━\n`;
    msg += `\n📌 *Please ensure that you:*\n`;
    msg += `• Reach 5–10 minutes early\n`;
    msg += `• Mark attendance and update feedback within every class\n`;
    msg += `• Inform the Relationship Manager in advance in case of any issues or emergencies\n`;
    msg += `\nTeam UpKraft`;
    return msg;
  };

  useEffect(() => {
    if (!isEdited) {
      setMessage(buildMessage());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, selectedClassIds]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isEdited) {
      setIsEdited(true);
      setShowEditWarning(true);
      setTimeout(() => setShowEditWarning(false), 4000);
    }
    setMessage(e.target.value);
  };

  const handleResetTemplate = () => {
    setIsEdited(false);
    setShowEditWarning(false);
    setMessage(buildMessage());
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    if (!selectedGroupLink) {
      toast.error("Please select a WhatsApp group");
      return;
    }

    try {
      await navigator.clipboard.writeText(message);
      toast.success("Daily summary copied! Paste it in the group.", {
        duration: 4000,
        icon: "📋",
      });
      window.open(selectedGroupLink, "_blank");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = message;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      toast.success("Daily summary copied! Paste it in the group.", {
        duration: 4000,
        icon: "📋",
      });
      window.open(selectedGroupLink, "_blank");
    }
  };

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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-base">
                Daily Summary
              </h3>
              <p className="text-white/80 text-xs">
                {dayLabel} · {classes.length} class{classes.length !== 1 ? "es" : ""}
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
          {/* Classes Preview — with deselect checkboxes */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-800">
                Classes Included ({selectedClassIds.size} of {classes.length})
              </label>
              <button
                onClick={() => {
                  if (selectedClassIds.size === classes.length) {
                    setSelectedClassIds(new Set());
                  } else {
                    setSelectedClassIds(new Set(classes.map((c) => c._id)));
                  }
                }}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                {selectedClassIds.size === classes.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {[...classes]
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((cls) => {
                  const isChecked = selectedClassIds.has(cls._id);
                  return (
                    <label
                      key={cls._id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all border ${
                        isChecked
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-100 opacity-60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedClassIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(cls._id)) {
                              next.delete(cls._id);
                            } else {
                              next.add(cls._id);
                            }
                            return next;
                          });
                        }}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: "#25D366" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800">
                          {cls.title || "Class"}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {formatTime(cls.startTime, cls.endTime)} · {cls.students.length} student{cls.students.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">
                        {cls.course || ""}
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
            {whatsappGroups.length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-amber-500 text-base">⚠️</span>
                <span className="text-xs text-amber-700">
                  No WhatsApp groups found. Add group links in Tutor Settings.
                </span>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {whatsappGroups.map((group) => {
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
                        name="whatsapp-group-daily"
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
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-800">
                  Message Preview
                </label>
                {isEdited && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    Edited
                  </span>
                )}
              </div>
              <button
                onClick={handleResetTemplate}
                className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                Reset Template
              </button>
            </div>

            {showEditWarning && (
              <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-amber-50 border border-amber-200 rounded-lg animate-pulse">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-xs text-amber-700">
                  You are editing the template. Click &quot;Reset Template&quot; to restore the original.
                </span>
              </div>
            )}

            <textarea
              value={message}
              onChange={handleMessageChange}
              rows={12}
              className={`w-full px-4 py-3 text-sm text-gray-800 bg-gray-50 border rounded-xl resize-y focus:outline-none focus:ring-2 transition-all ${
                isEdited
                  ? "border-amber-300 focus:ring-amber-200 focus:border-amber-400"
                  : "border-gray-200 focus:ring-green-300 focus:border-green-400"
              }`}
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
              disabled={!selectedGroupLink || !message.trim()}
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  !selectedGroupLink || !message.trim()
                    ? "#ccc"
                    : "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                boxShadow:
                  !selectedGroupLink || !message.trim()
                    ? "none"
                    : "0 4px 12px rgba(37, 211, 102, 0.3)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
