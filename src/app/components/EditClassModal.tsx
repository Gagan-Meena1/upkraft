import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-hot-toast";

type Props = {
  show: boolean;
  onHide: () => void;
  classId: string | null;
  initialData?: any; // optional: preloaded class object from calendar click
  userTimezone?: string; // NEW: timezone from parent
  onSuccess?: () => void;
};

export default function EditClassModal({
  show,
  onHide,
  classId,
  initialData,
  userTimezone,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  // timezone-aware extraction (matches tutor course page behavior)
  const extractDateTimeForForm = (iso?: string, tz?: string) => {
    if (!iso) return { dateStr: "", timeStr: "" };
    const d = new Date(iso);
    const timeZone = tz || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const year = parts.find((p) => p.type === "year")?.value || "";
    const month = parts.find((p) => p.type === "month")?.value || "";
    const day = parts.find((p) => p.type === "day")?.value || "";
    const hour = parts.find((p) => p.type === "hour")?.value?.padStart(2, "0") || "00";
    const minute = parts.find((p) => p.type === "minute")?.value?.padStart(2, "0") || "00";
    return { dateStr: `${year}-${month}-${day}`, timeStr: `${hour}:${minute}` };
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!show) return;
      setError("");
      setLoading(true);

      const tz = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      // If initialData provided (calendar click), prefer it to avoid extra fetch
      if (initialData) {
        const start = extractDateTimeForForm(initialData.startTime, tz);
        const end = extractDateTimeForForm(initialData.endTime, tz);
        if (!mounted) return;
        setForm({
          title: initialData.title || "",
          description: initialData.description || "",
          date: start.dateStr || "",
          startTime: start.timeStr || "",
          endTime: end.timeStr || "",
        });
        setLoading(false);
        return;
      }

      if (!classId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/Api/classes?classId=${classId}`);
        const data = await res.json();
        const cls =
          Array.isArray(data) ? data[0] : data.classData?.[0] || data.class || data;
        if (!cls) throw new Error("Class data not found");
        const start = extractDateTimeForForm(cls.startTime, tz);
        const end = extractDateTimeForForm(cls.endTime, tz);
        if (!mounted) return;
        setForm({
          title: cls.title || "",
          description: cls.description || "",
          date: start.dateStr || "",
          startTime: start.timeStr || "",
          endTime: end.timeStr || "",
        });
      } catch (err: any) {
        console.error("Failed to load class:", err);
        setError(err?.message || "Failed to load class");
        toast.error("Failed to load class details");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [show, classId, initialData, userTimezone]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.date || !form.startTime || !form.endTime)
      return "Date and times are required";
    if (form.endTime <= form.startTime) return "End time must be after start time";
    return "";
  };

  const isSaveDisabled = isSaving || !!validate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const id = classId || initialData?._id;
    if (!id) {
      setError("Class id not available");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const timezoneToSend =
        userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await fetch(`/Api/classes?classId=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          timezone: timezoneToSend, // ensure server receives timezone
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Update failed");

      toast.success("Class updated");
      onHide();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Update error:", err);
      const msg = err?.message || "Failed to update class";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="max-w-md">
      <Modal.Header closeButton>
        <Modal.Title>{loading ? "Loading..." : "Edit Class"}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Session title"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Session description"
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <div style={{ flex: 1 }}>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Form.Label>Start</Form.Label>
              <Form.Control
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Form.Label>End</Form.Label>
              <Form.Control
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaveDisabled}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}