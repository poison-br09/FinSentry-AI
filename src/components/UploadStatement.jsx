import React, { useRef } from "react";

const UploadStatement = ({ files, setFiles, dropzoneDisabled }) => {
  const dropRef = useRef(null);

  // Drag and drop handlers
  React.useEffect(() => {
    const dropArea = dropRef.current;
    if (!dropArea) return;
    const handleDragOver = (e) => {
      e.preventDefault();
      dropArea.classList.add("ring-2", "ring-blue-400");
    };
    const handleDragLeave = (e) => {
      e.preventDefault();
      dropArea.classList.remove("ring-2", "ring-blue-400");
    };
    const handleDrop = (e) => {
      e.preventDefault();
      dropArea.classList.remove("ring-2", "ring-blue-400");
      if (dropzoneDisabled) return;
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(droppedFiles);
    };
    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("drop", handleDrop);
    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("dragleave", handleDragLeave);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, [setFiles, dropzoneDisabled]);

  const handleFileChange = (e) => {
    if (dropzoneDisabled) return;
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  return (
    <label
      ref={dropRef}
      htmlFor="file-upload"
      className={`w-full cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl px-4 py-8 mb-6 bg-gray-50 transition-all duration-150 hover:border-blue-400 focus-within:border-blue-400 ${dropzoneDisabled ? 'opacity-60 pointer-events-none' : ''}`}
      tabIndex={0}
    >
      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0v1a2 2 0 002 2h2a2 2 0 002-2v-1" />
      </svg>
      <span className="font-semibold text-gray-700 text-lg mb-1">{files.length ? files.map(f => f.name).join(", ") : "Choose file"}</span>
      <span className="text-gray-500 text-base">Drag and drop a file here, or click to select</span>
      <input
        id="file-upload"
        type="file"
        multiple
        accept=".csv,.xlsx,.xls,.txt,.pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff,.tif"
        className="hidden"
        onChange={handleFileChange}
        disabled={dropzoneDisabled}
      />
    </label>
  );
};

export default UploadStatement;
