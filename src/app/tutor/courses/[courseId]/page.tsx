'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function CourseDetailsPage() {
  const params = useParams();
  const [courseData, setCourseData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Extract courseId from params
    const courseId = params.courseId;

    async function fetchCourseDetails() {
      try {
        const response = await fetch(`/Api/tutors/courses/${courseId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch course details');
        }
        
        const data = await response.json();
        console.log('Full Response:', data);
        
        setCourseData(data);
      } catch (err:any) {
        console.error('Error fetching course details:', err);
        setError(err.message);
      }
    }

    // Only fetch if courseId exists
    if (courseId) {
      fetchCourseDetails();
    }
  }, [params.courseId]);

  if (error) return <div>Error: {error}</div>;
  if (!courseData) return <div>Loading...</div>;

  return (
    <div>
      <h1>Course Details</h1>
      <pre>{JSON.stringify(courseData, null, 2)}</pre>
    </div>
  );
}