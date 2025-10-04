import React from "react";
import RhythmChart from "./charts/RhythmChart";
import TheoriticalUnderstanding from "./charts/TheoriticalUnderstanding";
import EarTraining from "./charts/EarTraining";
import Performance from "./charts/Performance";
import Technique from "./charts/Technique";
import AssignmentCompletion from "./charts/AssignmentCompletion";

interface IndividualProgressProps {
  feedbackData: any[];
  averageSkillScores: Record<string, number>;
  allStudentsFeedbackData: any[];
}

const IndividualProgress: React.FC<IndividualProgressProps> = ({
  feedbackData,
  averageSkillScores,
  allStudentsFeedbackData,
}) => {
  return (
    <div className='card-box individual-progress-chart'>
        <div className="row">
            <div className="col-md-12 mb-5">
                <h2>Individual Skills Progress</h2>
                <hr className="hr-light"/>
            </div>
            <div className="col-xxl-4 col-md-6 mb-5">
                <RhythmChart feedbackData={feedbackData} averageSkillScores={averageSkillScores} />
            </div>
            <div className="col-xxl-4 col-md-6 mb-5">
                <TheoriticalUnderstanding feedbackData={feedbackData} averageSkillScores={averageSkillScores} />
            </div>
            <div className="col-xxl-4 col-md-6 mb-5">
                <EarTraining feedbackData={feedbackData} averageSkillScores={averageSkillScores} />
            </div>
            <div className="col-xxl-4 col-md-6 mb-5">
                <Performance feedbackData={feedbackData} averageSkillScores={averageSkillScores} />
            </div>
            <div className="col-xxl-4 col-md-6 mb-5">
                <Technique feedbackData={feedbackData} averageSkillScores={averageSkillScores} />
            </div>
            <div className="col-xxl-4 col-md-6 mb-5">
                <AssignmentCompletion feedbackData={feedbackData} averageSkillScores={averageSkillScores} />
            </div>
        </div>
    </div>
  )
}

export default IndividualProgress