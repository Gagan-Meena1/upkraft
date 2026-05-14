"use client";
import React, { useState } from 'react';

export default function LeadsTable({ leads: initialLeads }: { leads: any[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentAmount, setEditPaymentAmount] = useState(0);
  const [editPaymentStatus, setEditPaymentStatus] = useState('');

  const openEditModal = (lead: any) => {
    setEditingLead(lead);
    setEditStatus(lead.status || 'Pending');
    setEditPaymentAmount(lead.payment?.amount || 0);
    setEditPaymentStatus(lead.payment?.status || 'Pending');
  };

  const closeEditModal = () => {
    setEditingLead(null);
  };

  const handleSave = async () => {
    if (!editingLead) return;

    const payload = {
      status: editStatus,
      payment: {
        amount: Number(editPaymentAmount),
        status: editPaymentStatus,
      }
    };

    try {
      const res = await fetch(`/Api/registration/${editingLead._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const { data } = await res.json();
        setLeads(leads.map(l => l._id === data._id ? { ...l, status: data.status, payment: data.payment } : l));
        closeEditModal();
      } else {
        alert('Failed to update registration');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating registration');
    }
  };

  return (
    <>
      <div className="table-wrap">
        <table className="table" style={{ minWidth: '1800px', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '75px' }} />
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
            <col style={{ width: '140px' }} />
            <col style={{ width: '90px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>RID</th>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={14} className="empty-state">
                  <div className="em-ico">📭</div>
                  <p>No leads found.</p>
                </td>
              </tr>
            ) : (
              leads.map((lead, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="lead-id">{lead._id?.toString().slice(-6) || ''}</div>
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
        <div className="modal-overlay show">
          <div className="modal">
            <div className="modal-head">
              <h2>Edit Lead Status & Payment</h2>
              <button className="modal-close" onClick={closeEditModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-field full">
                  <label className="modal-label">Lead Status</label>
                  <select className="modal-select" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Done">Done</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Payment Amount</label>
                  <input type="number" className="form-input" value={editPaymentAmount} onChange={e => setEditPaymentAmount(Number(e.target.value))} />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Payment Status</label>
                  <select className="modal-select" value={editPaymentStatus} onChange={e => setEditPaymentStatus(e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" onClick={closeEditModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
