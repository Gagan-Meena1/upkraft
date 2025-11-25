import React, { useState } from 'react';

interface ExpressInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
}


const ExpressInterestModal: React.FC<ExpressInterestModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    name: '',
    city: '',
    phone: '',
    skill: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/Api/express-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          city: form.city,
          phone: form.phone,
          skill: form.skill,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSuccess(true);
      setForm({ name: '', city: '', phone: '', skill: '' });
    } catch (err) {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl pr-2"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-4">Request Demo</h2>
        {success ? (
          <div className="text-green-600 mb-4">Thank you! Your interest has been submitted.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Name:</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">City:</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Phone number:</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Skill expertise:</label>
              <select
                name="skill"
                value={form.skill}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              >
              </select>
            </div>
            {error && <div className="text-red-600">{error}</div>}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#ff8d57] text-white font-medium rounded-lg hover:bg-orange-700 transition shadow-lg"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ExpressInterestModal; 