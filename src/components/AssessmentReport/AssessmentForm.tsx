'use client';

import React, { useState, useRef } from 'react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { AssessmentData, ReportTemplate } from './ReportTemplate';

const initialData: AssessmentData = {
  tutorName: '',
  instrument: 'Keyboard',
  demoDate: new Date().toISOString().split('T')[0],
  studentName: '',
  societyName: '',
  rhythmSense: 5,
  earTraining: 5,
  technique: 5,
  theoretical: 5,
  engagement: 5,
  overall: 5,
  feedback: '',
};

export const AssessmentForm: React.FC = () => {
  const [data, setData] = useState<AssessmentData>(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Parse numbers for metric fields
    if (['rhythmSense', 'earTraining', 'technique', 'theoretical', 'engagement', 'overall'].includes(name)) {
      setData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      // Small delay to ensure any fonts/images are loaded (though we are mostly using text/icons)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const element = reportRef.current;
      const dataUrl = await toJpeg(element, { quality: 0.95, pixelRatio: 2 });
      
      // Create a temporary jsPDF instance to get image properties
      const tempPdf = new jsPDF();
      const imgProps = tempPdf.getImageProperties(dataUrl);
      
      // Create the actual PDF with the exact dimensions of the image
      const pdf = new jsPDF({
        orientation: imgProps.width > imgProps.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgProps.width, imgProps.height]
      });

      pdf.addImage(dataUrl, 'JPEG', 0, 0, imgProps.width, imgProps.height);
      pdf.save(`Demo_Assessment_${data.studentName || 'Student'}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderRadioGroup = (name: string, label: string) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label} <span className="text-red-500">*</span></label>
        <div className="flex gap-4 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <label key={num} className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name={name}
                value={num}
                checked={(data as any)[name] === num}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out cursor-pointer"
              />
              <span className="ml-2 text-sm text-gray-700">{num}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      
      <div className="w-full bg-white rounded-lg shadow-md p-6 h-fit">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">UpKraft Demo Class Feedback Form</h2>
        
        <div className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tutor Name <span className="text-red-500">*</span></label>
            <select name="tutorName" value={data.tutorName} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Select Tutor</option>
              <option value="Sonu">Sonu</option>
              <option value="Sanjay">Sanjay</option>
              <option value="Mohit">Mohit</option>
              <option value="Dinesh">Dinesh</option>
              <option value="Naglenjoy">Naglenjoy</option>
              <option value="Bharat">Bharat</option>
              <option value="Amitabh">Amitabh</option>
              <option value="Chalathi">Chalathi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instrument Taught <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
              {['Keyboard', 'Guitar', 'Western Vocals'].map((inst) => (
                <label key={inst} className="inline-flex items-center">
                  <input type="radio" name="instrument" value={inst} checked={data.instrument === inst} onChange={handleChange} className="form-radio text-indigo-600"/>
                  <span className="ml-2 text-sm text-gray-700">{inst}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Demo Date <span className="text-red-500">*</span></label>
            <input type="date" name="demoDate" value={data.demoDate} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
            <input type="text" name="studentName" value={data.studentName} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" placeholder="Your answer" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Society Name</label>
            <input type="text" name="societyName" value={data.societyName} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" placeholder="Your answer" />
          </div>

          <div className="border-t pt-4 mt-6">
            <h3 className="font-bold text-gray-700 mb-4">Metrics (1 - 10)</h3>
            {renderRadioGroup('rhythmSense', 'Feedback Metric : Rhythm Sense')}
            {renderRadioGroup('earTraining', 'Feedback Metric : Ear Training / Listening Ability')}
            {renderRadioGroup('technique', 'Feedback Metric : Technique / Hand Positioning')}
            {renderRadioGroup('theoretical', 'Feedback Metric : Theoretical Understanding')}
            {renderRadioGroup('engagement', 'Feedback Metric : Engagement & Participation')}
            {renderRadioGroup('overall', 'Overall Performance During Demo')}
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tutor Overall Feedback <span className="text-red-500">*</span></label>
            <textarea name="feedback" value={data.feedback} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded-md p-2" placeholder="Your answer"></textarea>
          </div>

          <div className="mt-8">
            <button 
              onClick={generatePDF}
              disabled={isGenerating || !data.studentName || !data.tutorName}
              className={`w-full py-3 rounded-md text-white font-bold text-lg transition-colors
                ${(isGenerating || !data.studentName || !data.tutorName) ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isGenerating ? 'Generating PDF...' : 'Download Assessment Report PDF'}
            </button>
            {(!data.studentName || !data.tutorName) && (
              <p className="text-red-500 text-xs mt-2 text-center">Please fill Student Name and Tutor Name to download.</p>
            )}
          </div>
          
        </div>
      </div>

      {/* HIDDEN REPORT FOR PDF GENERATION */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div ref={reportRef}>
          <ReportTemplate data={data} />
        </div>
      </div>

    </div>
  );
};
