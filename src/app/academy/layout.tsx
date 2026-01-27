"use client"

import { store } from "@/store/store";
import SideMenuHeader from "../components/SideMenuHeader";
import TopHeaderAcademy from "../components/TopHeaderAcademy";
import { Provider } from "react-redux";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      <Provider store={store}>
        <div className="main-sec position-relative">
          <div className="top-header">
            <TopHeaderAcademy role="academy" setRole={() => { }} />
            {/* <TopHeader role="tutor" setRole={() => {}} /> */}
          </div>
          <div className="dashboard-sec position-relative d-flex flex-wrap">
            <div className="side-menu-sec">
              <SideMenuHeader role={"academy"} />
            </div>
            <div className="side-details-sec">{children}</div>
          </div>
        </div>
      </Provider>
    </>
  );
}