"use client";
import GalleryUploadModal from "@/components/global/modal/GalleryUploadModal";
import ImageUploadModal from "@/components/global/modal/ImageUploadModal ";
import { useState } from "react";

const ImageUploadComponent = () => {
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  const openGalleryModal = () => setIsGalleryModalOpen(true);
  const closeGalleryModal = () => setIsGalleryModalOpen(false);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-semibold my-6">Image Manager </h1>
      <button
        className="bg-primary text-white py-2 px-4 rounded"
        onClick={openGalleryModal}
      >
        Open Image Manager
      </button>

      <GalleryUploadModal isGalleryOpen={isGalleryModalOpen} onGalleryClose={closeGalleryModal} />
    </div>
  );
};

export default ImageUploadComponent;
