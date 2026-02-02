'use client';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import VideoPoster from '../../assets/video-poster.png';
import SemiCircleProgress from './tutor/SemiCircleProgress';
import ScoreCard from '../student/ScoreCard';

// import { ProfileImage } from './ProfileImage';
// import { DetailsCard } from './DetailsCard';
// import { ExpandableCourseList } from './ExpandableCourseList';
// import { CourseEnrolledItem } from './CourseEnrolledItem';
// import { getQualityText } from '../utils/quality.utils';
import './MyStudentList.css';
import { StudentProfileDetailsProps } from '@/types/student.types';
import { useStudentMetrics } from '@/hooks/useStudentMetrics';
import { ProfileImage } from '@/components/ProfileImage';
import { ExpandableCourseList } from '@/components/ExpandableCourseList';
import { DetailsCard } from '@/components/DetailsCard';
import { CourseEnrolledItem } from '@/components/CourseEnrolledItem';
import { getQualityText } from '@/utils/quality.utils';

const StudentProfileDetails: React.FC<StudentProfileDetailsProps> = ({
  data,
  assignmentCount = 0,
  pendingAssignmentCount = 0
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    totalCourseFee,
    overallPerformanceScore,
    classQualityScore,
    pendingAssignmentScore,
  } = useStudentMetrics(data, pendingAssignmentCount);

  const personalDetailsItems = [
    // { label: 'Email', value: data.email },
    // { label: 'Contact', value: data.contact },
    { label: 'Age', value: data.age },
    // { label: 'City', value: data.city },
    {
      label: 'Category',
      value: data.courses.length > 0 ? data.courses[0].category : 'N/A'
    },
  ];

  const feeStatusItems = [
    {
      label: 'Course',
      value: <ExpandableCourseList courses={data.courses} maxItems={1} />
    },
    { label: 'Course Fee', value: `Rs. ${totalCourseFee.toLocaleString()}` },
    { label: 'Amount Paid', value: 'NA' },
    { label: 'Status', value: 'Not Paid', className: 'red-text' },
    { label: 'Paid Via', value: 'NA' },
  ];

  return (
    <div className="student-profile-details-sec">
      <div className="row">
        <div className="col-xl-9 col-md-12 mb-4">
          <div className="row">
            {/* Profile Section */}
            <div className="col-lg-3 mb-4">
              <div className="profile-box card-box text-center">
                <div className="img-profile">
                  <ProfileImage
                    username={data.username}
                    profileImage={data.profileImage}
                  />
                </div>
                <div className="text-profile">
                  <h2>{data.username}</h2>
                  <p className="m-0 p-0">{data.city}</p>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <DetailsCard title="Personal Details" items={personalDetailsItems} />

            {/* Fee Status */}
            <DetailsCard
              title="Fee Status"
              items={feeStatusItems}
              className="col-xxl col-lg-12"
            />

            {/* Courses Enrolled */}
            <div className="col-md-12">
              <div className="courses-enrolled-sec card-box">
                <div className="head-height">
                  <h3>Courses Enrolled</h3>
                </div>
                <div className="row">
                  <div className="col-xl-9">
                    {data.courses.map((course) => (
                      <CourseEnrolledItem
                        key={course._id}
                        course={course}
                        studentId={data.studentId}
                        tutorId={data.courses[0]?.instructorId}
                      />
                    ))}
                  </div>

                  {/* Video Section */}
                  <div className="col-xl-3">
                    <div className="card-enrolled-video text-center">
                      <h6 className="mb-4">Latest Class Highlight</h6>
                      <div className="video-box">
                        <div className="poster-video position-relative text-center">
                          {!isPlaying ? (
                            <div className="poster-wrapper position-relative">
                              <Image
                                src={VideoPoster}
                                alt="Video Poster"
                                className="img-fluid rounded shadow"
                              />
                              <Button
                                variant="light"
                                className="play-btn position-absolute top-50 start-50 text-black translate-middle rounded-circle p-3 shadow"
                                onClick={() => setIsPlaying(true)}
                              >
                                ▶
                              </Button>
                            </div>
                          ) : (
                            <video
                              className="w-100 rounded shadow"
                              controls
                              autoPlay
                              poster={VideoPoster.src}
                            >
                              <source
                                src="https://www.w3schools.com/html/mov_bbb.mp4"
                                type="video/mp4"
                              />
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      </div>

                      <div className="right-assignment my-course-student-right mt-xxl-0 mt-3">
                        <div className="student-assignment my-course-student d-flex align-items-center flex-wrap gap-xl-4 gap-2">
                          <ul className="d-flex align-items-center w-full-width gap-2 justify-content-center m-auto mt-3 list-unstyled flex-wrap m-0 p-0">
                            <li>
                              <Link
                                href="/tutor/performanceVideo/"
                                className="btn btn-border padding-fixed d-flex align-items-center justify-content-center gap-2"
                              >
                                <span>View More</span>
                                <svg width="23" height="24" viewBox="0 0 23 24" fill="none">
                                  <path d="M7.25551 16.2428C7.13049 16.1178 7.06025 15.9482 7.06025 15.7714C7.06025 15.5946 7.13049 15.425 7.25551 15.3L13.66 8.89551L8.66973 8.89645C8.58207 8.89645 8.49527 8.87918 8.41428 8.84564C8.33329 8.81209 8.25971 8.76292 8.19773 8.70094C8.13574 8.63896 8.08657 8.56537 8.05303 8.48439C8.01948 8.4034 8.00222 8.3166 8.00222 8.22894C8.00222 8.14128 8.01948 8.05448 8.05303 7.9735C8.08657 7.89251 8.13574 7.81892 8.19773 7.75694C8.25971 7.69496 8.33329 7.64579 8.41428 7.61224C8.49527 7.5787 8.58207 7.56143 8.66973 7.56143H15.2694C15.3571 7.56132 15.4439 7.57851 15.525 7.61202C15.606 7.64552 15.6796 7.69469 15.7416 7.75669C15.8036 7.8187 15.8528 7.89233 15.8863 7.97337C15.9198 8.0544 15.937 8.14125 15.9369 8.22894L15.9369 14.8286C15.9369 14.9163 15.9196 15.0031 15.8861 15.084C15.8525 15.165 15.8034 15.2386 15.7414 15.3006C15.6794 15.3626 15.6058 15.4118 15.5248 15.4453C15.4438 15.4788 15.357 15.4961 15.2694 15.4961C15.1817 15.4961 15.0949 15.4788 15.0139 15.4453C14.933 15.4118 14.8594 15.3626 14.7974 15.3006C14.7354 15.2386 14.6862 15.165 14.6527 15.084C14.6191 15.0031 14.6019 14.9163 14.6019 14.8286L14.6028 9.83831L8.19832 16.2428C8.0733 16.3678 7.90373 16.4381 7.72692 16.4381C7.55011 16.4381 7.38054 16.3678 7.25551 16.2428Z" fill="#6E09BD" />
                                </svg>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-12">
          <div className="student-profile-right-box">
            <div className="card-box mb-4">
              <div className="top-progress helf-semicir-sec mb-0">
                <SemiCircleProgress
                  value={overallPerformanceScore}
                  label="Overall Course Performance"
                />
              </div>
            </div>
            <div className="card-box">
              <div className="card-pro">
                <ScoreCard
                  title="Class Quality Score"
                  score={classQualityScore}
                  text={getQualityText(classQualityScore)}
                  image={data.profileImage}
                  data={data}
                  link={
                    data.courses.length > 0
                      ? `/tutor/courseQuality?courseId=${data.courses[0]._id}`
                      : ''
                  }
                />
                <ScoreCard
                  title="Assignments"
                  score={pendingAssignmentScore}
                  text="Pending"
                  image={data.profileImage}
                  data={data}
                  link=""
                  showOutOfTen={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileDetails;