import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Clock, X } from "lucide-react";
import { formatInTz, getUserTimeZone } from "@/helper/time";

interface EditClassModalProps {
  show: boolean;
  onHide: () => void;
  classId?: string | null;
  initialData?: any; // the class object passed from calendar/course pages
  userTimezone?: string;
  onSuccess?: (updated?: any) => void;
  customFields?: React.ReactNode;
}

const extractDateTimeForForm = (dateTimeString: string, tz: string) => {
  const date = new Date(dateTimeString);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const day = parts.find((p) => p.type === "day")?.value || "";
  const hours = parts.find((p) => p.type === "hour")?.value || "";
  const minutes = parts.find((p) => p.type === "minute")?.value || "";
  return {
    dateStr: `${year}-${month}-${day}`,
    timeStr: `${hours}:${minutes}`,
  };
};

const EditClassModal: React.FC<EditClassModalProps> = ({
  show,
  onHide,
  classId,
  initialData,
  userTimezone,
  onSuccess,
  customFields,
}) => {
  const tz = userTimezone || getUserTimeZone();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reasonForReschedule, setReasonForReschedule] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [original, setOriginal] = useState({ date: "", startTime: "", endTime: "" });
  // only track DATE changes (require reschedule reason only when date changes)
  const [hasDateChanged, setHasDateChanged] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    setTitle(initialData.title || "");
    setDescription(initialData.description || "");
    const s = extractDateTimeForForm(initialData.startTime, tz);
    const e = extractDateTimeForForm(initialData.endTime, tz);
    setDate(s.dateStr);
    setStartTime(s.timeStr);
    setEndTime(e.timeStr);
    setReasonForReschedule(initialData.reasonForReschedule || "");
    setOriginal({ date: s.dateStr, startTime: s.timeStr, endTime: e.timeStr });
    setHasDateChanged(false);
    setError("");
  }, [initialData, tz, show]);

  useEffect(() => {
    const dateChanged = date !== original.date;
    setHasDateChanged(dateChanged);
    if (!dateChanged) setError("");
  }, [date, original]);

  const validate = () => {
    if (!date || !startTime || !endTime) return "Please provide date and time";
    const [y, m, d] = date.split("-").map(Number);
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const sdt = new Date(y, m - 1, d, sh, sm);
    const edt = new Date(y, m - 1, d, eh, em);
    if (edt <= sdt) return "End time must be after start time";
    // require reason only when DATE was changed
    if (hasDateChanged && !reasonForReschedule.trim()) return "Please provide a reason for rescheduling";
    return "";
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    if (!classId) {
      setError("Missing class id");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        title,
        description,
        date,
        startTime,
        endTime,
        reasonForReschedule: hasDateChanged ? reasonForReschedule : "",
        timezone: tz,
      };

      const res = await fetch(`/Api/classes?classId=${classId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update class");
      }

      if (onSuccess) onSuccess();
      onHide();
    } catch (err: any) {
      setError(err?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="max-w-md">
      <Modal.Header closeButton>
        <Modal.Title>Edit Class</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          {/* Show reschedule reason only when date/time changed */}
          {hasDateChanged && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reason for Reschedule <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reasonForReschedule}
                onChange={(e) => setReasonForReschedule(e.target.value)}
                rows={3}
                placeholder="Please provide a reason for rescheduling this class..."
                required
                className="w-full px-3 py-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">Students will be notified about this reschedule</p>
            </div>
          )}

          {/* allow parent to inject custom fields (keeps backward compatibility) */}
          {customFields}

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          <div className="flex gap-2 mt-2">
            <Button variant="outline-secondary" onClick={onHide} className="flex-1">Cancel</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (<><Clock className="animate-spin mr-2" /> Updating...</>) : "Update Class"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditClassModal;