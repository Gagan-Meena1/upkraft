import React from "react";
import { RegistrationData } from "./Types";

interface SlotCellProps {
  status: "na" | "available" | "unavailable";
  societyNames?: string[];
  classTitle?: string;
  classTime?: string;
  registration?: RegistrationData;
  isSelected?: boolean;
  onClick: () => void;
}

const SlotCell: React.FC<SlotCellProps> = ({
  status,
  societyNames,
  classTitle,
  classTime,
  registration,
  isSelected,
  onClick,
}) => {
  const hasSocs = societyNames && societyNames.length > 0;

  let cellClass = "cell ";
  let badge: React.ReactNode = null;
  let info: React.ReactNode = null;

  if (classTitle) {
    const isTrial = classTitle.toLowerCase().includes("free trial");

    if (isTrial && registration) {
      // Demo slot — check payment
      const isPaid = registration.paymentAmount > 0;
      cellClass += isPaid ? "booked" : "booked";
      badge = isPaid
        ? <span className="c-badge b-paid">PAID</span>
        : <span className="c-badge b-demo">DEMO</span>;
      info = (
        <>
          {classTime && (
            <div className="c-time" style={{ color: isPaid ? "var(--green)" : "var(--orange, #e67e22)" }}>
              {classTime}
            </div>
          )}
          <div className="c-text">
            <strong>{registration.participantName || classTitle}</strong>
          </div>
          {registration.societyName && (
            <div className="c-soc" style={{ fontSize: 10, marginTop: 2 }}>
              {registration.societyName}
            </div>
          )}
          {registration.address && (
            <div className="c-text" style={{ fontSize: 8, color: "var(--black)", marginTop: 1 }}>
              📍 {registration.address}
            </div>
          )}
        </>
      );
    } else {
      // Regular class (not a trial)
      cellClass += "booked";
      badge = <span className="c-badge b-class">CLASS</span>;
      info = (
        <>
          {classTime && (
            <div className="c-time" style={{ color: "var(--violet)" }}>
              {classTime}
            </div>
          )}
          <div className="c-text">
            <strong>{classTitle}</strong>
          </div>
        </>
      );
    }
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
