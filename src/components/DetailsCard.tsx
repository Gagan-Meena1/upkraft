import React from 'react';

interface DetailItem {
  label: string;
  value: React.ReactNode;
  className?: string;
}

interface DetailsCardProps {
  title: string;
  items: DetailItem[];
  className?: string;
}

export const DetailsCard: React.FC<DetailsCardProps> = ({ title, items, className = '' }) => {
  return (
    <div className={`col mb-4 ${className}`}>
      <div className="personal-details card-box">
        <h6>{title}</h6>
        <ul className="details-list-personal p-0 m-0 list-unstyled">
          {items.map((item, index) => (
            <li key={index} className="d-flex align-items-center">
              <span className="name-box">{item.label} :</span>
              <span className={`details-box ${item.className || ''}`}>
                {item.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
