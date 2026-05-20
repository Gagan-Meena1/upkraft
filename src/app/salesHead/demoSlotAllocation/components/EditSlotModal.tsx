import React, { useState, useEffect } from "react";
import { Society, ClassData, RegistrationData, FullRegistrationData } from "./Types";

export type SlotStatusValue = "na" | "open" | "demo" | "booked" | "edit";

export interface EditSlotData {
  status: SlotStatusValue;
  societyIds: string[];
  // Registration form fields
  name: string;
  participantName: string;
  contactNumber: string;
  email: string;
  age: string;
  instrument: string;
  city: string;
  societyName: string;
  notes: string;
  address: string;
  // Time
  startTime: string;
  endTime: string;
  duration: number;
  // Booked / payment
  paymentAmount: string;
  // Class reference
  classId: string;
  // Registration reference (for edit/delete)
  registrationId: string;
  // Edited date (may differ from the grid cell date)
  editDate: string;
}

interface EditSlotModalProps {
  dateLabel: string;
  timeLabel: string;
  hour: number;
  dateStr: string;
  societies: Society[];
  initialStatus: SlotStatusValue;
  initialSocietyIds: string[];
  slotClasses: ClassData[];
  initialRegistration?: RegistrationData | null;
  onClose: () => void;
  onSave: (data: EditSlotData) => void;
  onDelete?: (registrationId: string) => void;
  onSelectMore?: (startTime: string, endTime: string) => void;
  saving: boolean;
  pendingCount?: number;
}

const STATUS_OPTIONS: { value: SlotStatusValue; label: string; cls: string }[] = [
  { value: "na", label: "NA", cls: "sel-na" },
  { value: "open", label: "Open", cls: "sel-open" },
  { value: "demo", label: "Demo", cls: "sel-demo" },
  { value: "booked", label: "Booked", cls: "sel-booked" },
  { value: "edit", label: "Edit", cls: "sel-edit" },
];

const DURATIONS = [30, 45, 60, 90];

