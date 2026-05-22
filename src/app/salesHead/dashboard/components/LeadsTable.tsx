"use client";
import React, { useState, useEffect } from 'react';

interface LeadsTableProps {
  leads: any[];
  onLeadUpdated: (updatedLead: any) => void;
  showAddModal: boolean;
  onCloseAddModal: () => void;
  onLeadCreated: (newLead: any) => void;
}

export default function LeadsTable({ leads, onLeadUpdated, showAddModal, onCloseAddModal, onLeadCreated }: LeadsTableProps) {
  const [editingLead, setEditingLead] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [societies, setSocieties] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);

  // Create lead form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPname, setNewPname] = useState('');
  const [newAge, setNewAge] = useState<number | ''>('');
  const [newNotes, setNewNotes] = useState('');
  const [newSocietyId, setNewSocietyId] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [newTutorId, setNewTutorId] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [editSpoc, setEditSpoc] = useState('');

  const resetCreateForm = () => {
    setNewName(''); setNewEmail(''); setNewPhone('');
    setNewPname(''); setNewAge(''); setNewNotes('');
    setNewSocietyId(''); setNewHobby('');
    setNewTutorId(''); setNewDate(''); setNewSlotTime('');
  };

  const selectedSocietyObj = societies.find((s: any) => s._id === newSocietyId) || null;

  const handleCreateLead = async () => {
    if (!newName || !newPhone || !newPname || !newHobby || !newTutorId || !newDate || !newSlotTime) {
      alert('Please fill all required fields: Name, Phone, Participant, Hobby, Tutor, Date, Slot Time');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/Api/public/bookTrial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          email: newEmail || '',
          pname: newPname,
          age: newAge ? Number(newAge) : null,
          notes: newNotes || '',
          consent: true,
          society: selectedSocietyObj ? { name: selectedSocietyObj.name, city: selectedSocietyObj.city } : null,
          hobby: { name: newHobby },
          tutorId: newTutorId,
          date: newDate,
          slotTime: newSlotTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to book trial');
      alert('Trial booked successfully!');
      onLeadCreated(null); // signal parent to refetch
      resetCreateForm();
      onCloseAddModal();
    } catch (err: any) {
      alert(err.message || 'Error booking trial');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const res = await fetch('/Api/salesHead/society');
        const data = await res.json();
        if (data.success && data.societies) {
          setSocieties(data.societies);
        }
      } catch (err) {
        console.error('Error fetching societies:', err);
      }
    };
    fetchSocieties();
  }, []);

  // Fetch tutors for the add lead modal
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await fetch('/Api/salesHead/allTutorsInfo');
        const data = await res.json();
        if (data.success && data.tutors) {
          setTutors(data.tutors);
        }
      } catch (err) {
        console.error('Error fetching tutors:', err);
      }
    };
    fetchTutors();
  }, []);

  // Edit form state — all Registration fields
  const [editName, setEditName] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [editCountryCode, setEditCountryCode] = useState('+91');
  const [editEmail, setEditEmail] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editSocietyName, setEditSocietyName] = useState('');
  const [editInstrument, setEditInstrument] = useState('');
  const [editParticipantName, setEditParticipantName] = useState('');
  const [editAge, setEditAge] = useState<number | ''>('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentAmount, setEditPaymentAmount] = useState(0);
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editDemoDate, setEditDemoDate] = useState('');
  const [editDemoTime, setEditDemoTime] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const openEditModal = (lead: any) => {
    setEditingLead(lead);
    setEditName(lead.name || '');
    setEditContactNumber(lead.contactNumber || '');
    setEditCountryCode(lead.countryCode || '+91');
    setEditEmail(lead.email || '');
    setEditCity(lead.city || '');
    setEditSocietyName(lead.societyName || '');
    setEditInstrument(lead.instrument || '');
    setEditParticipantName(lead.participantName || '');
    setEditAge(lead.age || '');
    setEditNotes(lead.notes || '');
    setEditStatus(lead.status || 'Pending');
    setEditPaymentAmount(lead.payment?.amount || 0);
    setEditPaymentStatus(lead.payment?.status || 'Pending');
    setEditDemoDate(lead.demoDate || '');
    setEditDemoTime(lead.demoTime || '');
    setEditAddress(lead.address || '');
    setEditSpoc(lead.spoc || '');
  };

  const closeEditModal = () => {
    setEditingLead(null);
  };

  const handleSave = async () => {
    if (!editingLead) return;
    setSaving(true);

    const payload: any = {
      name: editName,
      contactNumber: editContactNumber,
      countryCode: editCountryCode,
      email: editEmail,
      city: editCity,
      societyName: editSocietyName || null,
      instrument: editInstrument,
      participantName: editParticipantName || null,
      age: editAge ? Number(editAge) : null,
      notes: editNotes || null,
      status: editStatus,
      payment: {
        amount: Number(editPaymentAmount),
        status: editPaymentStatus,
      },
      demoDate: editDemoDate || null,
      demoTime: editDemoTime || null,
      address: editAddress || null,
      spoc: editSpoc || null,
    };

    try {
      const res = await fetch(`/Api/registration/${editingLead._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const { data } = await res.json();
        onLeadUpdated(data);
        closeEditModal();
      } else {
        alert('Failed to update registration');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating registration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="table-wrap">
        <table className="table" style={{ minWidth: '1940px', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '110px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '160px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '110px' }} />
            <col style={{ width: '160px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '110px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '140px' }} />
            <col style={{ width: '90px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>SPOC</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Society</th>
              <th>Hobby</th>
              <th>Participant</th>
              <th>Enquiry Date</th>
              <th>Tutor Assigned</th>
              <th>Slot Assigned</th>
              <th>Demo Status</th>
              <th>Payment Status</th>
              <th>Notes</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={15} className="empty-state">
                  <div className="em-ico">📭</div>
                  <p>No leads found.</p>
                </td>
              </tr>
            ) : (
              leads.map((lead, idx) => (
                <tr key={idx}>
                  <td>
                    {lead.spoc ? (
                      <span className="society-tag">{lead.spoc}</span>
                    ) : (
                      <div style={{ fontSize: '11px', color: 'var(--text2)' }}>—</div>
                    )}
                  </td>
                  <td>
                    <div className="lead-name">{lead.name || '-'}</div>
                  </td>
                  <td>
                    <div className="lead-phone">{lead.countryCode} {lead.contactNumber}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: 'var(--text2)', wordBreak: 'break-all' }}>{lead.email || '-'}</div>
                  </td>
                  <td>
                    {(lead.societyName || lead.city) ? <span className="society-tag">{lead.societyName || lead.city}</span> : '-'}
                  </td>
                  <td>
                    {lead.instrument ? <span className="hobby-tag">{lead.instrument}</span> : '-'}
                  </td>
                  <td>
                    <div className="lead-name">{lead.participantName || '-'}</div>
                  </td>
                  <td>
                    <div className="date-cell">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-GB') : '-'}
                    </div>
                  </td>
                  <td>
                    {lead.tutorName && typeof lead.tutorName === 'object' ? (
                      <div className="tutor-cell">
                        <div className="tutor-ava">{lead.tutorName.username?.charAt(0) || 'T'}</div>
                        <div>
                          <div className="tutor-name-cell">{lead.tutorName.username}</div>
                          <div style={{ fontSize: '10px', color: '#888' }}>{lead.tutorName.email}</div>
                          {lead.tutorName.contact && <div style={{ fontSize: '10px', color: '#888' }}>{lead.tutorName.contact}</div>}
                        </div>
                      </div>
                    ) : (
                      <div className="tutor-unassigned">Not Assigned</div>
                    )}
                  </td>
                  <td>
                    {(lead.demoTime || lead.demoDate) ? (
                      <>
                        <div className="slot-cell">{lead.demoTime || ''}</div>
                        <div className="slot-day">{lead.demoDate ? new Date(lead.demoDate).toLocaleDateString('en-GB') : ''}</div>
                      </>
                    ) : (
                      <div className="slot-unassigned">Not set</div>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${lead.status === 'Done' ? 's-demo-done' : lead.status === 'Cancelled' ? 's-demo-missed' : lead.status === 'Overdue' ? 's-overdue' : 's-pending'}`}>
                      {lead.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>₹{lead.payment?.amount || 0}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: lead.payment?.status === 'Done' ? 'var(--green)' : 'var(--amber)' }}>
                      {lead.payment?.status || 'Pending'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '11px', color: 'var(--text2)', whiteSpace: 'normal' }}>
                      {lead.notes || '-'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '11px', color: 'var(--text2)', whiteSpace: 'normal' }}>
                      {lead.address || '-'}
                    </div>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="act-btn" onClick={() => openEditModal(lead)}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingLead && (
        <div className="edit-modal-overlay show">
          <div className="edit-modal" style={{ maxWidth: '640px' }}>
            <div className="edit-modal-head">
              <h2>Edit Registration</h2>
              <button className="edit-modal-close" onClick={closeEditModal}>×</button>
            </div>
            <div className="edit-modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              {/* Section: Contact Details */}
              <div className="edit-modal-section-label">Contact Details</div>
              <div className="edit-modal-grid">
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Name</label>
                  <input className="edit-form-input" value={editName} onChange={e => setEditName(e.target.value)} />
                </div>
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Email</label>
                  <input className="edit-form-input" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                </div>
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Country Code</label>
                  <input className="edit-form-input" value={editCountryCode} onChange={e => setEditCountryCode(e.target.value)} />
                </div>
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Contact Number</label>
                  <input className="edit-form-input" value={editContactNumber} onChange={e => setEditContactNumber(e.target.value)} />
                </div>
              </div>

              {/* Section: Location & Hobby */}
              <div className="edit-modal-section-label">Location & Hobby</div>
              <div className="edit-modal-grid">
                <div className="edit-modal-field">
                  <label className="edit-modal-label">City</label>
                  <input className="edit-form-input" value={editCity} onChange={e => setEditCity(e.target.value)} />
                </div>
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Society Name</label>
                  <select className="edit-modal-select" value={editSocietyName} onChange={e => setEditSocietyName(e.target.value)}>
                    <option value="">-- Select Society --</option>
                    {societies.map((s: any) => (
                      <option key={s._id} value={s.name}>{s.name} ({s.city})</option>
                    ))}
                  </select>
                </div>
                <div className="edit-modal-field full">
                  <label className="edit-modal-label">Hobby / Instrument</label>
                  <input className="edit-form-input" value={editInstrument} onChange={e => setEditInstrument(e.target.value)} />
                </div>
              </div>

              {/* Section: Participant */}
              <div className="edit-modal-section-label">Participant</div>
              <div className="edit-modal-grid">
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Participant Name</label>
                  <input className="edit-form-input" value={editParticipantName} onChange={e => setEditParticipantName(e.target.value)} />
                </div>
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Age</label>
                  <input className="edit-form-input" type="number" min={1} max={99} value={editAge} onChange={e => setEditAge(e.target.value ? Number(e.target.value) : '')} />
                </div>
              </div>

              {/* Section: Demo & Slot */}
              <div className="edit-modal-section-label">Demo & Slot</div>
              <div className="edit-modal-grid">
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Demo Status</label>
                  <select className="edit-modal-select" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Done">Done</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Demo Date</label>
                  <input className="edit-form-input" type="date" value={editDemoDate ? editDemoDate.split('T')[0] : ''} onChange={e => setEditDemoDate(e.target.value)} />
                </div>
                <div className="edit-modal-field full">
                  <label className="edit-modal-label">Demo Time</label>
                  <input className="edit-form-input" placeholder="e.g. 10:00 AM" value={editDemoTime} onChange={e => setEditDemoTime(e.target.value)} />
                </div>
              </div>

              {/* Section: Payment */}
              <div className="edit-modal-section-label">Payment</div>
              <div className="edit-modal-grid">
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Payment Amount (₹)</label>
                  <input type="number" className="edit-form-input" value={editPaymentAmount} onChange={e => setEditPaymentAmount(Number(e.target.value))} />
                </div>
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Payment Status</label>
                  <select className="edit-modal-select" value={editPaymentStatus} onChange={e => setEditPaymentStatus(e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              {/* Section: Notes */}
              <div className="edit-modal-section-label">Notes</div>
              <div className="edit-modal-grid">
                <div className="edit-modal-field full">
                  <label className="edit-modal-label">Notes</label>
                  <textarea className="edit-form-input" rows={3} style={{ resize: 'vertical', minHeight: '60px' }} value={editNotes} onChange={e => setEditNotes(e.target.value)} />
                </div>
              </div>

              {/* Section: Address */}
              <div className="edit-modal-section-label">Address</div>
              <div className="edit-modal-grid">
                <div className="edit-modal-field full">
                  <label className="edit-modal-label">Address</label>
                  <textarea className="edit-form-input" rows={2} style={{ resize: 'vertical', minHeight: '50px' }} value={editAddress} onChange={e => setEditAddress(e.target.value)} placeholder="Enter address..." />
                </div>
              </div>
              {/* Section: SPOC */}
              <div className="edit-modal-section-label">SPOC</div>
              <div className="edit-modal-grid">
                <div className="edit-modal-field full">
                  <label className="edit-modal-label">SPOC</label>
                  <select className="edit-modal-select" value={editSpoc} onChange={e => setEditSpoc(e.target.value)}>
                    <option value="">-- Not Assigned --</option>
                    {["Tejasvi", "Yash", "Nidhi", "Chandraditya", "Varun", "Nikita", "Kritika"].map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="edit-modal-foot">
              <button className="btn btn-outline" onClick={closeEditModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal — posts to bookTrial */}
      {showAddModal && (
        <div className="edit-modal-overlay show">
          <div className="edit-modal" style={{ maxWidth: '640px' }}>
            <div className="edit-modal-head">
              <h2>Book a Trial</h2>
              <button className="edit-modal-close" onClick={() => { resetCreateForm(); onCloseAddModal(); }}>×</button>
            </div>
            <div className="edit-modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              <div className="edit-modal-section-label">Parent / Guardian *</div>
              <div className="edit-modal-grid">
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Name *</label>
                  <input className="edit-form-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Parent name" />
                </div>
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Phone *</label>
                  <input className="edit-form-input" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="9876543210" />
                </div>
                <div className="edit-modal-field full">
                  <label className="edit-modal-label">Email</label>
                  <input className="edit-form-input" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@example.com" />
                </div>
              </div>

              <div className="edit-modal-section-label">Participant *</div>
              <div className="edit-modal-grid">
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Participant Name *</label>
                  <input className="edit-form-input" value={newPname} onChange={e => setNewPname(e.target.value)} placeholder="Child's name" />
                </div>
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Age</label>
                  <input className="edit-form-input" type="number" min={1} max={99} value={newAge} onChange={e => setNewAge(e.target.value ? Number(e.target.value) : '')} />
                </div>
              </div>

              <div className="edit-modal-section-label">Society & Hobby *</div>
              <div className="edit-modal-grid">
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Society</label>
                  <select className="edit-modal-select" value={newSocietyId} onChange={e => setNewSocietyId(e.target.value)}>
                    <option value="">-- Select Society --</option>
                    {societies.map((s: any) => (
                      <option key={s._id} value={s._id}>{s.name} ({s.city})</option>
                    ))}
                  </select>
                </div>
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Hobby *</label>
                  <input className="edit-form-input" value={newHobby} onChange={e => setNewHobby(e.target.value)} placeholder="e.g. Guitar, Piano" />
                </div>
              </div>

              <div className="edit-modal-section-label">Demo Slot *</div>
              <div className="edit-modal-grid">
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Tutor *</label>
                  <select className="edit-modal-select" value={newTutorId} onChange={e => setNewTutorId(e.target.value)}>
                    <option value="">-- Select Tutor --</option>
                    {tutors.map((t: any) => (
                      <option key={t._id} value={t._id}>{t.username} ({t.email})</option>
                    ))}
                  </select>
                </div>
                <div className="edit-modal-field">
                  <label className="edit-modal-label">Date *</label>
                  <input className="edit-form-input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                </div>
                <div className="edit-modal-field full">
                  <label className="edit-modal-label">Slot Time *</label>
                  <input className="edit-form-input" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} placeholder="e.g. 04:00 PM" />
                </div>
              </div>

              <div className="edit-modal-section-label">Notes</div>
              <div className="edit-modal-grid">
                <div className="edit-modal-field full">
                  <label className="edit-modal-label">Notes</label>
                  <textarea className="edit-form-input" rows={3} style={{ resize: 'vertical', minHeight: '60px' }} value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Any additional info..." />
                </div>
              </div>
            </div>
            <div className="edit-modal-foot">
              <button className="btn btn-outline" onClick={() => { resetCreateForm(); onCloseAddModal(); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateLead} disabled={creating}>
                {creating ? 'Booking...' : 'Book Trial'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
