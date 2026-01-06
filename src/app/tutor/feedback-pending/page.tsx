"use client"
import React, { useState, useEffect } from 'react'
import ProgressBar from "react-bootstrap/ProgressBar";
import { Button, Form } from 'react-bootstrap'
import Link from 'next/link'
import StudentProfileImg from '../../../assets/student-profile-img.png'
import './FeedbackPendingDetails.css'
import Image from 'next/image';
import { useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation'

interface Student {
  _id: string;
  username: string;
  email: string;
  profileImage?: string;
}

interface Class {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  feedbackId?: string;
  course: string;
  courseCategory?: string;
  feedbackModelRequired?: string;
}

interface PendingClass {
  class: Class;
  students: Student[];
  selectedStudentIndex: number;
}

// Category → fields (keys must match model/API field names)
const CATEGORY_FIELDS: Record<string, Array<{ key: string; label: string }>> = {
  Music: [
    { key: "rhythm", label: "Rhythm" },
    { key: "theoreticalUnderstanding", label: "Theoretical Understanding" },
    { key: "performance", label: "Performance" },
    { key: "earTraining", label: "Ear Training" },
    { key: "assignment", label: "Assignment" },
    { key: "technique", label: "Technique" },
  ],
  Dance: [
    { key: "technique", label: "Technique" },
    { key: "musicality", label: "Musicality" },
    { key: "retention", label: "Retention" },
    { key: "performance", label: "Performance" },
    { key: "effort", label: "Effort" },
  ],
  Drawing: [
    { key: "observationalSkills", label: "Observational Skills" },
    { key: "lineQuality", label: "Line Quality" },
    { key: "proportionPerspective", label: "Proportion & Perspective" },
    { key: "valueShading", label: "Value & Shading" },
    { key: "compositionCreativity", label: "Composition & Creativity" },
  ],
  Vocal: [
    { key: "vocalTechniqueAndControl", label: "Vocal Technique & Control" },
    { key: "toneQualityAndRange", label: "Tone Quality & Range" },
    { key: "rhythmTimingAndMusicality", label: "Rhythm, Timing & Musicality" },
    { key: "dictionAndArticulation", label: "Diction & Articulation" },
    { key: "expressionAndPerformance", label: "Expression & Performance" },
    { key: "progressAndPracticeHabits", label: "Progress & Practice Habits" },
  ],
  Drums: [
    { key: "techniqueAndFundamentals", label: "Technique & Fundamentals" },
    { key: "timingAndTempo", label: "Timing & Tempo" },
    { key: "coordinationAndIndependence", label: "Coordination & Independence" },
    { key: "dynamicsAndMusicality", label: "Dynamics & Musicality" },
    { key: "patternKnowledgeAndReading", label: "Pattern Knowledge & Reading" },
    { key: "progressAndPracticeHabits", label: "Progress & Practice Habits" },
  ],
  Violin: [
    { key: "postureAndInstrumentHold", label: "Posture & Instrument Hold" },
    { key: "bowingTechnique", label: "Bowing Technique" },
    { key: "intonationAndPitchAccuracy", label: "Intonation & Pitch Accuracy" },
    { key: "toneQualityAndSoundProduction", label: "Tone Quality & Sound Production" },
    { key: "rhythmMusicalityAndExpression", label: "Rhythm, Musicality & Expression" },
    { key: "progressAndPracticeHabits", label: "Progress & Practice Habits" },
  ],
};

// Default values (1-10 scale) for a category
const buildDefaults = (category?: string) => {
  const fields = CATEGORY_FIELDS[category || "Music"] || CATEGORY_FIELDS["Music"];
  const values: Record<string, number | string> = { personalFeedback: "" };
  fields.forEach(f => (values[f.key] = 5));
  return values;
};

const getSubmitEndpoint = (category?: string, feedbackModelRequired?: string) => {
  switch (feedbackModelRequired) {
    case "feedbackDance":
      return "/Api/studentFeedback/dance";
    case "feedbackDrawing":
      return "/Api/studentFeedback/drawing";
    default: {
      switch (category) {
        case "Dance":
          return "/Api/studentFeedback/dance";
        case "Drawing":
          return "/Api/studentFeedback/drawing";
        case "Vocal":
          return "/Api/studentFeedback/vocal";
        case "Drums":
          return "/Api/studentFeedback/drums";
        case "Violin":
          return "/Api/studentFeedback/violin";
        default:
          return "/Api/studentFeedback"; // Music
      }
    }
  }
};

const FeedbackPendingDetails = () => {
  const [pendingClasses, setPendingClasses] = useState<PendingClass[]>([]);
  const [selectedClassEntry, setSelectedClassEntry] = useState<PendingClass | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<{[key: string]: boolean}>({});
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent'>('present');
  const [showAbsentConfirm, setShowAbsentConfirm] = useState(false);
  const router = useRouter();

  // New: search term + selected students per class (for bulk ops)
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudentsMap, setSelectedStudentsMap] = useState<Record<string, Set<string>>>({});

  const [feedbackData, setFeedbackData] = useState<Record<string, number | string>>(buildDefaults("Music"));

  const currentClass = selectedClassEntry?.class || null;
  const currentStudent = selectedClassEntry ? selectedClassEntry.students[selectedClassEntry.selectedStudentIndex] : null;
  const currentCategory = currentClass?.courseCategory || "Music";
  const currentFields = CATEGORY_FIELDS[currentCategory] || CATEGORY_FIELDS["Music"];
  const splitIndex = Math.ceil(currentFields.length / 2);

  useEffect(() => {
    const fetchPendingFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/Api/pendingFeedback');
        const data = await response.json();
        if(response.status === 401) {
          router.push('/login')
          return;
        } else if (!data.success) {
          throw new Error(data.error || 'Failed to load pending feedbacks');
        }

        // Group by classId -> build PendingClass[]
        const classMap = new Map<string, PendingClass>();

        (data.missingFeedbackClasses || []).forEach((item: any) => {
          const classId = item.classId;
          if (!classMap.has(classId)) {
            const cls: Class = {
              _id: item.classId,
              title: item.className,
              description: '',
              startTime: item.classDate || '',
              endTime: '',
              course: item.courseId,
              courseCategory: item.courseCategory,
              feedbackModelRequired: item.feedbackModelRequired
            };
            classMap.set(classId, { class: cls, students: [], selectedStudentIndex: 0 });
          }
          const entry = classMap.get(classId)!;
          entry.students.push({
            _id: item.studentId,
            username: item.studentName,
            email: '',
            profileImage: item.profileImage || undefined
          });
        });

        // Convert to array and sort classes by date desc
        const pendingArr: PendingClass[] = Array.from(classMap.values()).sort((a,b) => {
          const ta = a.class.startTime ? new Date(a.class.startTime).getTime() : 0;
          const tb = b.class.startTime ? new Date(b.class.startTime).getTime() : 0;
          return tb - ta;
        });

        setPendingClasses(pendingArr);
        if (pendingArr.length > 0) setSelectedClassEntry(pendingArr[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingFeedbacks();
  }, []);

  useEffect(() => {
    if (!selectedClassEntry) return;
    const category = selectedClassEntry.class?.courseCategory || "Music";
    setFeedbackData(buildDefaults(category));
    setAttendanceStatus('present');
  }, [selectedClassEntry]);

  // Utilities for selection/search
  const getVisibleStudents = (entry: PendingClass) => {
    if (!searchTerm) return entry.students;
    const q = searchTerm.trim().toLowerCase();
    return entry.students.filter(s => s.username.toLowerCase().includes(q));
  };
  
  // Filter classes so only classes (or students) matching the search are shown
  const filteredPendingClasses = pendingClasses.filter(entry => {
    if (!searchTerm) return true;
    const q = searchTerm.trim().toLowerCase();
    if ((entry.class.title || '').toLowerCase().includes(q)) return true;
    return entry.students.some(s => s.username.toLowerCase().includes(q));
  });
  
  // Keep selection in sync when search/pendingClasses changes
  useEffect(() => {
    if (!searchTerm) {
      if (pendingClasses.length > 0) setSelectedClassEntry(pendingClasses[0]);
      return;
    }
    if (filteredPendingClasses.length > 0) {
      const exists = selectedClassEntry && filteredPendingClasses.some(e => e.class._id === selectedClassEntry.class._id);
      if (!exists) setSelectedClassEntry(filteredPendingClasses[0]);
    } else {
      setSelectedClassEntry(null);
    }
  }, [searchTerm, pendingClasses]);

  const toggleStudentSelection = (classId: string, studentId: string) => {
    setSelectedStudentsMap(prev => {
      const existing = prev[classId] ? new Set(Array.from(prev[classId])) : new Set<string>();
      if (existing.has(studentId)) existing.delete(studentId);
      else existing.add(studentId);
      return { ...prev, [classId]: existing };
    });
  };

  const selectAllVisibleForClass = (classId: string, visibleStudents: Student[]) => {
    setSelectedStudentsMap(prev => {
      const setAll = new Set<string>(visibleStudents.map(s => s._id));
      return { ...prev, [classId]: setAll };
    });
  };

  const clearAllSelectionsForClass = (classId: string) => {
    setSelectedStudentsMap(prev => {
      if (!prev[classId]) return prev;
      const copy = { ...prev };
      copy[classId] = new Set<string>();
      return copy;
    });
  };

  const isStudentSelected = (classId: string, studentId: string) => {
    return !!selectedStudentsMap[classId] && selectedStudentsMap[classId].has(studentId);
  };

  // New: submit same feedback for all selected students in current class
  const handleSubmitForSelected = async () => {
    if (!selectedClassEntry || !currentClass) return;
    const classId = currentClass._id;
    const selectedSet = selectedStudentsMap[classId] ? Array.from(selectedStudentsMap[classId]) : [];
    if (selectedSet.length === 0) {
      alert('No students selected for bulk submission.');
      return;
    }

    setIsSubmitting(true);
    try {
      const courseId = currentClass.course;
      const category = currentClass.courseCategory || "Music";
      const endpoint = getSubmitEndpoint(category, currentClass.feedbackModelRequired);
      const fields = CATEGORY_FIELDS[category] || CATEGORY_FIELDS["Music"];

      // Build payload template (same for all students)
      const basePayload: any = {
        attendanceStatus,
        courseId,
        classId,
        personalFeedback: String(feedbackData.personalFeedback || "")
      };
      fields.forEach(f => {
        const v = feedbackData[f.key];
        basePayload[f.key] = typeof v === "number" ? v : Number(v) || 5;
      });

      // Send requests sequentially to reuse existing removal logic
      let updated = [...pendingClasses];
      for (const studentId of selectedSet) {
        try {
          const response = await fetch(
            `${endpoint}?studentId=${studentId}&courseId=${courseId}&classId=${classId}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...basePayload, studentId })
            }
          );
          const result = await response.json();
          if (result.success) {
            // Remove student from pending list in updated
            const idx = updated.findIndex(e => e.class._id === classId);
            if (idx !== -1) {
              const entry = updated[idx];
              const remaining = entry.students.filter(s => s._id !== studentId);
              if (remaining.length > 0) {
                updated[idx] = { ...entry, students: remaining, selectedStudentIndex: 0 };
              } else {
                updated.splice(idx, 1);
              }
            }
          } else {
            console.warn(`Bulk submit failed for student ${studentId}:`, result.message || 'unknown');
          }
        } catch (err) {
          console.error('Error bulk submitting for student', studentId, err);
        }
      }

      setPendingClasses(updated);
      // select first available class if any
      setSelectedClassEntry(updated.length > 0 ? updated[0] : null);
      // clear selection for this class
      setSelectedStudentsMap(prev => {
        const copy = { ...prev };
        copy[classId] = new Set<string>();
        return copy;
      });
      const nextCat = updated.length && updated[0].class ? updated[0].class.courseCategory : "Music";
      setFeedbackData(buildDefaults(nextCat));
      setAttendanceStatus('present');
      alert('Bulk feedback submitted for selected students.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectClass = (index: number) => {
    const entry = pendingClasses[index];
    setSelectedClassEntry(entry);
  };

  const handleSelectStudent = (classIndex: number, studentIndex: number) => {
    const updated = [...pendingClasses];
    updated[classIndex] = {
      ...updated[classIndex],
      selectedStudentIndex: studentIndex
    };
    setPendingClasses(updated);
    setSelectedClassEntry(updated[classIndex]);
  };

  const handleSliderChange = (key: string, value: number) => {
    setFeedbackData(prev => ({ ...prev, [key]: value }));
  };

  const handleTextChange = (value: string) => {
    setFeedbackData(prev => ({ ...prev, personalFeedback: value }));
  };

  const formatClassDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  };

  const handleSubmit = async () => {
    if (!selectedClassEntry || !currentStudent) return;

    setIsSubmitting(true);
    const student = currentStudent;
    const classData = currentClass!;

    try {
      const courseId = classData.course;
      const classId = classData._id;
      const studentId = student._id;
      const category = classData.courseCategory || "Music";
      const endpoint = getSubmitEndpoint(category, classData.feedbackModelRequired);

      const fields = CATEGORY_FIELDS[category] || CATEGORY_FIELDS["Music"];
      const payload: any = {
        attendanceStatus,
        studentId,
        courseId,
        classId,
        personalFeedback: String(feedbackData.personalFeedback || ""),
      };
      fields.forEach(f => {
        const v = feedbackData[f.key];
        payload[f.key] = typeof v === "number" ? v : Number(v) || 5;
      });

      const response = await fetch(
        `${endpoint}?studentId=${studentId}&courseId=${courseId}&classId=${classId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.success) {
        // remove this student from the pendingClasses[class]
        let updated = [...pendingClasses];
        const idx = updated.findIndex(e => e.class._id === classId);
        if (idx !== -1) {
          const entry = updated[idx];
          const remaining = entry.students.filter(s => s._id !== studentId);
          if (remaining.length > 0) {
            updated[idx] = { ...entry, students: remaining, selectedStudentIndex: 0 };
          } else {
            updated.splice(idx, 1);
          }
        }
        setPendingClasses(updated);
        setSelectedClassEntry(updated.length > 0 ? updated[Math.min(0, updated.length-1)] : null);
        setAttendanceStatus('present');
        const nextCat = updated.length && updated[0].class ? updated[0].class.courseCategory : "Music";
        setFeedbackData(buildDefaults(nextCat));
        alert('Feedback submitted successfully!');
      } else {
        alert(result.message || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAbsent = async () => {
    if (!selectedClassEntry || !currentStudent) return;

    setIsSubmitting(true);
    const student = currentStudent;
    const classData = currentClass!;

    try {
      const studentId = student._id;
      const classId = classData._id;

      const response = await fetch(
        `/Api/attendance?studentId=${studentId}&classId=${classId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'absent',
            studentId,
            classId
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        let updated = [...pendingClasses];
        const idx = updated.findIndex(e => e.class._id === classId);
        if (idx !== -1) {
          const entry = updated[idx];
          const remaining = entry.students.filter(s => s._id !== studentId);
          if (remaining.length > 0) {
            updated[idx] = { ...entry, students: remaining, selectedStudentIndex: 0 };
          } else {
            updated.splice(idx, 1);
          }
        }
        setPendingClasses(updated);
        setSelectedClassEntry(updated.length > 0 ? updated[Math.min(idx, updated.length-1)] : null);
        setAttendanceStatus('present');
        setShowAbsentConfirm(false);
        const nextCat = updated.length && updated[0].class ? updated[0].class.courseCategory : "Music";
        setFeedbackData(buildDefaults(nextCat));
        alert('Student marked as absent successfully!');
      } else {
        alert(result.message || 'Failed to mark attendance');
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      alert('Failed to mark attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowAbsentConfirm(false);
    }
  };

  // Handle file upload
const handleFileChange = async (classId: string, event: React.ChangeEvent<HTMLInputElement>) => {
  if (!event.target.files || event.target.files.length === 0) {
    return;
  }

  const file = event.target.files[0];
  const maxSize = 800 * 1024 * 1024; // 800MB
  if (file.size > maxSize) {
    toast.error('File size must be less than 800MB');
    return;
  }

  setUploadLoading((prev) => ({ ...prev, [classId]: true }));

  try {
    const presignedUrlResponse = await axios.post('/Api/upload/presigned-url', {
      fileName: file.name,
      fileType: file.type,
      classId: classId,
    });

    const { publicUrl } = presignedUrlResponse.data;

    await axios.put(presignedUrlResponse.data.uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${progress}%`);
        }
      },
    });

    toast.success('Recording uploaded successfully!');

    await axios.post('/Api/classes/update', { classId, recordingUrl: publicUrl });

    toast('Video evaluation and performance video generation have started.');

    axios.post(`/Api/proxy/evaluate-video?item_id=${classId}`)
      .catch((evalError) => console.error(`[${classId}] eval start failed`, evalError.message));
    axios.post(`/Api/proxy/generate-highlights?item_id=${classId}`)
      .catch((highlightError) => console.error(`[${classId}] highlights start failed`, highlightError.message));

  } catch (err) {
    const error = err as AxiosError<{ error: string }>;
    toast.error(error.response?.data?.error || 'Failed to upload recording.');
  } finally {
    setUploadLoading((prev) => ({ ...prev, [classId]: false }));
    const inputRef = fileInputRefs.current[classId];
    if (inputRef) inputRef.value = '';
  }
};

const triggerFileInput = (classId: string) => {
  const inputRef = fileInputRefs.current[classId];
  if (inputRef) inputRef.click();
};

const getButtonText = (classId: string, isUploading: boolean) => {
  if (isUploading) return 'Uploading...';
  return 'Upload Recording';
};
  
  if (error) {
    return (
      <div className='feedback-pending-details-sec'>
        <div className='feed-back-heading'>
          <h2>Feedback Pending</h2>
        </div>
        <div className='alert alert-danger mt-4'>
          Error: {error}
        </div>
      </div>
    );
  }
  
  if (pendingClasses.length === 0) {
    return (
      <div className='feedback-pending-details-sec'>
        <div className='feed-back-heading'>
          <div className="head-com-sec d-flex align-items-center justify-content-between mb-4">
            <div className='left-head'>
              <h2 className='m-0'>Feedback Pending</h2>
            </div>
            <div className='right-form'>
              <Link href="/tutor" className='link-text'>Back to Dashboard</Link>
            </div>
          </div>
        </div>
        <div className='alert alert-success mt-4 text-center'>
          <h4>🎉 All Caught Up!</h4>
          <p>No pending feedbacks at this time. Great job staying on top of your student evaluations!</p>
        </div>
      </div>
    );
  }

  return (
    <div className='feedback-pending-details-sec'>
      <div className='feed-back-heading'>
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-md-3 flex-xl-nowrap flex-wrap">
            <div className='left-head'>
                <h2 className='m-0'>Feedback Pending ({pendingClasses.length} classes)</h2>
            </div>
            <div className='right-form'>
               <Link href="/tutor" className='link-text'>Back to Dashboard</Link>
            </div>
        </div>
        <hr className='hr-light'/>
      </div>
      <div className='feedback-pending-box d-flex flex-wrap'>
        <div className='feedback-left-box'>
          <div className='mb-2 px-2'>
            <input
              type="search"
              className="form-control"
              placeholder="Search students or classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className='feedback-box-scroll'>
            {filteredPendingClasses.map((entry, index) => {
               const visibleStudents = getVisibleStudents(entry);
               return (
              <div 
                key={`${entry.class._id}-${index}`} 
                className={`card-feedback ${selectedClassEntry?.class._id === entry.class._id ? 'active' : ''}`}
                onClick={() => handleSelectClass(index)}
              >
                <div className='feedback-img-text'>
                  <ul className='list-unstyled p-0 m-0 d-flex align-items-center position-relative justify-content-between gap-2'>
                    <li className='d-flex align-items-center gap-2'>
                      <h3 className="m-0">{entry.class.title}</h3>
                    </li>
                    <li className='d-flex align-items-center gap-2'>
                      <span className='pending'>
                        {entry.students.length} {entry.students.length === 1 ? 'student' : 'students'}
                      </span>
                      {selectedClassEntry?.class._id === entry.class._id && visibleStudents.length > 0 && (
                        <>
                          <button
                            className="btn btn-sm btn-outline-primary ms-2"
                            onClick={(e) => { e.stopPropagation(); selectAllVisibleForClass(entry.class._id, visibleStudents); }}
                          >
                            Select all
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary ms-2"
                            onClick={(e) => { e.stopPropagation(); clearAllSelectionsForClass(entry.class._id); }}
                          >
                            Clear all
                          </button>
                        </>
                      )}
                    </li>
                  </ul>
                </div>
                <ul className='chat-list-box list-unstyled p-0 m-0'>
                  {visibleStudents.map((stu, studentIndex) => (
                    <li 
                      key={stu._id} 
                      className={`card-chat ${entry.selectedStudentIndex === studentIndex && selectedClassEntry?.class._id === entry.class._id ? 'active' : ''}`}
                      onClick={(e) => {
                        // clicking list item still selects single student for individual evaluation
                        e.stopPropagation();
                        handleSelectStudent(index, studentIndex);
                      }}
                      title={`${stu.username}`} 
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isStudentSelected(entry.class._id, stu._id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleStudentSelection(entry.class._id, stu._id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-muted small ms-2">{formatClassDate(entry.class.startTime)}</span>
                          <span className="text-end ms-2">{stu.username}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              );
            })}
          </div>
        </div>

        {selectedClassEntry && currentStudent && currentClass && (
          <div className='feedback-right-box'>
            <div className='feedback-box'>
              <div className='head-feedback d-flex align-items-center gap-2 justify-content-between flex-md-nowrap flex-wrap'>
  <div className='text-head-feedback'>
    <h2>Student Performance Evaluation</h2>
    <p>
      {currentClass.title}
      <span className="ms-2 badge bg-secondary">{currentCategory}</span>
      <span className="text-muted small ms-2">{formatClassDate(currentClass.startTime)}</span>
    </p>
  </div>
  <div className='btn-right d-flex gap-2 align-items-center flex-wrap'>
    <div className="dropdown">
      <button
        className="btn dropdown-toggle"
        type="button"
        id="attendanceDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{
          backgroundColor: attendanceStatus === 'present' ? '#10b981' : '#ef4444',
          color: '#ffffff',
          border: 'none',
          minWidth: '120px'
        }}
      >
        {attendanceStatus === 'present' ? '✓ Present' : '✗ Absent'}
      </button>
      <ul className="dropdown-menu" aria-labelledby="attendanceDropdown">
        <li>
          <a 
            className="dropdown-item" 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setAttendanceStatus('present');
              setShowAbsentConfirm(false);
            }}
          >
            ✓ Present
          </a>
        </li>
        <li>
          <a 
            className="dropdown-item" 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowAbsentConfirm(true);
            }}
          >
            ✗ Absent
          </a>
        </li>
      </ul>
    </div>

    <input
      type="file"
      accept="video/*"
      className="d-none"
      ref={el => { 
        if (currentClass) {
          fileInputRefs.current[currentClass._id] = el; 
        }
      }}
      onChange={(e) => {
        if (currentClass) {
          handleFileChange(currentClass._id, e);
        }
      }}
    />
    
    <button 
      onClick={() => {
        if (currentClass) {
          triggerFileInput(currentClass._id);
        }
      }}
      disabled={currentClass ? uploadLoading[currentClass._id] : false}
      style={{ 
        backgroundColor: currentClass && uploadLoading[currentClass._id] ? '#a855f7' : '#9333ea',
        color: '#ffffff',
        border: 'none',
        boxShadow: currentClass && !uploadLoading[currentClass._id] 
          ? '0 0 12px rgba(147, 51, 234, 0.4)' 
          : 'none',
        transition: 'all 0.3s ease'
      }}
      className='btn-link d-flex align-items-center gap-2 justify-content-center px-3 py-2 rounded'
    >
      <Upload size={16} />
      <span>
        {currentClass && getButtonText(
          currentClass._id,
          uploadLoading[currentClass._id] || false
        )}
      </span>
    </button>
  </div>
</div>

              <div className='bottom-feedback-box row'>
                <div className='col-xxl-6 mb-0'>
                  <div className='progressbar-line-sec'>
                    {currentFields.slice(0, splitIndex).map(field => (
                      <div className="card-box mb-3" key={field.key}>
                        <div className="d-flex align-items-center gap-2 justify-content-between mb-2">
                          <h6 className="mb-0">{field.label}</h6>
                          <div className="right-text-box red-text">
                            <span className='main-text'>{Number(feedbackData[field.key] ?? 5)}</span>
                            <span className="text-muted">/10</span>
                          </div>
                        </div>
                        <div className="progress-slider-container">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={Number(feedbackData[field.key] ?? 5)}
                            onChange={(e) => handleSliderChange(field.key, parseInt(e.target.value))}
                            className="form-range mb-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='col-xxl-6 mb-4'>
                  <div className='progressbar-line-sec'>
                    {currentFields.slice(splitIndex).map(field => (
                      <div className="card-box mb-3" key={field.key}>
                        <div className="d-flex align-items-center gap-2 justify-content-between mb-2">
                          <h6 className="mb-0">{field.label}</h6>
                          <div className="right-text-box red-text">
                            <span className='main-text'>{Number(feedbackData[field.key] ?? 5)}</span>
                            <span className="text-muted">/10</span>
                          </div>
                        </div>
                        <div className="progress-slider-container">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={Number(feedbackData[field.key] ?? 5)}
                            onChange={(e) => handleSliderChange(field.key, parseInt(e.target.value))}
                            className="form-range mb-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='bottom-recording-box'>
                  <p><strong>Personal Feedback & Area for Improvement</strong></p>
                  <Form>
                    <Form.Group className="mb-3" controlId="feedbackTextarea">
                      <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder='Provide detailed feedback and suggestions for improvement...'
                        value={String(feedbackData.personalFeedback || "")}
                        onChange={(e) => handleTextChange(e.target.value)}
                      />
                    </Form.Group>
                  </Form>

                  <div className='d-flex align-items-end justify-content-end mt-4 gap-2'>
                    {attendanceStatus === 'present' ? (
                      <>
                        <Button 
                          type='button' 
                          className='btn btn-primary'
                          onClick={() => {
                            if (currentClass && selectedStudentsMap[currentClass._id] && selectedStudentsMap[currentClass._id].size > 0) {
                              handleSubmitForSelected();
                            } else {
                              handleSubmit();
                            }
                          }}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Submitting...
                            </>
                          ) : (
                            'Submit Evaluation'
                          )}
                        </Button>

                        {/* Bulk submit button (enabled when any selected in this class) */}
                        <Button
                          type='button'
                          className='btn btn-success'
                          onClick={handleSubmitForSelected}
                          disabled={isSubmitting || !(selectedStudentsMap[currentClass._id] && selectedStudentsMap[currentClass._id].size > 0)}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Submitting...
                            </>
                          ) : (
                            'Submit for Selected'
                          )}
                        </Button>

                        <Button
                          type='button'
                          variant='outline-secondary'
                          className='btn'
                          onClick={() => clearAllSelectionsForClass(currentClass._id)}
                        >
                          Clear All
                        </Button>
                      </>
                    ) : (
                      <Button 
                        type='button' 
                        className='btn btn-danger'
                        onClick={handleMarkAbsent}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Marking Absent...
                          </>
                        ) : (
                          'Confirm & Mark Absent'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

{showAbsentConfirm && (
  <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Mark as Absent</h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowAbsentConfirm(false)}
          ></button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to mark <strong>{currentStudent?.username}</strong> as absent for <strong>{currentClass?.title}</strong>?</p>
          <p className="text-muted small">This will skip the evaluation form and only record the absence.</p>
        </div>
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => {
              setShowAbsentConfirm(false);
              setAttendanceStatus('present');
            }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-danger" 
            onClick={() => {
              setAttendanceStatus('absent');
              setShowAbsentConfirm(false);
              handleMarkAbsent();
            }}
          >
            Yes, Mark Absent
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default FeedbackPendingDetails;