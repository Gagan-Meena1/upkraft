"use client"

import SideMenuHeader from "../components/SideMenuHeader";
import TopHeader from "../components/TopHeader";
import TopHeaderAcademy from "../components/TopHeaderAcademy";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      <div className="main-sec position-relative">
        <div className="top-header">
          <TopHeaderAcademy role="academy" setRole={() => {}}/>
          {/* <TopHeader role="tutor" setRole={() => {}} /> */}
        </div>
        <div className="dashboard-sec position-relative d-flex flex-wrap">
          <div className="side-menu-sec">
            <SideMenuHeader role={"academy"} />
          </div>
          <div className="side-details-sec">{children}</div>
        </div>
      </div>
    </>
  );
}