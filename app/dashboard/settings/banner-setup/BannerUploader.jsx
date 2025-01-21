"use client";
import { useEffect, useState } from "react";

export default function BannerUploader() {
  const [imagePreview, setImagePreview] = useState("");
  const [sliderImages, setSliderImages] = useState([
    "https://www.bestelectronics.com.bd/wp-content/uploads/slider/cache/d73ee2d602ebc28b6eacc24e757ade71/Mobile-view-1.jpg",

    "https://www.bestelectronics.com.bd/wp-content/uploads/slider/cache/94c37242d30a7c282977c970e10d34bc/Happy-Club-WEB-Banner.jpg",
    "https://www.bestelectronics.com.bd/wp-content/uploads/slider/cache/3d8206220e20eaa2255b396d471e693d/600.jpg",
    "https://www.bestelectronics.com.bd/wp-content/uploads/slider/cache/8a312cb7126eab350bc78b25af250316/website-banner.webp",
    "https://scontent.fdac14-1.fna.fbcdn.net/v/t1.6435-9/41522493_2133850473348481_7535409830366806016_n.png?_nc_cat=100&ccb=1-7&_nc_sid=2a1932&_nc_ohc=5o4VUR_V8rwQ7kNvgGNG9A9&_nc_ht=scontent.fdac14-1.fna&oh=00_AYC9bmh3Xz5m5gZZpPSYfHhutYgAP7NEo_vYwaV6cXVq9w&oe=6724AD28",

    "https://www.bestelectronics.com.bd/wp-content/uploads/slider/cache/b528a877cc084af115d30967eb44aa61/365-exchange1920x600.jpg",
    "https://www.bestelectronics.com.bd/wp-content/uploads/slider/cache/e7fe3faa4e3bce163545b8a5961075ba/Web-Slider1921x601.jpg",
  ]);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const handleDragStart = (event, index) => {
    event.dataTransfer.setData("text/plain", index);
  };

  const handleDrop = (event, index) => {
    const draggedIndex = event.dataTransfer.getData("text/plain");
    const newSliderImages = [...sliderImages];

    const [movedImage] = newSliderImages.splice(draggedIndex, 1);
    newSliderImages.splice(index, 0, movedImage);

    setSliderImages(newSliderImages);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
  };

  const handleDeleteImage = (index) => {
    const updatedImages = sliderImages.filter((_, i) => i !== index);
    setSliderImages(updatedImages);
  };

  const handleEditImage = (index) => {
    alert(`Edit image at index ${index}`);
  };

  return (
    <div
      className={`max-w-full mx-auto p-8 bg-white shadow-lg rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6`}
    >
      <div className="md:col-span-2 mb-6">
        <h2 className="text-xl font-bold mb-4">All Slider Images</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sliderImages.length > 0 ? (
            sliderImages.map((image, index) => (
              <div
                key={index}
                className="relative border rounded-lg overflow-hidden group"
                draggable
                onDragStart={(event) => handleDragStart(event, index)}
                onDrop={(event) => handleDrop(event, index)}
                onDragOver={handleDragOver}
              >
                <img
                  className="w-full h-24 object-fit"
                  src={image}
                  alt={`Slider ${index + 1}`}
                />
                {/* Edit and Delete Icons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <button
                    onClick={() => handleEditImage(index)}
                    className="bg-white p-1 rounded-full shadow mr-1 hover:bg-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232a2.5 2.5 0 013.536 0l.758.758a2.5 2.5 0 010 3.536l-1.293 1.293-4.25-4.25 1.293-1.293zM5 13.414L9.586 9l4.25 4.25L9.25 17.664a2.5 2.5 0 01-3.536 0l-2.121-2.121a2.5 2.5 0 010-3.536L5 13.414z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteImage(index)}
                    className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No slider images found</p>
          )}
        </div>
      </div>

      <div className="uploader-section">
        <h2 className="text-xl font-bold mb-4">Upload Product Banner</h2>
        <form action="">
          <div className="mb-4">
            <label className="block font-medium mb-2">Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full p-2 border rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2">Position</label>
            <div className="grid grid-cols-5 md:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((position) => (
                <div
                  key={position}
                  onClick={() => handlePositionSelect(position)}
                  className={`p-4 border rounded-lg text-center cursor-pointer 
                  ${
                    selectedPosition === position
                      ? "bg-primary text-white"
                      : "bg-gray-100"
                  } 
                  transition duration-700 ease-in-out transform hover:scale-105`}
                >
                  {position}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2">URL</label>
            <input
              type="url"
              className="block w-full p-2 border rounded-lg focus:outline-0"
            />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center mb-6 md:space-x-5">
            <div className="flex flex-shrink items-center space-x-5">
              <div className="flex items-center cursor-pointer">
                <input
                  id="active"
                  type="checkbox"
                  checked
                  className="h-5 w-5 rounded-lg"
                />
                <label htmlFor="active" className="ml-3 text-sm font-medium">
                  Active
                </label>
              </div>
              <div className="flex items-center cursor-pointer">
                <input
                  id="always-first"
                  type="checkbox"
                  className="h-5 w-5 rounded-lg"
                />
                <label
                  htmlFor="always-first"
                  className="ml-3 text-sm font-medium"
                >
                  Always First
                </label>
              </div>
            </div>
            <div className="flex flex-shrink items-center space-x-5">
              <div className="flex items-center cursor-pointer">
                <input
                  id="both-device"
                  type="checkbox"
                  checked
                  className="h-5 w-5 rounded-lg"
                />
                <label
                  htmlFor="both-device"
                  className="ml-3 text-sm font-medium"
                >
                  Both Device
                </label>
              </div>
              <div className="flex items-center cursor-pointer">
                <input
                  id="mobile"
                  type="checkbox"
                  className="h-5 w-5 rounded-lg"
                />
                <label htmlFor="mobile" className="ml-3 text-sm font-medium">
                  Mobile
                </label>
              </div>
              <div className="flex items-center cursor-pointer">
                <input
                  id="web"
                  type="checkbox"
                  className="h-5 w-5 rounded-lg"
                />
                <label htmlFor="web" className="ml-3 text-sm font-medium">
                  Web
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-[#f26422eb]"
          >
            Submit
          </button>
        </form>
      </div>

      <div className="preview-section hidden md:block">
        <h2 className="text-xl font-bold mb-4">Preview</h2>
        <div className="border rounded-lg p-4 h-96 bg-gray-100 flex items-center justify-center">
          {imagePreview ? (
            <img
              className="max-h-full max-w-full"
              src={imagePreview}
              alt="Preview"
            />
          ) : (
            <p>No Image</p>
          )}
        </div>
      </div>
    </div>
  );
}
