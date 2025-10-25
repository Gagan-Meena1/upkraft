"use client";

import React, { useRef } from "react";
import Videoquality from "@/assets/Videoquality.png";
import Reel1 from "@/assets/reel1.png";
import Reel2 from "@/assets/reel2.png";

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

  // List of tutor videos
  const tutorVideos: TutorVideo[] = [
    { ref: video1, name: "Alfred", videoSrc: "/videos/reel1.mp4", poster: Reel1.src },
    { ref: video2, name: "Beatrice", videoSrc: "/videos/reel2.mp4", poster: Reel2.src },
    { ref: video3, name: "Charles", videoSrc: "/videos/reel1.mp4", poster: Reel1.src },
    { ref: video4, name: "Diana", videoSrc: "/videos/reel2.mp4", poster: Reel2.src },
  ];

  const handlePlay = (videoRef: React.RefObject<HTMLVideoElement>, tutorName: string) => {
    if (videoRef.current) {
      videoRef.current.play();

      // Optional: track video play in GA4
      if (window.gtag) {
        window.gtag("event", "video_play", {
          tutor_name: tutorName,
          category: "Learn From Experts",
          label: `Play ${tutorName}'s video`,
        });
      }
    }
  };

  const handleLearnClick = (tutorName: string) => {
    if (window.gtag) {
      window.gtag("event", "learn_click", {
        tutor_name: tutorName,
        category: "Learn From Experts",
        label: `Click on ${tutorName}`,
      });
    }

    // Optional: redirect with UTM
    // const url = `/learn?tutor=${encodeURIComponent(tutorName)}&utm_source=homepage&utm_medium=click&utm_campaign=learn_from_experts`;
    // window.location.href = url;
  };

  const renderVideoCard = (video: TutorVideo) => (
    <div key={video.name} className="col-lg-3 col-md-6 mb-lg-0 mb-4">
      <div className="video-box-with-text">
        <div className="learn-video" onClick={() => handlePlay(video.ref, video.name)}>
          <video ref={video.ref} width="720px" height="405" controls poster={video.poster} preload="none">
            <source src={video.videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="learn-text">
          <h5 style={{ cursor: "pointer" }} onClick={() => handleLearnClick(video.name)}>
            {/* Learn from {video.name}
             */}
             Learn From Alfred
          </h5>
          <div className="d-flex align-items-center gap-2">
            <img src={Videoquality.src} alt="" />
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
                Check out bite-sized reels and lessons from expert tutors. Get inspired, try new techniques, and start learning in just a click.
              </p>
            </div>
          </div>
        </div>
        <div className="row">
          {tutorVideos.map((video) => renderVideoCard(video))}
        </div>
      </div>
    </div>
  );
};

export default LearnFromExperts;