const EditSlotModal: React.FC<EditSlotModalProps> = ({
  dateLabel,
  timeLabel,
  hour,
  dateStr,
  societies,
  initialStatus,
  initialSocietyIds,
  slotClasses,
  initialRegistration,
  onClose,
  onSave,
  onDelete,
  onSelectMore,
  saving,
  pendingCount = 0,
}) => {
  const [status, setStatus] = useState<SlotStatusValue>(initialStatus);
  const [selectedSocs, setSelectedSocs] = useState<string[]>(initialSocietyIds);
  const [allSocs, setAllSocs] = useState(initialSocietyIds.length === 0 && initialStatus === "open");

  // Lightweight registration from allTutorsInfo (used for grid display)
  const reg = initialRegistration;

  // Full registration data — fetched on demand when Edit is selected
  const [fullReg, setFullReg] = useState<FullRegistrationData | null>(null);
  const [loadingFullReg, setLoadingFullReg] = useState(false);

  // Registration form fields — initially empty, filled when fullReg loads or for new demo/booked
  const [name, setName] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [instrument, setInstrument] = useState("");
  const [city, setCity] = useState("");
  const [societyName, setSocietyName] = useState(reg?.societyName || "");
  const [customSociety, setCustomSociety] = useState(false);
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState(reg?.address || "");

  // Time
  const [startTime, setStartTime] = useState(`${String(hour).padStart(2, "0")}:00`);
  const [endTime, setEndTime] = useState(`${String(hour + 1).padStart(2, "0")}:00`);
  const [duration, setDuration] = useState(60);

  // Booked
  const [paymentAmount, setPaymentAmount] = useState(reg?.paymentAmount ? String(reg.paymentAmount) : "");

  // Class selection
  const [selectedClassId, setSelectedClassId] = useState(slotClasses.length > 0 ? slotClasses[0]._id : "");

  // Registration ID for edit/delete
  const registrationId = reg?._id || "";

  // Date for edit mode (editable)
  const [editDate, setEditDate] = useState(dateStr);

  // Fetch full registration data when modal opens if there's an existing registration
  useEffect(() => {
    if (registrationId && !fullReg) {
      setLoadingFullReg(true);
      fetch(`/Api/registration/${registrationId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const fr = data.data as FullRegistrationData;
            setFullReg(fr);
            // Populate form fields
            setName(fr.name || "");
            setParticipantName(fr.participantName || "");
            setContactNumber(fr.contactNumber || "");
            setEmail(fr.email || "");
            setAge(fr.age ? String(fr.age) : "");
            setInstrument(fr.instrument || "");
            setCity(fr.city || "");
            setSocietyName(fr.societyName || "");
            setNotes(fr.notes || "");
            setAddress(fr.address || "");
            setPaymentAmount(fr.paymentAmount ? String(fr.paymentAmount) : "");
          }
        })
        .catch(err => console.error("Error fetching full registration:", err))
        .finally(() => setLoadingFullReg(false));
    }
  }, [registrationId]);

  useEffect(() => {
    const [h, m] = startTime.split(":").map(Number);
    const totalMin = h * 60 + m + duration;
    const eh = Math.floor(totalMin / 60) % 24;
    const em = totalMin % 60;
    setEndTime(`${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`);
  }, [duration, startTime]);

  const toggleSoc = (id: string) => {
    setAllSocs(false);
    setSelectedSocs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAllSocs = () => {
    setAllSocs(!allSocs);
    if (!allSocs) setSelectedSocs([]);
  };

  const needsForm = status === "demo" || status === "booked";
  const needsEditForm = status === "edit";
  const needsSocs = status === "open";

  const formatTime12 = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const handleSave = () => {
    onSave({
      status,
      societyIds: allSocs ? [] : selectedSocs,
      name,
      participantName,
      contactNumber,
      email,
      age,
      instrument,
      city,
      societyName,
      notes,
      address,
      startTime,
      endTime,
      duration,
      paymentAmount,
      classId: selectedClassId,
      registrationId,
      editDate,
    });
  };

  const hasRegistration = !!reg;

  return (
    <div className="sm-overlay show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sm-modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mh">
          <h3>✏️ Edit Slot</h3>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="mb" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Slot info pill */}
          <div className="slot-pill">
            <div className="sp-i">
              <span className="sp-l">Day</span>
              <span className="sp-v">{dateLabel}</span>
            </div>
            <div className="sp-i">
              <span className="sp-l">Time</span>
              <span className="sp-v">{timeLabel}</span>
            </div>
            {hasRegistration && (
              <div className="sp-i">
                <span className="sp-l">Registration</span>
                <span className="sp-v" style={{ color: "var(--green)" }}>{reg?.participantName || reg?.name}</span>
              </div>
            )}
          </div>

          {/* Status selector */}
          <div>
            <div className="sec-label">Status</div>
            <div className="status-row">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`s-opt${status === opt.value ? ` ${opt.cls}` : ""}`}
                  onClick={() => setStatus(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Society selection — Open */}
          {needsSocs && (
            <div className="soc-section show">
              <div className="sec-label">Available for Societies</div>
              <div className="soc-chips">
                <button
                  className={`soc-chip all-chip${allSocs ? " on" : ""}`}
                  onClick={toggleAllSocs}
                >
                  ✓ All
                </button>
                {societies.map((s) => (
                  <button
                    key={s._id}
                    className={`soc-chip${selectedSocs.includes(s._id) ? " on" : ""}`}
                    onClick={() => toggleSoc(s._id)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Registration form — Demo / Booked (new registration) */}
          {needsForm && (
            <div className="cust-form show">
              <div className="sec-label">
                {status === "demo" ? "Demo Registration Details" : "Booking Details"}
              </div>

              <div className="fi">
                <label className="fl">Parent / Guardian Name <span className="req">*</span></label>
                <input className="finput" placeholder="Parent / guardian name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="fi">
                <label className="fl">Participant Name <span className="req">*</span></label>
                <input className="finput" placeholder="Student / participant name" value={participantName} onChange={(e) => setParticipantName(e.target.value)} />
              </div>

              <div className="two">
                <div className="fi">
                  <label className="fl">Contact Number <span className="req">*</span></label>
                  <input className="finput" placeholder="+91 98765 43210" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                </div>
                <div className="fi">
                  <label className="fl">Email</label>
                  <input className="finput" placeholder="email@example.com (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="two">
                <div className="fi">
                  <label className="fl">Age</label>
                  <input className="finput" type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="fi">
                  <label className="fl">Instrument / Hobby <span className="req">*</span></label>
                  <input className="finput" placeholder="e.g., Guitar, Dance" value={instrument} onChange={(e) => setInstrument(e.target.value)} />
                </div>
              </div>

              <div className="two">
                <div className="fi">
                  <label className="fl">City <span className="req">*</span></label>
                  <input className="finput" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="fi">
                  <label className="fl">Society Name</label>
                  <select
                    className="finput"
                    value={customSociety ? "__other__" : societyName}
                    onChange={(e) => {
                      if (e.target.value === "__other__") {
                        setCustomSociety(true);
                        setSocietyName("");
                      } else {
                        setCustomSociety(false);
                        setSocietyName(e.target.value);
                        const soc = societies.find(s => s.name === e.target.value);
                        if (soc?.city) setCity(soc.city);
                      }
                    }}
                  >
                    <option value="">— Select Society —</option>
                    {societies.map(s => (
                      <option key={s._id} value={s.name}>{s.name}{s.city ? ` (${s.city})` : ""}</option>
                    ))}
                    <option value="__other__">Other (type manually)</option>
                  </select>
                  {customSociety && (
                    <input
                      className="finput"
                      placeholder="Enter society name..."
                      value={societyName}
                      onChange={(e) => setSocietyName(e.target.value)}
                      autoFocus
                      style={{ marginTop: 6 }}
                    />
                  )}
                </div>
              </div>

              <div className="fi">
                <label className="fl">Address</label>
                <input className="finput" placeholder="Full address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div className="fi">
                <label className="fl">Notes</label>
                <textarea className="finput" placeholder="Any additional notes…" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ minHeight: 60, resize: "vertical" }} />
              </div>

              {/* Payment — only for Booked */}
              {status === "booked" && (
                <div className="fi">
                  <label className="fl">Payment Amount (₹) <span className="req">*</span></label>
                  <input className="finput" type="number" placeholder="e.g., 500" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                </div>
              )}
            </div>
          )}

          {/* Edit Registration form — pre-filled */}
          {needsEditForm && hasRegistration && loadingFullReg && (
            <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              Loading registration details…
            </div>
          )}
          {needsEditForm && hasRegistration && !loadingFullReg && (
            <div className="cust-form show">
              <div className="sec-label" style={{ color: "var(--violet)" }}>Edit Registration Details</div>

              <div className="fi">
                <label className="fl">Parent / Guardian Name <span className="req">*</span></label>
                <input className="finput" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="fi">
                <label className="fl">Participant Name <span className="req">*</span></label>
                <input className="finput" value={participantName} onChange={(e) => setParticipantName(e.target.value)} />
              </div>

              <div className="two">
                <div className="fi">
                  <label className="fl">Contact Number <span className="req">*</span></label>
                  <input className="finput" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                </div>
                <div className="fi">
                  <label className="fl">Email</label>
                  <input className="finput" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="two">
                <div className="fi">
                  <label className="fl">Age</label>
                  <input className="finput" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="fi">
                  <label className="fl">Instrument / Hobby <span className="req">*</span></label>
                  <input className="finput" value={instrument} onChange={(e) => setInstrument(e.target.value)} />
                </div>
              </div>

              <div className="two">
                <div className="fi">
                  <label className="fl">City <span className="req">*</span></label>
                  <input className="finput" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="fi">
                  <label className="fl">Society Name</label>
                  <select
                    className="finput"
                    value={customSociety ? "__other__" : societyName}
                    onChange={(e) => {
                      if (e.target.value === "__other__") {
                        setCustomSociety(true);
                        setSocietyName("");
                      } else {
                        setCustomSociety(false);
                        setSocietyName(e.target.value);
                        const soc = societies.find(s => s.name === e.target.value);
                        if (soc?.city) setCity(soc.city);
                      }
                    }}
                  >
                    <option value="">— Select Society —</option>
                    {societies.map(s => (
                      <option key={s._id} value={s.name}>{s.name}{s.city ? ` (${s.city})` : ""}</option>
                    ))}
                    <option value="__other__">Other (type manually)</option>
                  </select>
                  {customSociety && (
                    <input
                      className="finput"
                      placeholder="Enter society name..."
                      value={societyName}
                      onChange={(e) => setSocietyName(e.target.value)}
                      autoFocus
                      style={{ marginTop: 6 }}
                    />
                  )}
                </div>
              </div>

              <div className="fi">
                <label className="fl">Address</label>
                <input className="finput" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div className="fi">
                <label className="fl">Notes</label>
                <textarea className="finput" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ minHeight: 60, resize: "vertical" }} />
              </div>

              <div className="fi">
                <label className="fl">Payment Amount (₹)</label>
                <input className="finput" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
              </div>

              {/* Date & Time edit for registration + slot + class */}
              <div className="sec-label" style={{ marginTop: 8, color: "var(--violet)" }}>Change Date & Time</div>
              <div className="two">
                <div className="fi">
                  <label className="fl">Date</label>
                  <input className="finput" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                </div>
                <div className="fi">
                  <label className="fl">Start Time</label>
                  <input className="finput" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
              </div>
              <div className="dur-row">
                {DURATIONS.map((d) => (
                  <button key={d} className={`dur-chip${duration === d ? " on" : ""}`} onClick={() => setDuration(d)}>
                    {d} min
                  </button>
                ))}
              </div>
              <div className="t-preview">
                {editDate} · {formatTime12(startTime)} – {formatTime12(endTime)}
              </div>
            </div>
          )}

          {/* Edit not available message — when no registration exists */}
          {needsEditForm && !hasRegistration && (
            <div style={{ padding: 16, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              No registration found for this slot. Edit is only available for Demo or Booked slots.
            </div>
          )}

          {/* Time inputs — for Open, Demo, Booked */}
          {(status === "open" || status === "demo" || status === "booked") && (
            <div>
              <div className="sec-label">Time</div>
              <div className="time-inp">
                <input className="finput" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                <span className="tsep">→</span>
                <input className="finput" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                <span className="tsep">{duration}m</span>
              </div>
              <div className="dur-row">
                {DURATIONS.map((d) => (
                  <button key={d} className={`dur-chip${duration === d ? " on" : ""}`} onClick={() => setDuration(d)}>
                    {d} min
                  </button>
                ))}
              </div>
              <div className="t-preview">
                {formatTime12(startTime)} – {formatTime12(endTime)}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mf">
          {/* Delete button — only when editing an existing registration */}
          {hasRegistration && onDelete && (
            <button
              className="sm-btn"
              style={{ background: "var(--rl)", color: "var(--red)", border: "1.5px solid var(--red)", marginRight: "auto" }}
              onClick={() => {
                if (confirm("Delete this registration? The class will also be deleted and the slot will become Open.")) {
                  onDelete(registrationId);
                }
              }}
              disabled={saving}
            >
              🗑 Delete
            </button>
          )}
          <button className="sm-btn sm-btn-o" onClick={onClose}>Cancel</button>
          {status === "open" && onSelectMore && (
            <button
              className="sm-btn"
              style={{ background: "var(--amber)", color: "#fff", border: "none" }}
              onClick={() => onSelectMore(startTime, endTime)}
            >
              ➕ Select More {pendingCount > 0 ? `(${pendingCount} queued)` : ""}
            </button>
          )}
          <button className="sm-btn sm-btn-p" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.5 : 1 }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSlotModal;
