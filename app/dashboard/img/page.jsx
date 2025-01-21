"use client";
import useImgBBUpload from "@/utils/useImgBBUpload";
import Image from "next/image";
import { useState } from "react";

export default function YourComponent() {
  const [image, setImage] = useState(null);
  const { uploading, error, imageUrl, handleUpload } = useImgBBUpload();

  const handleFileChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleUploadClick = () => {
    handleUpload(image);
  };

  return (
    <main className="my-10">
      <input type="file" multiple={true} onChange={handleFileChange} />
      <button onClick={handleUploadClick} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {imageUrl && (
        <div>
          <p>Image uploaded successfully:</p>
          <Image
            width={200}
            height={200}
            src={imageUrl}
            alt="Uploaded"
            style={{ maxWidth: "100%" }}
          />
        </div>
      )}
    </main>
  );
}
