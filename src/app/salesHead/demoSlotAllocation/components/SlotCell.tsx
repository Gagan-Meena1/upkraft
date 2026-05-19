import React from "react";

interface SlotCellProps {
  status: "na" | "available" | "unavailable";
  societyNames?: string[];
  classTitle?: string;
  classTime?: string;
  isSelected?: boolean;
  onClick: () => void;
}

const SlotCell: React.FC<SlotCellProps> = ({
  status,
  societyNames,
  classTitle,
  classTime,
  isSelected,
  onClick,
}) => {
  const hasSocs = societyNames && societyNames.length > 0;

  // Map statuses to cell classes
  let cellClass = "cell ";
  let badge: React.ReactNode = null;
  let info: React.ReactNode = null;

  if (classTitle) {
    const isTrial = classTitle.toLowerCase().includes("free trial");
    cellClass += isTrial ? "booked" : "booked";
    badge = isTrial
      ? <span className="c-badge b-booked">BOOKED</span>
      : <span className="c-badge b-class">CLASS</span>;
    info = (
      <>
        {classTime && (
          <div className="c-time" style={{ color: isTrial ? "var(--blue)" : "var(--violet)" }}>
            {classTime}
          </div>
        )}
        <div className="c-text">
          <strong>{classTitle}</strong>
        </div>
      </>
    );
  } else if (status === "available") {
    cellClass += hasSocs ? "open soc-specific" : "open";
    badge = hasSocs ? (
      <span className="c-badge b-soc">OPEN</span>
    ) : (
      <span className="c-badge b-open">OPEN</span>
    );
    info = hasSocs ? (
      <div className="c-soc">{societyNames!.join(", ")}</div>
    ) : (
      <div className="c-text" style={{ color: "var(--green)", fontWeight: 600 }}>
        All societies
      </div>
    );
  } else {
    // unavailable / na
    cellClass += "na";
    badge = <span className="c-badge b-na">NA</span>;
  }

  if (isSelected) {
    cellClass += " selected-slot";
  }

  return (
    <div className={cellClass} onClick={onClick}>
      {badge}
      {info}
    </div>
  );
};

export default SlotCell;
