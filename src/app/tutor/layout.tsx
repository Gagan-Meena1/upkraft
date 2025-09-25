"use client"

import SideMenuHeader from "../components/SideMenuHeader";
import TopHeader from "../components/TopHeader";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      <div className="main-sec position-relative">
        <div className="top-header">
          <TopHeader role="tutor" setRole={() => {}} />
        </div>
        <div className="dashboard-sec position-relative d-flex flex-wrap">
          <div className="side-menu-sec">
            <SideMenuHeader role={"tutor"} />
          </div>
          <div className="side-details-sec">{children}</div>
        </div>
      </div>
    </>
  );
}