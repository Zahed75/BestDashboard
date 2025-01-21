"use client";
import { useState, useEffect } from "react";
import useImageUpload from "@/utils/useImageUpload";
import Image from "next/image";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addImage, removeImage } from "@/redux/slice/imagesSlice";

const ImageUploadModal = ({ isOpen, onClose }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imgList, setImgList] = useState([]);
  const [error, setError] = useState(null);

  const {
    uploadImage,
    isUploading,
    uploadProgress,
    error: uploadError,
    successMessage,
    activeTab,
    setActiveTab,
  } = useImageUpload();

  const dispatch = useDispatch();
  const selectedImages = useSelector((state) => state.images.selectedImages);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          "https://service.bestelectronics.com.bd/feature/api/get-all-images/"
        );
        setImgList(response?.data?.data);
      } catch (error) {
        console.error("Error fetching images:", error);
        setError("Error fetching images.");
      }
    };

    fetchImages();
  }, [activeTab]);

  const handleImageFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFile) {
      const response = await uploadImage(imageFile, "images", "product images");
    }
  };

  const handleImageSelect = (image) => {
    if (selectedImages === image.ImageUrl) {
      dispatch(removeImage(image.ImageUrl));
    } else {
      dispatch(addImage(image.ImageUrl));
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-lg overflow-y-auto max-h-[80vh] md:mx-10 mx-4 lg:max-w-6xl lg:px-10 scrollbar_hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-700">
                Upload or Select One Image
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="flex justify-center mb-6">
              <button
                className={`py-2 px-6 text-sm font-semibold ${
                  activeTab === "upload"
                    ? "text-white bg-primary"
                    : "text-gray-700 bg-gray-200"
                } rounded-l-md focus:outline-0 duration-700 ease-in-out`}
                onClick={() => setActiveTab("upload")}
              >
                Upload Images
              </button>
              <button
                className={`py-2 px-6 text-sm font-semibold ${
                  activeTab === "select"
                    ? "text-white bg-primary"
                    : "text-gray-700 bg-gray-200"
                } rounded-r-md focus:outline-0 duration-700 ease-in-out`}
                onClick={() => setActiveTab("select")}
              >
                Select Images
              </button>
            </div>

            {activeTab === "upload" && (
              <form onSubmit={handleSubmit}>
                <div
                  className="relative w-[400px] rounded-lg p-6 flex items-center justify-center cursor-pointer min-h-[50vh] mx-auto"
                  id="dropzone"
                >
                  <input
                    type="file"
                    className="absolute inset-0 w-full opacity-0"
                  />
                  <div className="text-center">
                    <img
                      className="mx-auto h-12 w-12 text-[#f26522]"
                      src="https://www.svgrepo.com/show/357902/image-upload.svg"
                      alt="pngLogo"
                    />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer"
                      >
                        <span>Drag and drop</span>
                        <span className="text-[#f26522]"> or browse</span>
                        <span> to upload</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only z-50"
                          onChange={handleImageFileChange}
                          accept="image/png, image/jpeg, image/jpg"
                        />
                      </label>
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
                </div>

                {isUploading && (
                  <p className="mt-4 text-gray-600">
                    Upload Progress: {uploadProgress}%
                  </p>
                )}
                {uploadError && (
                  <p className="mt-4 text-red-500">{uploadError}</p>
                )}
                {successMessage && (
                  <p className="mt-4 text-green-500">{successMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-primary text-white text-lg py-2 px-4 rounded-lg focus:outline-none transition ease-in-out duration-200 flex ml-auto"
                >
                  {isUploading ? "Uploading..." : "Upload Images"}
                </button>
              </form>
            )}

            {activeTab === "select" && (
              <div
                className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto min-h-[60vh] scrollbar_hidden`}
              >
                {imgList
                  .slice()
                  .reverse()
                  .map((image, i) => (
                    <div key={i} className="relative">
                      <Image
                        width={400}
                        height={400}
                        src={image.ImageUrl}
                        alt="Uploaded"
                        className={`w-full h-32 object-cover rounded-lg shadow-sm cursor-pointer ${
                          selectedImages === image.ImageUrl
                            ? "border-2 border-[#f26522]"
                            : ""
                        }`}
                        onClick={() => handleImageSelect(image)}
                      />

                      {selectedImages === image.ImageUrl && (
                        <div className="absolute top-0 right-0 bg-primary text-white p-1 h-6 w-6 flex items-center justify-center rounded-full">
                          <span className="text-sm">✔</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUploadModal;
