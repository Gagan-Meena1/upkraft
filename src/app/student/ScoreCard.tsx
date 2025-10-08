'use client'
import React from "react";
import { Card, Button } from "react-bootstrap";
import { CircularProgressbarWithChildren, buildStyles,} 
from "react-circular-progressbar";
import Link from "next/link";
import Image from "next/image";

const ScoreCard = ({ title, score, text, image, data, link, showOutOfTen = true }) => {
  // If showing count, render full ring for display; else scale as score/10
  const percentage = showOutOfTen ? (score / 10) * 100 : 100;

  return (
    <Card className="score-card text-center border-0">
      <h6 className="fw-bold mb-3">{title}</h6>
      <div className="circle-container position-relative">
        <CircularProgressbarWithChildren
          value={percentage}
          strokeWidth={6}
          styles={buildStyles({
            pathColor: "#6f2dbd",
            trailColor: "#f2f2f2",
            strokeLinecap: "round",
            rotation: 0.75, 
          })}
        >
          <Image
            src={image}
            alt="profile"
            width={50}
            height={50}
            className="circle-avatar"
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
          <div className="circle-score">
            {score}
            {!showOutOfTen ? null : <span>/10</span>}
          </div>
          <div className="circle-text">{text}</div>
        </CircularProgressbarWithChildren>
        <div className="circle-marker" style={{ transform: `rotate(${(percentage / 100) * 0}deg) translate(59px)`}}></div>
      </div>

        <Link href={link?link:""} className='btn btn-border padding-fixed d-flex align-items-center justify-content-center gap-2 w-auto mx-auto p-1 px-4 mt-3'>
            <span>View Details</span>
            <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.25551 16.2428C7.13049 16.1178 7.06025 15.9482 7.06025 15.7714C7.06025 15.5946 7.13049 15.425 7.25551 15.3L13.66 8.89551L8.66973 8.89645C8.58207 8.89645 8.49527 8.87918 8.41428 8.84564C8.33329 8.81209 8.25971 8.76292 8.19773 8.70094C8.13574 8.63896 8.08657 8.56537 8.05303 8.48439C8.01948 8.4034 8.00222 8.3166 8.00222 8.22894C8.00222 8.14128 8.01948 8.05448 8.05303 7.9735C8.08657 7.89251 8.13574 7.81892 8.19773 7.75694C8.25971 7.69496 8.33329 7.64579 8.41428 7.61224C8.49527 7.5787 8.58207 7.56143 8.66973 7.56143H15.2694C15.3571 7.56132 15.4439 7.57851 15.525 7.61202C15.606 7.64552 15.6796 7.69469 15.7416 7.75669C15.8036 7.8187 15.8528 7.89233 15.8863 7.97337C15.9198 8.0544 15.937 8.14125 15.9369 8.22894L15.9369 14.8286C15.9369 14.9163 15.9196 15.0031 15.8861 15.084C15.8525 15.165 15.8034 15.2386 15.7414 15.3006C15.6794 15.3626 15.6058 15.4118 15.5248 15.4453C15.4438 15.4788 15.357 15.4961 15.2694 15.4961C15.1817 15.4961 15.0949 15.4788 15.0139 15.4453C14.933 15.4118 14.8594 15.3626 14.7974 15.3006C14.7354 15.2386 14.6862 15.165 14.6527 15.084C14.6191 15.0031 14.6019 14.9163 14.6019 14.8286L14.6028 9.83831L8.19832 16.2428C8.0733 16.3678 7.90373 16.4381 7.72692 16.4381C7.55011 16.4381 7.38054 16.3678 7.25551 16.2428Z" fill="#6E09BD"/></svg>
        </Link>
    </Card>
  );
};

export default ScoreCard;
