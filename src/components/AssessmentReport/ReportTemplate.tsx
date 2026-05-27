import React from 'react';
import { 
  FaUser, 
  FaKeyboard, 
  FaCalendarAlt, 
  FaBuilding, 
  FaChalkboardTeacher, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaGlobe,
  FaStar,
  FaMusic,
  FaAssistiveListeningSystems,
  FaHandPaper,
  FaBookOpen,
  FaUsers,
  FaChartLine,
  FaCheckCircle,
  FaTasks,
  FaClock,
  FaHome
} from 'react-icons/fa';

export interface AssessmentData {
  tutorName: string;
  instrument: string;
  demoDate: string;
  studentName: string;
  societyName: string;
  rhythmSense: number;
  earTraining: number;
  technique: number;
  theoretical: number;
  engagement: number;
  overall: number;
  feedback: string;
}

interface ReportTemplateProps {
  data: AssessmentData;
}

export const ReportTemplate: React.FC<ReportTemplateProps> = ({ data }) => {
  // Recommendation logic based on overall score and instrument
  let recommendedProgram = "Beginner Program";
  if (data.overall > 8) recommendedProgram = "Advanced Program";
  else if (data.overall > 6) recommendedProgram = "Intermediate Program";
  
  const recommendedClasses = data.overall > 7 ? "2 Classes / Week" : "1 Class / Week";

  const renderProgressBar = (label: string, score: number, Icon: any) => {
    return (
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center w-1/3">
          <Icon className="text-indigo-600 mr-2" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="w-1/2 bg-gray-200 rounded-full h-2.5 mx-4">
          <div className="bg-indigo-700 h-2.5 rounded-full" style={{ width: `${(score / 10) * 100}%` }}></div>
        </div>
        <div className="w-1/12 text-right text-sm font-bold text-gray-800">{score}/10</div>
      </div>
    );
  };

  return (
    <div 
      id="pdf-report-container" 
      className="bg-white w-[800px] shadow-lg rounded-lg overflow-hidden flex flex-col font-sans"
      style={{ minHeight: '1131px', position: 'relative' }} // A4 aspect ratio approx (800x1131)
    >
      {/* Header Section */}
      <div className="w-full">
        <img src="/banner.jpeg" alt="Upkraft Student Demo Assessment Report" className="w-full h-auto object-contain" />
      </div>

      {/* Info Boxes */}
      <div className="px-8 py-4 grid grid-cols-3 gap-4">
        {/* Row 1 */}
        <div className="flex items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100">
          <div className="bg-white p-2 rounded-full mr-3 text-indigo-600 shadow-sm"><FaUser size={20}/></div>
          <div>
            <div className="text-xs text-gray-500">Student Name</div>
            <div className="font-bold text-gray-800">{data.studentName || "N/A"}</div>
          </div>
        </div>
        <div className="flex items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100">
          <div className="bg-white p-2 rounded-full mr-3 text-indigo-600 shadow-sm"><FaCalendarAlt size={20}/></div>
          <div>
            <div className="text-xs text-gray-500">Demo Date</div>
            <div className="font-bold text-gray-800">{data.demoDate || "N/A"}</div>
          </div>
        </div>
        <div className="flex items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100">
          <div className="bg-white p-2 rounded-full mr-3 text-indigo-600 shadow-sm"><FaChalkboardTeacher size={20}/></div>
          <div>
            <div className="text-xs text-gray-500">Tutor Name</div>
            <div className="font-bold text-gray-800">{data.tutorName || "N/A"}</div>
          </div>
        </div>
        {/* Row 2 */}
        <div className="flex items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100">
          <div className="bg-white p-2 rounded-full mr-3 text-indigo-600 shadow-sm"><FaKeyboard size={20}/></div>
          <div>
            <div className="text-xs text-gray-500">Instrument</div>
            <div className="font-bold text-gray-800">{data.instrument || "N/A"}</div>
          </div>
        </div>
        <div className="flex items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100 col-span-2">
          <div className="bg-white p-2 rounded-full mr-3 text-indigo-600 shadow-sm"><FaBuilding size={20}/></div>
          <div>
            <div className="text-xs text-gray-500">Society</div>
            <div className="font-bold text-gray-800">{data.societyName || "N/A"}</div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="px-8 py-2 flex flex-row gap-6 flex-grow">
        
        {/* Left Column (Performance & Skills) */}
        <div className="w-7/12 flex flex-col gap-4">
          
          <div className="border border-gray-200 rounded-xl p-0 overflow-hidden shadow-sm">
            <div className="bg-indigo-900 text-white text-sm font-bold py-1 px-4 inline-block rounded-br-lg mb-4">
              PERFORMANCE SNAPSHOT
            </div>
            
            <div className="flex justify-around items-center px-4 pb-4 border-b border-gray-100">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Overall Performance</div>
                <div className="text-6xl font-black text-indigo-900 leading-none">
                  {data.overall.toFixed(1)}<span className="text-2xl text-gray-400 font-medium">/10</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-200 flex items-center justify-center mb-1">
                  <FaStar className="text-indigo-600 text-3xl" />
                </div>
                <div className="font-bold text-indigo-900 text-sm">
                  {data.overall >= 8 ? "Excellent" : data.overall >= 6 ? "Good Potential" : "Needs Practice"}
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span>Skill Evaluation</span>
                <span>Score (Out of 10)</span>
              </div>
              
              {renderProgressBar("Rhythm Sense", data.rhythmSense, FaMusic)}
              {renderProgressBar("Ear Training", data.earTraining, FaAssistiveListeningSystems)}
              {renderProgressBar("Technique", data.technique, FaHandPaper)}
              {renderProgressBar("Theory", data.theoretical, FaBookOpen)}
              {renderProgressBar("Engagement", data.engagement, FaUsers)}
            </div>
          </div>

          {/* Recommended Learning Path */}
          <div className="border border-indigo-200 rounded-xl p-0 overflow-hidden shadow-sm bg-indigo-50">
            <div className="bg-indigo-700 text-white text-sm font-bold py-1 px-4 mb-3">
              RECOMMENDED LEARNING PATH
            </div>
            <div className="px-4 pb-4 flex items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm text-yellow-500 text-3xl">
                <FaChartLine />
              </div>
              <div>
                <div className="flex items-center text-indigo-900 font-bold mb-1">
                  <FaCheckCircle className="mr-2 text-green-500" />
                  {data.instrument} {recommendedProgram}
                </div>
                <div className="flex items-center text-gray-700 text-sm">
                  <FaCheckCircle className="mr-2 text-green-500" />
                  Recommended: {recommendedClasses}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Feedback & Why UpKraft) */}
        <div className="w-5/12 flex flex-col gap-4">
          
          <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex-grow relative">
            <div className="text-6xl text-indigo-200 absolute top-2 left-4 font-serif">"</div>
            <div className="relative z-10 pt-2">
              <h3 className="font-bold text-indigo-900 uppercase tracking-widest text-sm mb-3 flex items-center">
                Tutor Feedback
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {data.feedback || "No feedback provided by the tutor for this session."}
              </p>
            </div>
          </div>

          {/* Why Choose UpKraft */}
          <div className="border border-gray-200 rounded-xl p-0 overflow-hidden shadow-sm bg-white mt-auto">
            <div className="bg-indigo-900 text-white text-sm font-bold py-1 px-4 mb-3 text-center">
              WHY CHOOSE UPKRAFT?
            </div>
            <div className="grid grid-cols-3 gap-2 p-3 text-center">
              <div className="flex flex-col items-center">
                <FaChalkboardTeacher className="text-indigo-600 text-xl mb-1" />
                <span className="text-[10px] leading-tight text-gray-600 font-medium">Verified<br/>Expert Tutors</span>
              </div>
              <div className="flex flex-col items-center">
                <FaTasks className="text-indigo-600 text-xl mb-1" />
                <span className="text-[10px] leading-tight text-gray-600 font-medium">Structured<br/>Curriculum</span>
              </div>
              <div className="flex flex-col items-center">
                <FaChartLine className="text-indigo-600 text-xl mb-1" />
                <span className="text-[10px] leading-tight text-gray-600 font-medium">Regular<br/>Progress Tracking</span>
              </div>
              <div className="flex flex-col items-center col-span-3 grid grid-cols-2 mt-2 border-t border-gray-100 pt-2">
                <div className="flex flex-col items-center">
                  <FaClock className="text-indigo-600 text-xl mb-1" />
                  <span className="text-[10px] leading-tight text-gray-600 font-medium">Flexible Scheduling</span>
                </div>
                <div className="flex flex-col items-center">
                  <FaHome className="text-indigo-600 text-xl mb-1" />
                  <span className="text-[10px] leading-tight text-gray-600 font-medium">Home Classes</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <div className="px-8 py-4 flex justify-between items-center bg-indigo-50 border border-indigo-100 mx-8 mb-4 rounded-xl">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-indigo-900 text-white rounded-full flex items-center justify-center mr-4 text-3xl shadow-lg">
              <FaPhoneAlt />
            </div>
            <div>
              <div className="font-bold text-indigo-900 uppercase tracking-wide text-lg">Next Steps</div>
              <div className="text-sm text-gray-700 max-w-sm">
                Our learning advisor will connect with you shortly to help select the best batch and schedule for your child.
              </div>
            </div>
          </div>
          <div className="text-indigo-700 font-script text-3xl italic font-serif flex items-center">
            Happy Learning! <span className="ml-2 text-yellow-400 text-4xl">♡</span>
          </div>
        </div>
        
        <div className="bg-indigo-900 text-white flex justify-center items-center py-4 text-sm w-full mt-4">
          <div className="flex items-center mx-6"><FaPhoneAlt className="mr-2 text-indigo-300 text-lg" /> 9980909364</div>
          <div className="text-indigo-400 font-light">|</div>
          <div className="flex items-center mx-6"><FaEnvelope className="mr-2 text-indigo-300 text-lg" /> support@upkraft.in</div>
          <div className="text-indigo-400 font-light">|</div>
          <div className="flex items-center mx-6"><FaGlobe className="mr-2 text-indigo-300 text-lg" /> www.upkraft.in</div>
        </div>
      </div>

    </div>
  );
};
