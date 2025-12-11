"use client"

import React, { useState, useEffect } from 'react';
import SideMenuHeader from "../components/SideMenuHeader";
import TopHeaderStudent from "../components/TopHeaderStudent";
import SuspensionModal from "../components/SuspensionModal";
import { UserDataProvider } from "../providers/UserData/page"; 

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspensionMessage, setSuspensionMessage] = useState('');
  const [isCheckingSuspension, setIsCheckingSuspension] = useState(true);

  useEffect(() => {
    const checkSuspensionStatus = async () => {
      try {
        setIsCheckingSuspension(true);
        const response = await fetch("/Api/student/suspensionStatus");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsSuspended(data.isSuspended || false);
            setSuspensionMessage(data.message || 'Your account has been suspended. Please renew your subscription to continue.');
          }
        }
      } catch (error) {
        console.error("Error checking suspension status:", error);
      } finally {
        setIsCheckingSuspension(false);
      }
    };

    checkSuspensionStatus();
  }, []);

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
        
        {/* Show suspension modal if account is suspended */}
        {!isCheckingSuspension && isSuspended && (
          <SuspensionModal message={suspensionMessage} />
        )}
      </div>
    </UserDataProvider> 
  );
}