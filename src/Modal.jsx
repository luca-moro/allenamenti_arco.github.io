import React from "react";

const Modal = ({ message, onClose }) => {
  return (
    <div
      className="modal-overlay fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="modal-container bg-white p-8 rounded-lg shadow-lg w-96"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <h2 className="text-2xl font-bold mb-4 text-red-500">AVVISO</h2>
        <p className="text-lg">{message}</p>
        <div className="mt-4 flex justify-end">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
