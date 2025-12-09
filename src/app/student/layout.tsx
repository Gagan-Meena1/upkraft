"use client"

import SideMenuHeader from "../components/SideMenuHeader";
import TopHeaderStudent from "../components/TopHeaderStudent";
import { UserDataProvider } from "../providers/UserData/page"; 

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <UserDataProvider> 
      <div className="main-sec position-relative">
        <div className="top-header">
          <TopHeaderStudent role="student" setRole={() => {}} />
        </div>
        <div className="dashboard-sec position-relative d-flex flex-wrap">
          <div className="side-menu-sec">
            <SideMenuHeader role={"student"} />
          </div>
          <div className="side-details-sec">{children}</div>
        </div>
      </div>
    </UserDataProvider> 
  );
}