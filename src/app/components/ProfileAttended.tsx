import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import DistanceLearning from '../../assets/distance-learning.png'
import OnlineLesson from '../../assets/online-lesson.png'
import Assignment from '../../assets/assignment.png'
import Image from "next/image";

const ProfileAttended = ({classesAttended, lessonsCompleted}) => {
  return (
       <div className="">
         <div className="card-items-box">
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 55, height: 55 }}>
              <CircularProgressbarWithChildren
                value={75}
                styles={buildStyles({
                  pathColor: "#6c47ff",
                  trailColor: "#eee",
                })}
              >
                <Image src={DistanceLearning} alt="Distance Learning" />
              </CircularProgressbarWithChildren>
            </div>
            <div>
              <h5 className="mb-0 fw-bold">{classesAttended}</h5>
              <small className="text-muted">Classes Attended</small>
            </div>
          </div>
        </div>
         <div className="card-items-box">
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 55, height: 55 }}>
              <CircularProgressbarWithChildren
                value={40}
                styles={buildStyles({
                  pathColor: "#f9a826",
                  trailColor: "#eee",
                })}
              >
               <Image src={OnlineLesson} alt="Online Lesson" />
              </CircularProgressbarWithChildren>
            </div>
            <div>
              <h5 className="mb-0 fw-bold">7</h5>
              <small className="text-muted">Lessons Completed</small>
            </div>
          </div>
        </div>
         <div className="card-items-box">
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 55, height: 55 }}>
              <CircularProgressbarWithChildren
                value={55}
                styles={buildStyles({
                  pathColor: "#6c47ff",
                  trailColor: "#eee",
                })}
              >
               <Image src={Assignment} alt="Assignment" />
              </CircularProgressbarWithChildren>
            </div>
            <div>
              <h5 className="mb-0 fw-bold">{lessonsCompleted}</h5>
              <small className="text-muted">Assignments Completed</small>
            </div>
          </div>
        </div>
        </div>
  );
};

export default ProfileAttended