import React from 'react';

export default function Pagination() {
  return (
    <div className="pagination">
      <button className="pg-btn" disabled>«</button>
      <button className="pg-btn active">1</button>
      <div className="pg-info"></div>
    </div>
  );
}
