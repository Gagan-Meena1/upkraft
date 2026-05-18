import React from "react";

interface ToastProps {
  message: string;
  visible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, visible }) => {
  return (
    <div className={`sm-toast${visible ? " show" : ""}`}>
      {message}
    </div>
  );
};

export default Toast;
