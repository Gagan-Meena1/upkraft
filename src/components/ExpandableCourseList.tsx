import React from 'react';

interface ExpandableCourseListProps {
  courses: Array<{ title: string }>;
  maxItems?: number;
}

export const ExpandableCourseList: React.FC<ExpandableCourseListProps> = ({ 
  courses, 
  maxItems = 1 
}) => {
  const [expanded, setExpanded] = React.useState(false);
  
  const courseTitles = courses.map((course) => course.title);
  const isLong = courseTitles.length > maxItems;
  const displayText = expanded
    ? courseTitles.join(', ')
    : courseTitles.slice(0, maxItems).join(', ') + (isLong ? '...' : '');

  return (
    <>
      {displayText}
      {isLong && (
        <button
          className="read-more-btn"
          style={{
            marginLeft: '5px',
            background: 'none',
            border: 'none',
            color: '#6E09BD',
            cursor: 'pointer',
            padding: 0,
          }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? ' Show less' : ' Show more'}
        </button>
      )}
    </>
  );
};
