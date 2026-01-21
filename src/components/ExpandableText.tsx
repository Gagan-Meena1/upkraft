import React from 'react';

interface ExpandableTextProps {
  text: string;
  maxChars: number;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({ text, maxChars }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  const isLong = text.length > maxChars;
  const displayText = expanded ? text : text.slice(0, maxChars);

  if (!isLong) return <>{text}</>;

  return (
    <>
      {displayText}
      {!expanded && '... '}
      <button
        onClick={() => setExpanded(!expanded)}
        className="read-more-btn"
      >
        {expanded ? ' Show less' : ' Read more'}
      </button>
    </>
  );
};