"use client"

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Calendar,
  Music,
  BookOpen,
  Users,
  UserCheck,
  ArrowLeft
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface Course {
  _id: string;
  title: string;
  category?: string;
}
interface Student {
  _id: string;
  username: string;
  email: string;
}
interface Class {
  _id: string;
  title: string;
  description?: string;
}
interface Song {
  _id: string;
  title: string;
  artist?: string;
  genre?: string;
  difficulty?: string;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const classId = searchParams.get("classId") || "";

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    deadline: "",
    description: "",
    songName: "",
    customSongName: "",
    course: courseId,
    class: classId,
    speed: "100%",
    metronome: "100%",
    loop: "Set A",
  });
  const [musicSheet, setMusicSheet] = useState<File | null>(null);
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [practiceStudio, setPracticeStudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown data
  const [coursesOptions, setCoursesOptions] = useState<Course[]>([]);
  const [classesOptions, setClassesOptions] = useState<Class[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Song search
  const [songSearchResults, setSongSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSongResults, setShowSongResults] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const songInputRef = useRef<HTMLDivElement>(null);

  // Students
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch courses and classes
  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (formData.course) {
      fetchClassesAndStudents(formData.course);
    } else {
      setClassesOptions([]);
      setStudents([]);
      setSelectedStudents([]);
      setFormData((prev) => ({ ...prev, class: "" }));
    }
  }, [formData.course]);

  // Pre-select course and class from URL
  useEffect(() => {
    if (courseId) setFormData((prev) => ({ ...prev, course: courseId }));
    if (classId) setFormData((prev) => ({ ...prev, class: classId }));
  }, [courseId, classId]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await fetch("/Api/tutors/courses");
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCoursesOptions(data.course || data.result || []);
    } catch (err) {
      setCoursesOptions([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchClassesAndStudents = async (courseId: string) => {
    try {
      setLoadingClasses(true);
      setLoadingStudents(true);
      const res = await fetch(`/Api/tutors/courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch classes and students");
      const data = await res.json();
      setClassesOptions(data.classDetails || data.classes || []);
      setStudents(data.enrolledStudents || []);
      // Select all students by default
      const allStudentIds = (data.enrolledStudents || []).map(
        (student: Student) => student._id
      );
      setSelectedStudents(allStudentIds);
    } catch (err) {
      setClassesOptions([]);
      setStudents([]);
      setSelectedStudents([]);
    } finally {
      setLoadingClasses(false);
      setLoadingStudents(false);
    }
  };

  // Student selection handlers
  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };
  const handleSelectAllStudents = () => {
    const allStudentIds = students.map((student) => student._id);
    setSelectedStudents(allStudentIds);
  };
  const handleClearAllStudents = () => setSelectedStudents([]);

  // Song search debounce
  useEffect(() => {
    const searchTerm = formData.songName.trim();
    if (searchTerm.length > 2 && !selectedSong) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      setIsSearching(true);
      setShowSongResults(true);
      searchTimeoutRef.current = setTimeout(() => searchSongs(searchTerm), 600);
    } else {
      setSongSearchResults([]);
      setShowSongResults(false);
      setIsSearching(false);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        setIsSearching(false);
      }
    };
  }, [formData.songName, selectedSong]);

  // Click outside to close song dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        songInputRef.current &&
        !songInputRef.current.contains(event.target as Node)
      ) {
        setShowSongResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchSongs = async (searchTerm: string) => {
    try {
      setIsSearching(true);
      const res = await fetch(
        `/Api/searchSong?q=${encodeURIComponent(searchTerm)}`
      );
      if (!res.ok) throw new Error("Failed to search songs");
      const data = await res.json();
      setSongSearchResults(data.songs || []);
      setShowSongResults(true);
    } catch (err) {
      setSongSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setFormData({
      ...formData,
      songName: `${song.title} - ${song.artist}`,
      customSongName: "",
    });
    setShowSongResults(false);
    setSongSearchResults([]);
  };

  const clearSongSelection = () => {
    setSelectedSong(null);
    setFormData({ ...formData, songName: "", customSongName: "" });
    setSongSearchResults([]);
    setShowSongResults(false);
  };

  const handleMusicSheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setMusicSheet(e.target.files[0]);
  };

  const handleAssignmentFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0])
      setAssignmentFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim())
      return setError("Please enter an assignment title");
    if (!formData.course) return setError("Please select a course");
    if (!formData.class) return setError("Please select a class");
    if (!formData.deadline) return setError("Please select a deadline");
    if (!formData.description.trim())
      return setError("Please enter a description");
    if (selectedStudents.length === 0)
      return setError("Please select at least one student");

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("deadline", new Date(formData.deadline).toISOString());
      submitData.append("courseId", formData.course);
      submitData.append("classId", formData.class);
      submitData.append("studentIds", JSON.stringify(selectedStudents));

      const finalSongName = selectedSong
        ? `${selectedSong.title} - ${selectedSong.artist}`
        : formData.customSongName || formData.songName;
      if (finalSongName) submitData.append("songName", finalSongName);

      submitData.append("practiceStudio", practiceStudio ? "true" : "false");
      submitData.append("speed", formData.speed);
      submitData.append("metronome", formData.metronome);
      submitData.append("loop", formData.loop);

      if (musicSheet) submitData.append("musicSheet", musicSheet);
      if (assignmentFile) submitData.append("assignmentFile", assignmentFile);

      const url = `/Api/assignment?classId=${formData.class}&courseId=${formData.course}`;
      const res = await fetch(url, {
        method: "POST",
        body: submitData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.message || "Failed to create assignment"
        );
      }

      const result = await res.json();

      if (result.success) {
        const assignmentId = result?.data?._id;
        setFormData({
          title: "",
          deadline: "",
          description: "",
          songName: "",
          customSongName: "",
          course: courseId,
          class: classId,
          speed: "100%",
          metronome: "100%",
          loop: "Set A",
        });
        setMusicSheet(null);
        setAssignmentFile(null);
        setPracticeStudio(false);
        setSelectedSong(null);
        router.push(
          `/tutor/assignments/singleAssignment?assignmentId=${assignmentId}`
        );
        return;
      } else {
        throw new Error(
          result.message || "Failed to create assignment"
        );
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen px-4 py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-purple-600 transition-colors duration-200 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-purple-600 mb-2">
          Create New Assignment
        </h1>
        <p className="text-gray-500 mb-8">
          Fill in the details below to create a new assignment for your students
        </p>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assignment Title *
            </label>
            <input
              type="text"
              placeholder="e.g., Midterm Project"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              disabled={isSubmitting}
            />
          </div>

          {/* Course & Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <BookOpen size={16} className="text-purple-600" /> Select
                Course *
              </label>
              <select
                value={formData.course}
                onChange={(e) =>
                  setFormData({ ...formData, course: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                disabled={true} // Always disabled, value from URL
              >
                <option value="">
                  {loadingCourses ? "Loading courses..." : "Choose a course"}
                </option>
                {coursesOptions.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Users size={16} className="text-purple-600" /> Select Class *
              </label>
              <select
                value={formData.class}
                onChange={(e) =>
                  setFormData({ ...formData, class: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                disabled={true} // Always disabled, value from URL
              >
                <option value="">
                  {loadingClasses ? "Loading classes..." : "Choose a class"}
                </option>
                {classesOptions.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Students Selection */}
          {formData.course && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <UserCheck size={16} className="text-purple-600" /> Select
                Students *
              </label>
              {loadingStudents ? (
                <div className="p-4 text-center border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-500">Loading students...</p>
                </div>
              ) : students.length > 0 ? (
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex gap-2 mb-3 pb-3 border-b border-gray-200">
                    <button
                      type="button"
                      onClick={handleSelectAllStudents}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all font-medium disabled:opacity-50"
                    >
                      Select All ({students.length})
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllStudents}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-all font-medium disabled:opacity-50"
                    >
                      Clear All
                    </button>
                    <div className="ml-auto text-sm text-gray-600 flex items-center">
                      Selected:{" "}
                      <span className="font-semibold ml-1">
                        {selectedStudents.length}
                      </span>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {students.map((student) => (
                      <label
                        key={student._id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleStudentToggle(student._id)}
                          disabled={isSubmitting}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {student.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.email}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-500">
                    No students enrolled in this course
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Deadline */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-purple-600" /> Deadline *
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assignment Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Song Search */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" ref={songInputRef}>
            <div className="relative">
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Music size={16} className="text-purple-600" /> Search Song
              </label>
              <input
                type="text"
                value={formData.songName}
                onChange={(e) =>
                  setFormData({ ...formData, songName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="Type song name or artist"
                disabled={isSubmitting}
              />
              {formData.songName && (
                <button
                  type="button"
                  onClick={clearSongSelection}
                  className="absolute right-2 top-10 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
              {showSongResults && !selectedSong && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <div
                        className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-purple-500 border-r-transparent align-[-0.125em]"
                        role="status"
                      >
                        <span className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]">
                          Loading...
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Searching songs...
                      </p>
                    </div>
                  ) : songSearchResults.length > 0 ? (
                    songSearchResults.map((song) => (
                      <button
                        key={song._id}
                        type="button"
                        onClick={() => handleSongSelect(song)}
                        className="w-full px-4 py-2 text-left hover:bg-purple-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-800">
                          {song.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {song.artist} | {song.genre}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Custom song */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Or Enter Custom Song Name
              </label>
              <input
                type="text"
                value={formData.customSongName}
                onChange={(e) =>
                  setFormData({ ...formData, customSongName: e.target.value })
                }
                placeholder="Custom song"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                disabled={isSubmitting || !!selectedSong}
              />
            </div>
          </div>

          {/* Practice Studio, Speed, Metronome, Loop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Practice Studio Toggle */}
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={practiceStudio}
                onChange={() => setPracticeStudio(!practiceStudio)}
                disabled={isSubmitting}
                id="practiceStudio"
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <label
                htmlFor="practiceStudio"
                className="text-sm font-medium text-gray-700"
              >
                Add to Practice Studio
              </label>
            </div>
            {/* Speed */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Speed
              </label>
              <select
                value={formData.speed}
                onChange={(e) =>
                  setFormData({ ...formData, speed: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                disabled={isSubmitting}
              >
                <option value="25%">25%</option>
                <option value="50%">50%</option>
                <option value="75%">75%</option>
                <option value="100%">100%</option>
              </select>
            </div>
            {/* Metronome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Metronome
              </label>
              <select
                value={formData.metronome}
                onChange={(e) =>
                  setFormData({ ...formData, metronome: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                disabled={isSubmitting}
              >
                <option value="25%">25%</option>
                <option value="50%">50%</option>
                <option value="75%">75%</option>
                <option value="100%">100%</option>
              </select>
            </div>
            {/* Loop */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loop
              </label>
              <select
                value={formData.loop}
                onChange={(e) =>
                  setFormData({ ...formData, loop: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                disabled={isSubmitting}
              >
                <option value="Set A">Set A</option>
                <option value="Set B">Set B</option>
                <option value="Set C">Set C</option>
                <option value="Full">Full</option>
              </select>
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assignment File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Upload size={16} className="text-purple-600" /> Assignment
                File
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-400 transition-all bg-gray-50">
                <input
                  type="file"
                  onChange={handleAssignmentFileChange}
                  disabled={isSubmitting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="assignmentFileInput"
                />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    {assignmentFile
                      ? assignmentFile.name
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    All file types accepted
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}