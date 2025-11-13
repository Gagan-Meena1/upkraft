"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import StudentTutorChart from "../components/academy/StudentTutorChart";
import PerformingTutors from "../components/academy/PerformingTutors";

type RangeOption = "thisMonth" | "lastMonth";

const Dashboard = () => {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("thisMonth");
  const [activeTutorsCount, setActiveTutorsCount] = useState<number | null>(null);
  const [newTutorsThisMonth, setNewTutorsThisMonth] = useState<number | null>(null);
  const [newTutorsLastMonth, setNewTutorsLastMonth] = useState<number | null>(null);
  const [tutorStatsError, setTutorStatsError] = useState<string | null>(null);
  const [isTutorStatsLoading, setIsTutorStatsLoading] = useState<boolean>(false);
  const [activeTutorsLastMonthCount, setActiveTutorsLastMonthCount] = useState<number | null>(null);

  const [totalStudentsCount, setTotalStudentsCount] = useState<number | null>(null);
  const [totalStudentsLastMonthCount, setTotalStudentsLastMonthCount] = useState<number | null>(null);
  const [studentsPercentageChange, setStudentsPercentageChange] = useState<Record<RangeOption, number | null>>({
    thisMonth: null,
    lastMonth: null,
  });
  const [studentsNewCounts, setStudentsNewCounts] = useState<Record<RangeOption, number | null>>({
    thisMonth: null,
    lastMonth: null,
  });
  const [studentsStatsError, setStudentsStatsError] = useState<string | null>(null);
  const [isStudentsStatsLoading, setIsStudentsStatsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTutorStats = async () => {
      setIsTutorStatsLoading(true);
      setTutorStatsError(null);

      try {
        const response = await fetch("/Api/academy/tutors", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch active tutors");
        }

        const data = await response.json();
        const tutors = Array.isArray(data?.tutors) ? data.tutors : [];

        const totalTutors =
          typeof data?.total === "number" ? data.total : tutors.length;

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const tutorsJoinedThisMonth = tutors.filter((tutor: any) => {
          if (!tutor?.createdAt) return false;
          const createdAt = new Date(tutor.createdAt);
          return createdAt >= thisMonthStart;
        }).length;

        const tutorsJoinedLastMonth = tutors.filter((tutor: any) => {
          if (!tutor?.createdAt) return false;
          const createdAt = new Date(tutor.createdAt);
          return createdAt >= lastMonthStart && createdAt < thisMonthStart;
        }).length;

        const totalTutorsLastMonth = tutors.filter((tutor: any) => {
          if (!tutor?.createdAt) return true;
          const createdAt = new Date(tutor.createdAt);
          return createdAt < thisMonthStart;
        }).length;

        setActiveTutorsCount(totalTutors);
        setActiveTutorsLastMonthCount(totalTutorsLastMonth);
        setNewTutorsThisMonth(tutorsJoinedThisMonth);
        setNewTutorsLastMonth(tutorsJoinedLastMonth);
      } catch (error: any) {
        console.error("Error while fetching active tutors:", error);
        setTutorStatsError(
          error?.message || "Something went wrong while fetching tutor stats."
        );
        setActiveTutorsCount(null);
        setNewTutorsThisMonth(null);
      } finally {
        setIsTutorStatsLoading(false);
      }
    };

    fetchTutorStats();
  }, []);

  useEffect(() => {
    const fetchStudentStats = async () => {
      setIsStudentsStatsLoading(true);
      setStudentsStatsError(null);

      try {
        // Fetch total count first
        const countResponse = await fetch("/Api/academy/students?page=1&limit=1", {
          method: "GET",
          credentials: "include",
        });

        if (!countResponse.ok) {
          throw new Error("Failed to fetch students count");
        }

        const countData = await countResponse.json();
        const totalCount = countData?.pagination?.totalStudents || 0;
        setTotalStudentsCount(totalCount);

        // Fetch all students to calculate percentage change
        // Using a high limit to get all students for calculation
        const allStudentsResponse = await fetch("/Api/academy/students?page=1&limit=10000", {
          method: "GET",
          credentials: "include",
        });

        if (!allStudentsResponse.ok) {
          // If we can't fetch all students, just use the count
          setStudentsStatsError("Unable to load detailed student stats");
          setStudentsPercentageChange({
            thisMonth: null,
            lastMonth: null,
          });
          setStudentsNewCounts({
            thisMonth: null,
            lastMonth: null,
          });
          setTotalStudentsLastMonthCount(null);
          return;
        }

        const allStudentsData = await allStudentsResponse.json();
        const students = Array.isArray(allStudentsData?.students) ? allStudentsData.students : [];

        // Calculate students created this month and last month
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const monthBeforeLastStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);

        // Count students created this month
        const studentsThisMonth = students.filter((student: any) => {
          if (!student?.createdAt) return false;
          const createdAt = new Date(student.createdAt);
          return createdAt >= thisMonthStart;
        }).length;

        // Count students created last month
        const studentsLastMonth = students.filter((student: any) => {
          if (!student?.createdAt) return false;
          const createdAt = new Date(student.createdAt);
          return createdAt >= lastMonthStart && createdAt < thisMonthStart;
        }).length;

        // Count students created in month before last
        const studentsMonthBeforeLast = students.filter((student: any) => {
          if (!student?.createdAt) return false;
          const createdAt = new Date(student.createdAt);
          return createdAt >= monthBeforeLastStart && createdAt < lastMonthStart;
        }).length;

        const totalStudentsLastMonth = students.filter((student: any) => {
          if (!student?.createdAt) return true;
          const createdAt = new Date(student.createdAt);
          return createdAt < thisMonthStart;
        }).length;

        let thisMonthPercentage: number | null = null;
        if (studentsLastMonth > 0) {
          thisMonthPercentage = ((studentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100;
        } else if (studentsThisMonth > 0) {
          thisMonthPercentage = 100;
        }

        let lastMonthPercentage: number | null = null;
        if (studentsMonthBeforeLast > 0) {
          lastMonthPercentage = ((studentsLastMonth - studentsMonthBeforeLast) / studentsMonthBeforeLast) * 100;
        } else if (studentsLastMonth > 0) {
          lastMonthPercentage = 100;
        }

        setStudentsNewCounts({
          thisMonth: studentsThisMonth,
          lastMonth: studentsLastMonth,
        });
        setTotalStudentsLastMonthCount(totalStudentsLastMonth);
        setStudentsPercentageChange({
          thisMonth: thisMonthPercentage,
          lastMonth: lastMonthPercentage,
        });
        
      } catch (error: any) {
        console.error("Error while fetching student stats:", error);
        setStudentsStatsError(
          error?.message || "Something went wrong while fetching student stats."
        );
        setTotalStudentsCount(null);
        setTotalStudentsLastMonthCount(null);
        setStudentsPercentageChange({
          thisMonth: null,
          lastMonth: null,
        });
        setStudentsNewCounts({
          thisMonth: null,
          lastMonth: null,
        });
      } finally {
        setIsStudentsStatsLoading(false);
      }
    };

    fetchStudentStats();
  }, []);

  const displayedActiveTutors =
    selectedRange === "thisMonth" || activeTutorsLastMonthCount === null
      ? activeTutorsCount
      : activeTutorsLastMonthCount;
  const tutorNewCount =
    selectedRange === "thisMonth" ? newTutorsThisMonth : newTutorsLastMonth;

  const displayedStudentsTotal =
    selectedRange === "thisMonth" || totalStudentsLastMonthCount === null
      ? totalStudentsCount
      : totalStudentsLastMonthCount;
  const studentsPercentage = studentsPercentageChange[selectedRange];
  const studentsNewCount = studentsNewCounts[selectedRange];
  const rangeLabel = selectedRange === "thisMonth" ? "this month" : "last month";

  return (
    <div className="dashboard">
      <div className="dashboard-sec container-fluid">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head">
            <h2 className="m-0">Academy Dashboard</h2>
          </div>
        </div>
        <div className="listing-time-box">
          <ul className="d-flex flex-md-nowrap flex-wrap align-items-center gap-2 list-unstyled p-0 m-0">
            <li>
              <button
                type="button"
                className={`btn btn-white ${selectedRange === "thisMonth" ? "btn-active" : ""}`}
                onClick={() => setSelectedRange("thisMonth")}
              >
                This Month
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`btn btn-white ${selectedRange === "lastMonth" ? "btn-active" : ""}`}
                onClick={() => setSelectedRange("lastMonth")}
              >
                Last Month
              </button>
            </li>
            <li>
              <button type="button" className="btn btn-white" disabled>
                Last 3 Months
              </button>
            </li>
            <li>
              <button type="button" className="btn btn-white" disabled>
                Custom Range
              </button>
            </li>
          </ul>
        </div>
        
        <div className='card-academy-box mt-4'>
            <div className='row'>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block'>
                        <div className="icons">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.2372 5.28849L12.2372 2.28849C12.0832 2.23717 11.9168 2.23717 11.7628 2.28849L2.76281 5.28849C2.61347 5.33828 2.48358 5.43379 2.39155 5.5615C2.29951 5.68921 2.24999 5.84264 2.25 6.00006V13.5001C2.25 13.699 2.32902 13.8897 2.46967 14.0304C2.61032 14.171 2.80109 14.2501 3 14.2501C3.19891 14.2501 3.38968 14.171 3.53033 14.0304C3.67098 13.8897 3.75 13.699 3.75 13.5001V7.04068L6.89906 8.08974C6.0624 9.44143 5.79634 11.0699 6.15931 12.6176C6.52229 14.1653 7.48462 15.5057 8.835 16.3444C7.1475 17.0063 5.68875 18.2035 4.62187 19.8404C4.56639 19.9228 4.52785 20.0155 4.50849 20.113C4.48914 20.2105 4.48936 20.3109 4.50913 20.4083C4.52891 20.5057 4.56785 20.5982 4.62369 20.6804C4.67953 20.7626 4.75116 20.8329 4.83441 20.8872C4.91766 20.9415 5.01087 20.9787 5.10863 20.9967C5.20639 21.0147 5.30674 21.013 5.40386 20.9918C5.50097 20.9707 5.59291 20.9304 5.67433 20.8734C5.75575 20.8164 5.82502 20.7438 5.87813 20.6597C7.29094 18.4922 9.52219 17.2501 12 17.2501C14.4778 17.2501 16.7091 18.4922 18.1219 20.6597C18.2319 20.8232 18.4018 20.9369 18.5949 20.9761C18.788 21.0153 18.9888 20.9769 19.1539 20.8693C19.3189 20.7616 19.435 20.5933 19.4769 20.4008C19.5189 20.2083 19.4834 20.0069 19.3781 19.8404C18.3112 18.2035 16.8469 17.0063 15.165 16.3444C16.5141 15.5057 17.4755 14.1662 17.8384 12.6196C18.2013 11.0731 17.9361 9.44573 17.1009 8.09443L21.2372 6.71631C21.3866 6.66655 21.5165 6.57105 21.6086 6.44334C21.7006 6.31563 21.7502 6.16218 21.7502 6.00474C21.7502 5.8473 21.7006 5.69386 21.6086 5.56615C21.5165 5.43843 21.3866 5.34294 21.2372 5.29318V5.28849ZM16.5 11.2501C16.5002 11.9615 16.3317 12.6628 16.0084 13.2965C15.6851 13.9302 15.2161 14.4782 14.6399 14.8956C14.0638 15.313 13.3969 15.5878 12.694 15.6975C11.9911 15.8072 11.2722 15.7487 10.5962 15.5268C9.92031 15.3049 9.30663 14.9258 8.80555 14.4208C8.30448 13.9158 7.93028 13.2991 7.71367 12.6215C7.49705 11.9438 7.44419 11.2245 7.55942 10.5225C7.67465 9.82043 7.95469 9.15572 8.37656 8.58287L11.7628 9.70787C11.9168 9.75919 12.0832 9.75919 12.2372 9.70787L15.6234 8.58287C16.1932 9.3554 16.5004 10.2902 16.5 11.2501ZM12 8.20974L5.37187 6.00006L12 3.79037L18.6281 6.00006L12 8.20974Z" fill="#000"/></svg>
                        </div>
                        <h2>
                          {isTutorStatsLoading
                            ? "--"
                            : displayedActiveTutors !== null
                            ? displayedActiveTutors
                            : "N/A"}
                        </h2>
                        <p className='m-0 p-0'>Active Tutors</p>
                        <span className="badge tag-exam">
                          {isTutorStatsLoading
                            ? "Loading..."
                            : tutorStatsError
                            ? "Unable to load stats"
                            : tutorNewCount !== null && tutorNewCount > 0
                            ? `↑ ${tutorNewCount} new ${rangeLabel}`
                            : `No new tutors ${rangeLabel}`}
                        </span>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block'>
                        <div className="icons">
                            <svg fill="#000000" version="1.1" id="Layer_1"  viewBox="0 0 496 496"  width="64px" height="64px"><g id="SVGRepo_bgCarrier"></g><g id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path d="M414.56,319.478L352,305.574v-19.768c24.176-17.448,40-45.784,40-77.816v-48h8V94.614c0-3.16-0.304-6.328-0.8-9.496 L432,74.87v22.592c-9.288,3.312-16,12.112-16,22.528v24h48v-24c0-10.416-6.712-19.216-16-22.528V55.99 c0-8.312-5.328-15.552-13.248-18.016L329.656,5.134c-21.816-6.832-45.504-6.832-67.312,0L157.248,37.966 C149.328,40.438,144,47.678,144,55.99s5.328,15.552,13.248,18.016L192.8,85.118c-0.496,3.168-0.8,6.336-0.8,9.496v65.376h8v48 c0,32.032,15.824,60.368,40,77.816v19.768l-62.56,13.896c-0.464,0.104-0.968,0.256-1.44,0.376V183.99H0v224h42.8 c2.64,7.432,7.048,14.008,12.728,19.248l-8.592,68.752h18.36L88,488.422l22.704,7.568H120h9.064H496v-74.992 C496,371.87,462.512,330.134,414.56,319.478z M440,111.99c4.416,0,8,3.584,8,8v8h-16v-8C432,115.574,435.584,111.99,440,111.99z M162.016,58.734c-1.2-0.376-2.016-1.48-2.016-2.744s0.816-2.368,2.016-2.752l105.096-32.84c9.368-2.92,19.08-4.408,28.888-4.408 c9.808,0,19.52,1.488,28.888,4.408l105.096,32.848c1.2,0.376,2.016,1.48,2.016,2.744s-0.816,2.368-2.016,2.752l-105.096,32.84 c-18.736,5.84-39.048,5.84-57.784,0L162.016,58.734z M208,94.614c0-1.544,0.168-3.096,0.336-4.648l54.008,16.88 c10.904,3.416,22.224,5.144,33.656,5.144s22.752-1.728,33.656-5.144l54.016-16.872c0.16,1.552,0.328,3.104,0.328,4.64v49.376h-8 H216h-8V94.614z M216,207.99v-48h160v48c0,44.112-35.888,80-80,80S216,252.102,216,207.99z M296,319.046l-40-20v-3.896 c12.192,5.616,25.712,8.84,40,8.84c14.288,0,27.808-3.224,40-8.84v3.896L296,319.046z M330.768,319.558l-13.096,24l-9.52-12.696 L330.768,319.558z M283.856,330.854l-9.52,12.696l-13.096-24L283.856,330.854z M40,391.99H16v-192h144v192h-24 c0-26.472-21.528-48-48-48S40,365.518,40,391.99z M88,471.558l-22.832,7.608l5.312-42.536c5.44,2.144,11.336,3.36,17.52,3.36 s12.08-1.216,17.52-3.36l5.32,42.536L88,471.558z M88,423.99c-17.648,0-32-14.352-32-32s14.352-32,32-32s32,14.352,32,32 S105.648,423.99,88,423.99z M216,479.99h-24v-32h-16v32h-48.936l-6.592-52.752c5.688-5.24,10.096-11.816,12.728-19.248H176 v-63.296l40,73.336V479.99z M288,479.99h-56v-66.04l-43.888-80.456l55.744-12.392L288,402.03V479.99z M282.744,358.99 L296,341.318l13.256,17.672L296,383.286L282.744,358.99z M360,479.99h-56v-77.96l44.144-80.92l55.744,12.384L360,413.95V479.99z M480,479.99h-64v-32h-16v32h-24v-61.96l43.888-80.456c35.8,11.848,60.112,44.944,60.112,83.424V479.99z"></path> <rect x="96" y="215.99" width="48" height="16"></rect> <rect x="32" y="247.99" width="112" height="16"></rect> <rect x="32" y="279.99" width="112" height="16"></rect> <rect x="32" y="311.99" width="64" height="16"></rect> </g> </g> </g> </g></svg>
                        </div>
                        <h2>
                          {isStudentsStatsLoading
                            ? "--"
                            : displayedStudentsTotal !== null
                            ? displayedStudentsTotal
                            : "N/A"}
                        </h2>
                        <p className='m-0 p-0'>Total Students</p>
                        <span className="badge tag-exam">
                          {isStudentsStatsLoading
                            ? "Loading..."
                            : studentsStatsError
                            ? "Unable to load stats"
                            : studentsPercentage !== null
                            ? studentsPercentage >= 0
                              ? `↑ ${studentsPercentage.toFixed(1)}%`
                              : `↓ ${Math.abs(studentsPercentage).toFixed(1)}%`
                            : studentsNewCount !== null && studentsNewCount > 0
                            ? `↑ ${studentsNewCount} new ${rangeLabel}`
                            : `No new students ${rangeLabel}`}
                        </span>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block'>
                        <div className="icons">
                          <svg fill="#000000" version="1.1" id="Layer_1" width="64" height="64" viewBox="0 0 256 252" data-iconid="revenue-estimate-estimate-revenue" ><path d="M59.406,88.486L50.54,60.801h50.68L90.352,88.486H59.406z M20.567,146.773	c0-21.393,11.841-39.869,29.63-49.078h50.737c17.789,9.209,29.973,27.685,29.973,49.078c0,30.316-24.711,55.027-55.027,55.027	C45.22,201.801,20.567,177.09,20.567,146.773z M80.857,159.987c0,3.26-2.974,4.919-7.265,4.919c-4.976,0-9.553-1.659-12.87-3.318	l-2.288,8.866c2.917,1.659,7.894,2.974,13.156,3.318v7.264h7.551v-7.894c8.923-1.316,13.843-7.265,13.843-14.186	c0-6.921-3.661-11.154-12.87-14.472c-6.578-2.288-9.209-3.947-9.209-6.578c0-2.002,1.659-4.29,6.578-4.29	c5.606,0,9.209,1.659,11.211,2.631l2.288-8.58c-2.631-1.316-5.949-2.288-11.211-2.631v-6.921h-7.551v7.207	c-8.237,1.659-13.156,6.921-13.156,13.843c0,7.608,5.606,11.555,13.843,14.186C78.511,155.354,81.143,157.012,80.857,159.987z	 M198.608,91.221c-1.756-1.828-1.698-4.734,0.13-6.491s4.734-1.698,6.491,0.13s1.698,4.734-0.13,6.491	S200.364,93.049,198.608,91.221z M229.263,82.637c1.828-1.756,1.887-4.662,0.13-6.491s-4.662-1.887-6.491-0.13	c-1.828,1.756-1.887,4.662-0.13,6.491S227.434,84.394,229.263,82.637z M171.883,56.775c1.828-1.756,1.887-4.662,0.13-6.491	c-1.756-1.828-4.662-1.887-6.491-0.13s-1.887,4.662-0.13,6.491S170.055,58.532,171.883,56.775z M239.094,60.108	c1.828-1.756,1.887-4.662,0.13-6.491s-4.662-1.887-6.491-0.13s-1.887,4.662-0.13,6.491C234.36,61.806,237.266,61.864,239.094,60.108	z M204.274,24.598c1.828-1.756,1.887-4.662,0.13-6.491c-1.756-1.828-4.662-1.887-6.491-0.13s-1.887,4.662-0.13,6.491	C199.54,26.296,202.445,26.354,204.274,24.598z M229.857,35.032c1.828-1.756,1.887-4.662,0.13-6.491	c-1.756-1.828-4.662-1.887-6.491-0.13s-1.887,4.662-0.13,6.491C225.123,36.73,228.029,36.788,229.857,35.032z M182.436,34.261	c1.828-1.756,1.887-4.662,0.13-6.491c-1.756-1.828-4.662-1.887-6.491-0.13s-1.887,4.662-0.13,6.491S180.607,36.017,182.436,34.261z	 M190.179,61.832l-16.368,15.724l-1.58,6.822l6.88-1.305l16.368-15.724c4.637,2.618,10.782,2.02,15.012-2.044	c5.15-4.947,5.309-12.88,0.362-18.03s-12.88-5.309-18.03-0.362C188.593,50.978,187.573,56.91,190.179,61.832z M253.968,54.72	c0,21.672-13.201,40.348-31.968,48.417V119h-15.232v88.777c0,17.087-13.772,30.858-30.859,30.858h-26.12v11.181H2V215h148v13.484	l26.675-0.05c11.476,0,20.657-9.181,20.657-20.657V119H182v-15.814c-18.828-8.041-32.083-26.75-32.083-48.466	c0-29.073,23.463-52.536,52.536-52.536C231.271,2.184,254.989,25.646,253.968,54.72z M241.747,34.102	c-11.375-21.68-38.232-30.052-59.912-18.677c-21.68,11.375-30.052,38.232-18.677,59.912c11.375,21.68,38.232,30.052,59.912,18.677	C244.75,82.639,253.122,55.782,241.747,34.102z"></path></svg>
                        </div>
                        <h2>₹8.4L</h2>
                        <p className='m-0 p-0'>Monthly Revenue</p>
                        <span className="badge tag-exam">↑ 18.2%</span>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block'>
                        <div className="icons">
                            <svg width="64px" height="64px" viewBox="0 0 1024 1024" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" ></g><g id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"><path d="M905.92 237.76a32 32 0 0 0-52.48 36.48A416 416 0 1 1 96 512a418.56 418.56 0 0 1 297.28-398.72 32 32 0 1 0-18.24-61.44A480 480 0 1 0 992 512a477.12 477.12 0 0 0-86.08-274.24z" fill="#231815"></path><path d="M630.72 113.28A413.76 413.76 0 0 1 768 185.28a32 32 0 0 0 39.68-50.24 476.8 476.8 0 0 0-160-83.2 32 32 0 0 0-18.24 61.44zM489.28 86.72a36.8 36.8 0 0 0 10.56 6.72 30.08 30.08 0 0 0 24.32 0 37.12 37.12 0 0 0 10.56-6.72A32 32 0 0 0 544 64a33.6 33.6 0 0 0-9.28-22.72A32 32 0 0 0 505.6 32a20.8 20.8 0 0 0-5.76 1.92 23.68 23.68 0 0 0-5.76 2.88l-4.8 3.84a32 32 0 0 0-6.72 10.56A32 32 0 0 0 480 64a32 32 0 0 0 2.56 12.16 37.12 37.12 0 0 0 6.72 10.56zM355.84 313.6a36.8 36.8 0 0 0-13.12 18.56l-107.52 312.96a37.44 37.44 0 0 0 2.56 35.52 32 32 0 0 0 24.96 10.56 27.84 27.84 0 0 0 17.28-5.76 43.84 43.84 0 0 0 10.56-13.44 100.16 100.16 0 0 0 7.04-15.36l4.8-12.8 17.6-49.92h118.72l24.96 69.76a45.76 45.76 0 0 0 10.88 19.2 28.8 28.8 0 0 0 20.48 8.32h2.24a27.52 27.52 0 0 0 27.84-15.68 41.28 41.28 0 0 0 0-29.44l-107.84-313.6a36.8 36.8 0 0 0-13.44-19.2 44.16 44.16 0 0 0-48 0.32z m24.32 96l41.6 125.44h-83.2zM594.88 544a66.56 66.56 0 0 0 25.6 4.16h62.4v78.72a29.12 29.12 0 0 0 32 32 26.24 26.24 0 0 0 27.2-16.32 73.28 73.28 0 0 0 4.16-26.24v-66.88h73.6a27.84 27.84 0 0 0 29.44-32 26.56 26.56 0 0 0-16-27.2 64 64 0 0 0-23.04-4.16h-64v-75.84a28.16 28.16 0 0 0-32-30.08 26.56 26.56 0 0 0-27.2 15.68 64 64 0 0 0-4.16 24v66.88h-62.72a69.44 69.44 0 0 0-25.6 4.16 26.56 26.56 0 0 0-15.68 27.2 25.92 25.92 0 0 0 16 25.92z" fill="#231815"></path></g></svg>
                        </div>
                        <h2>86%</h2>
                        <p className='m-0 p-0'>Avg CSAT Score</p>
                        <span className="badge tag-exam">↑ 2.3%</span>
                    </Link>
                </div>
            </div>
        </div>

        <div className="chart-sec mb-4">
          <div className="row align-ite">
              <div className="col-lg-9 mb-lg-0 mb-4">
                <div className="card-box">
                    <StudentTutorChart />
                </div>
              </div>
              <div className="col-lg-3">
                <div className="chart-text-right card-box h-100 d-flex align-items-center">
                  <ul className="p-0 m-0 list-unstyled">
                    <li>
                      <span className="top-data">Classes This Month</span>
                      <span className="bottom-data">1,247</span>
                    </li>
                    <li>
                      <span className="top-data">Attendance Rate</span>
                      <span className="bottom-data">94%</span>
                    </li>
                    <li>
                      <span className="top-data">Student Retention</span>
                      <span className="bottom-data">91%</span>
                    </li>
                  </ul>
                </div>
              </div>
          </div>
        </div>

        <div className="table-box">
          <PerformingTutors />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
