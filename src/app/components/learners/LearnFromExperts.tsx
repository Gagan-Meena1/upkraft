"use client";

import React, { useRef, useState } from "react";
import ModalStudent from "./ModalStudent";
import Videoquality from "@/assets/Videoquality.png";
import reel1thumbnail from "@/assets/reel1thumbnail.png";
import gminorthumbnail from "@/assets/gminorthumbnail.png";
import mazurkathumbnail from "@/assets/mazurkathumbnail.png";
import Reel4 from "@/assets/reel4.png";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface TutorVideo {
  ref: React.RefObject<HTMLVideoElement>;
  name: string;
  videoSrc: string;
  poster: string;
}

const LearnFromExperts = () => {
  const video1 = useRef<HTMLVideoElement>(null);
  const video2 = useRef<HTMLVideoElement>(null);
  const video3 = useRef<HTMLVideoElement>(null);
  const video4 = useRef<HTMLVideoElement>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);

  const tutorVideos: TutorVideo[] = [
    { ref: video1, name: "Alfred", videoSrc: "/videos/Chord-Strumming.mp4", poster: reel1thumbnail.src },
    { ref: video2, name: "Alfred", videoSrc: "/videos/G-Minor.mp4", poster: gminorthumbnail.src },
    { ref: video3, name: "Rohan", videoSrc: "/videos/Mazurka.mp4", poster: mazurkathumbnail.src },
    { ref: video4, name: "Hangshing", videoSrc: "/videos/reel4.mp4", poster: Reel4.src },
  ];

  const pauseOtherVideos = (currentRef: React.RefObject<HTMLVideoElement>) => {
    [video1, video2, video3, video4].forEach((ref) => {
      if (ref.current && ref !== currentRef) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
  };

  const handlePlay = (videoRef: React.RefObject<HTMLVideoElement>, tutorName: string) => {
    if (!videoRef.current) return;
    pauseOtherVideos(videoRef);
    videoRef.current.play();

    if (window.gtag) {
      window.gtag("event", "tutor_video_watch", {
        tutor_name: tutorName,
        category: "Learn From Experts",
        label: `Started watching ${tutorName}'s video`,
      });
    }
  };

  const handleLearnClick = (tutorName: string) => {
    setSelectedTutor(tutorName);
    setShowModal(true);

    if (window.gtag) {
      window.gtag("event", "learn_click", {
        tutor_name: tutorName,
        category: "Learn From Experts",
        label: `Clicked on Learn From ${tutorName}`,
      });
    }
  };

  const renderVideoCard = (video: TutorVideo, index: number) => (
    <div key={`${video.name}-${index}`} className="col-lg-3 col-md-6 mb-lg-0 mb-4">
      <div className="video-box-with-text">
        <div className="learn-video">
          <video
            ref={video.ref}
            poster={video.poster}
            preload="none"
            controls
            onPlay={() => handlePlay(video.ref, video.name)}
          >
            <source src={video.videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="learn-text text-center mt-2">

          <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
            <img src={Videoquality.src} alt="Quality Badge" />
            <h6 className="m-0">Trinity Certified Tutor</h6>
          </div>
          <div className="text d-flex align-items-center justify-content-center gap-1">
            YOE: 15 Years
          </div>
          {/* 👇 Changed text to a button */}
          <button
            className="btn btn-orange w-100 mt-3"
            onClick={() => handleLearnClick(video.name)}
          >
            Learn From {video.name}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="learn-experts-sec">
      <div className="container">
        <div className="heading-box text-center mb-4">
          <h2 className="mb-3 !text-[34px]">
            Learn from <span>Experts</span>
          </h2>
          <p>
            Check out bite-sized reels and lessons from expert tutors. Get inspired, try new
            techniques, and start learning in just a click.
          </p>
        </div>

        <div className="row">
          {tutorVideos.map((video, index) => renderVideoCard(video, index))}
        </div>
      </div>

      {/* ✅ Modal Student Component */}
      <ModalStudent
        show={showModal}
        handleClose={() => setShowModal(false)}
        tutorName={selectedTutor || ""}
      />
    </div>
  );
};

export default LearnFromExperts;
