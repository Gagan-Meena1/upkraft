import React from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import './Dashboard.css'
import Profile from '../../../assets/Profile-img.png'
import Image from 'next/image';

interface UserData {
  _id: string;
  username: string;
  email: string;
  category: string;
  age: number;
  address: string;
  contact: string;
  courses: any[];
  createdAt: string;
}
const ProfileProgress = ({ user }: { user: UserData }) => {
  const percentage = 25;

  return (
    <>
        <div className="progressbar-sec" style={{ width: 150, height: 150 }}>
        <CircularProgressbarWithChildren
            value={percentage}
            strokeWidth={5}
            styles={buildStyles({
            pathColor: "#fbbf24",
            trailColor: "#f1f1f1",
            strokeLinecap: "round"
            })}>

            {user?.profileImage ? (
              <Image 
                style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover"}} 
                src={user.profileImage}  
                alt={user.username || "Profile"}
                width={120}
                height={120}
              />
            ) : (
              <div 
                style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: "50%", 
                  backgroundColor: "#7009BA", // Changed to purple
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "48px",
                  fontWeight: "bold"
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}


            <div className="icons" style={{position: "absolute",bottom: 15,right: 15, }} >
                <span className='text'>
                    <svg width="32" height="21" viewBox="0 0 32 21" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10.3535" cy="10.9818" r="10" fill="black"/><path d="M10.0582 15.1135L12.8248 16.7868C13.3315 17.0935 13.9515 16.6401 13.8182 16.0668L13.0848 12.9201L15.5315 10.8001C15.9782 10.4135 15.7382 9.68015 15.1515 9.63348L11.9315 9.36015L10.6715 6.38681C10.4448 5.84681 9.67149 5.84681 9.44482 6.38681L8.18482 9.35348L4.96482 9.62681C4.37815 9.67348 4.13815 10.4068 4.58482 10.7935L7.03149 12.9135L6.29815 16.0601C6.16482 16.6335 6.78482 17.0868 7.29149 16.7801L10.0582 15.1135Z" fill="white"/></svg>
                </span>
            </div>
            </CircularProgressbarWithChildren>
        </div>
        <div className="text-center mt-3"> 
            <h1 className="mb-2">{user?.username}</h1>
            <h3>{user?.category}</h3>
        </div>
    </>
  );
};

export default ProfileProgress;
