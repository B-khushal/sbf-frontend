import React from "react";

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
};

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <button className="absolute top-4 right-4 text-gray-600" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
