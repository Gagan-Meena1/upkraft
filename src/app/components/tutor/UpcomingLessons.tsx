import React from "react";
import Link from "next/link";

const UpcomingLessons = () => {
  return (
    <div className="card-box table-sec">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4">
            <h2>Upcoming Lessons</h2>
            <Link href="" className="btn-text">View All</Link>
        </div>
      <div className="table-responsive">
        <table className="table align-middle m-0">
          <thead>
            <tr>
              <th >Date</th>
              <th >Time</th>
              <th >Course</th>
              <th >Student Name</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>21 July</th>
              <td>2:00 -3:00 Pm</td>
              <th>Introduction to Piano</th>
              <td>Eunice Robel & Arnold Hayes </td>
            </tr>
            <tr>
              <th>22 July</th>
              <td>4:00 -5:00 Pm</td>
              <th>Finger Warmups</th>
              <td>Eunice Robel & Arnold Hayes </td>
            </tr>
            <tr>
              <th>23 July</th>
              <td>3:00 -4:00 Pm</td>
              <th>Simple Chords</th>
              <td>Eunice Robel & Arnold Hayes </td>
            </tr>
            <tr>
              <th>24 July</th>
              <td>5:00 -6:00 Pm</td>
              <th>Rhythm Basics</th>
              <td>Eunice Robel & Arnold Hayes </td>
            </tr>
            <tr>
              <th>25 July</th>
              <td>2:00 -3:00 Pm</td>
              <th>Introduction to Piano</th>
              <td>Eunice Robel & Arnold Hayes </td>
            </tr>
            <tr>
              <th>26 July</th>
              <td>2:00 -3:00 Pm</td>
              <th>Simple Melodies</th>
              <td>Eunice Robel & Arnold Hayes </td>
            </tr>
            <tr>
              <th>27 July</th>
              <td>2:00 -3:00 Pm</td>
              <th>Introduction to Piano</th>
              <td>Eunice Robel & Arnold Hayes </td>
            </tr>
            <tr>
              <th>21 July</th>
              <td>2:00 -3:00 Pm</td>
              <th>Finger Warmups</th>
              <td>Eunice Robel & Arnold Hayes </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpcomingLessons;
