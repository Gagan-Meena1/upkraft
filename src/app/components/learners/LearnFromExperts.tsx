"use client";

import React, { useRef } from "react";
import Videoquality from "@/assets/Videoquality.png";
import Reel1 from "@/assets/reel1.png";
import Reel2 from "@/assets/reel2.png";
import Reel3 from "@/assets/reel3.png";
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

  // Tutor data
  const tutorVideos: TutorVideo[] = [
    { ref: video1, name: "Alfred", videoSrc: "/videos/reel1.mp4", poster: Reel1.src },
    { ref: video2, name: "Alfred", videoSrc: "/videos/reel2.mp4", poster: Reel2.src },
    { ref: video3, name: "Alfred", videoSrc: "/videos/reel3.mp4", poster: Reel3.src },
    { ref: video4, name: "Hangshing", videoSrc: "/videos/reel4.mp4", poster: Reel4.src },
  ];

  // 🔹 Pause all videos except the one playing
  const pauseOtherVideos = (currentRef: React.RefObject<HTMLVideoElement>) => {
    [video1, video2, video3, video4].forEach((ref) => {
      if (ref.current && ref !== currentRef) {
        ref.current.pause();
        ref.current.currentTime = 0; // optional: reset to start
      }
    });
  };

  // 🔹 Handle play event
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

  // 🔹 Handle “Learn From” click
  const handleLearnClick = (tutorName: string) => {
    if (window.gtag) {
      window.gtag("event", "learn_click", {
        tutor_name: tutorName,
        category: "Learn From Experts",
        label: `Clicked on Learn From ${tutorName}`,
      });
    }
  };

  // 🔹 Render each tutor card
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
        <div className="learn-text">
          <h5 style={{ cursor: "pointer" }} onClick={() => handleLearnClick(video.name)}>
            Learn From {video.name}
          </h5>
          <div className="d-flex align-items-center gap-2">
            <img src={Videoquality.src} alt="Quality Badge" />
            <h6>Trinity Certified Tutor</h6>
          </div>
          <div className="text d-flex align-items-center gap-1">YOE: 15 Years</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="learn-experts-sec">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="heading-box text-center">
              <h2 className="mb-3">
                Learn from <span>Experts</span>
              </h2>
              <p>
                Check out bite-sized reels and lessons from expert tutors. Get inspired, try new
                techniques, and start learning in just a click.
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Pass index to avoid duplicate key warning */}
        <div className="row">
          {tutorVideos.map((video, index) => renderVideoCard(video, index))}
        </div>
      </div>
    </div>
  );
};

export default LearnFromExperts;
