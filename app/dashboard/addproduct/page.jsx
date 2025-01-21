"use client";
import * as XLSX from "xlsx";
import AddProductDynamicHead from "@/components/dashboard/addproduct/DynamicHead";
import AddProductRichText from "@/components/dashboard/addproduct/ProductRichText";
import AddProductShortDesRichText from "@/components/dashboard/addproduct/ProductShortDesRichText";
import { fetchCategories } from "@/redux/slice/categorySlice";
import { fetchApi } from "@/utils/FetchApi";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../loading";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { removeImage } from "@/redux/slice/imagesSlice";
import ImageUploadModal from "@/components/global/modal/ImageUploadModal ";
import GalleryUploadModal from "@/components/global/modal/GalleryUploadModal";
import {
  removeAllGalleryImages,
  removeGalleryImage,
} from "@/redux/slice/gallerySlice";

export default function AddProductPage() {
  const [tagValueArray, setTagValueArray] = useState([]);
  const [tagInputValue, setTagInputValue] = useState("");
  const [productGallery, setProductGallery] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [categoryTab, setCategoryTab] = useState("all");
  const [brandTab, setBrandTab] = useState("brand");
  const [productBrand, setProductBrand] = useState("");
  const [categoryId, setCategoryId] = useState([]);
  const [productStatus, setProductStatus] = useState("Draft");
  const [titleInputValue, setTitleInputValue] = useState("");
  const [descriptionInputValue, setDescriptionInputValue] = useState("");
  const [brandName, setBrandName] = useState("");
  const [specData, setSpecData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  const dispatch = useDispatch();
  const categories = useSelector((state) => state?.categories);
  const user = useSelector((state) => state.user?.items || {});
  const selectedImages = useSelector((state) => state.images.selectedImages);
  const selectedGalleryImages = useSelector(
    (state) => state.gallery.selectedGalleryImages
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchApi("/brand/getAll", "GET");
        setProductBrand(response?.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("Description", "");
    localStorage.setItem("ShortDescription", "");
  }, []);

  const router = useRouter();

  const AllCategories = categories?.categories?.categories;

  const calculateTitleProgress = (value) => {
    let progress = (value.length / 100) * 100;
    progress = Math.min(progress, 100);
    return progress;
  };
  const calculateDescriptionProgress = (value) => {
    let progress = (value.length / 200) * 100;
    progress = Math.min(progress, 100);
    return progress;
  };
  const getTitleProgressBarColor = () => {
    const progress = calculateTitleProgress(titleInputValue);
    if (progress < 30) {
      return "bg-primary";
    } else if (progress <= 60) {
      return "bg-[#7AD03A]";
    } else {
      return "bg-primary";
    }
  };
  const getDescriptionProgressBarColor = () => {
    const progress = calculateDescriptionProgress(descriptionInputValue);
    if (progress < 30) {
      return "bg-primary";
    } else if (progress <= 100) {
      return "bg-[#7AD03A]";
    } else {
      return "bg-primary";
    }
  };
  const handleTitleInputChange = (event) => {
    setTitleInputValue(event.target.value);
  };
  const handleDescriptionInputChange = (event) => {
    setDescriptionInputValue(event.target.value);
  };

  const handleTagValue = (e) => {
    e.preventDefault();
    const newTagValueArray = [...tagValueArray, tagInputValue];
    setTagValueArray(newTagValueArray);
    setTagInputValue("");
  };
  const handleRemoveTag = (indexToRemove) => {
    const newTagValueArray = tagValueArray.filter(
      (_, index) => index !== indexToRemove
    );
    setTagValueArray(newTagValueArray);
  };
  const toggleProductStatus = () => {
    setProductStatus(productStatus === "Draft" ? "Published" : "Draft");
  };
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const productDescription = localStorage.getItem("Description") || "";
    const productShortDescription =
      localStorage.getItem("ShortDescription") || "";

    const productData = {
      productName: e.target.productName.value,
      categoryId: categoryId,
      productBrand: e.target.productBrand.value,
      productImage: selectedImages || "https://i.ibb.co/sqPhfrt/notimgpng.png",
      isTrash: false,
      productGallery: selectedGalleryImages,
      productVideos: [],
      productSpecification: specData,
      productDescription: productDescription,
      productShortDescription: productShortDescription,
      productStatus: productStatus,
      seo: {
        productTitle:
          titleInputValue ||
          e.target.productName.value + " at Best Electronics",
        prodDescription: descriptionInputValue,
        productTags: tagValueArray,
        productNotes: e.target.productNotes.value,
      },
      general: {
        regularPrice: parseFloat(e.target.regularPrice?.value) || 0,
        salePrice:
          parseFloat(e.target.salePrice?.value) ||
          parseFloat(e.target.regularPrice?.value),
        taxStatus: e.target.taxStatus?.value || "",
        taxClass: e.target.taxClass?.value || "",
      },
      inventory: {
        sku: e.target.productSku?.value || "",
        stockManagement: e.target.stockManagement?.checked || false,
        stockStatus: e.target.stockStatus?.value || "Out of Stock",
        soldIndividually: e.target.soldIndividually?.checked || false,
        inventoryStatus: e.target.inventoryStatus?.value || "Online & Offline",
      },
      shipping: {
        weight: parseFloat(e.target.weight?.value) || 0,
        productDimensions: {
          length: parseFloat(e.target.length?.value) || 0,
          width: parseFloat(e.target.width?.value) || 0,
          height: parseFloat(e.target.height?.value) || 0,
        },
      },
      date: new Date().toISOString(),
    };

    console.log("Product Data:", productData);

    setIsLoading(true);
    try {
      const response = await fetchApi(
        "/product/addProduct",
        "POST",
        productData
      );

      setIsLoading(false);

      if (response) {
        localStorage.removeItem("Description");
        localStorage.removeItem("ShortDescription");
        dispatch(removeAllGalleryImages());
        dispatch(removeImage());
        router.push("/dashboard/products");
      } else {
        const errorData = await response.json();
        console.log("Failed to add product:", errorData);
      }
    } catch (err) {
      setIsLoading(false);
      console.log("An error occurred:", err);
    }
  };
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Convert the data to an array of objects with key-value pairs
        const result = json
          .filter((row) => row[0] && row[1]) // Filter out rows without both key and value
          .map((row) => ({ key: row[0], value: row[1] })); // Create key-value pairs

        setSpecData(result);
      };
      reader.readAsArrayBuffer(file);
    }
  };
  const handleCreateBrand = async (e) => {
    e.preventDefault();
    const brandData = {
      name: brandName,
      title: "Best Electronics",
      description:
        "Best Electronics is a leading electronics store in Bangladesh.",
    };
    try {
      const response = await fetchApi("/brand/create", "POST", brandData);
      console.log("Brand Response:", response);
    } catch (error) {
      console.error("Error creating brand:", error);
    }
    console.log("Brand Data:", brandData);
  };
  const handleRemoveProductPicture = () => {
    dispatch(removeImage());
  };
  const handleRemoveProductGallery = async (image) => {
    dispatch(removeGalleryImage(image));
  };
  const renderCategoryList = (categories, parentIndex = "") => {
    return categories?.map((category, index) => {
      const uniqueIndex = `${parentIndex}-${index}`;
      return (
        <ul key={uniqueIndex} className="font-semibold">
          <li className="text-md flex justify-start items-center gap-2 mb-1">
            <div className="flex items-center">
              <input
                id={`checkbox-${uniqueIndex}`}
                type="checkbox"
                onClick={() => categoryId.push(category?._id)}
                className="w-4 h-4 bg-gray-500 rounded"
              />
            </div>
            {category.categoryName}
          </li>
          {category?.subCategories?.length > 0 && (
            <li>
              <ul className="ml-5">
                {renderCategoryList(category.subCategories, uniqueIndex)}
              </ul>
            </li>
          )}
        </ul>
      );
    });
  };
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openGalleryModal = () => setIsGalleryModalOpen(true);
  const closeGalleryModal = () => setIsGalleryModalOpen(false);

  return (
    <main className="">
      {isLoading && <Loading />}

      <form onSubmit={handleAddProduct}>
        <section className="mt-10 flex justify-between items-center">
          <AddProductDynamicHead title={"Add New Product"} />
          <button
            type="submit"
            className={`text-sm text-white bg-black rounded-md px-3 py-2 ${categoryId === "" ? "cursor-not-allowed" : "cursor-pointer"
              }`}
          >
            {isLoading ? "Adding Product..." : "Add Product"}
          </button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 justify-between items-start gap-5 w-full my-10">
          <div className="flex flex-col justify-start items-center w-full md:col-span-2 space-y-5">
            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-3">General</h5>
              <div className="grid grid-cols-1">
                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="productName"
                    className="text-sm font-semibold text-gray-600"
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    required
                    className="border border-gray-300 rounded-md p-2 focus:outline-none "
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 justify-between items-start">
                <div className="flex flex-col justify-between items-start space-y-3">
                  <h5 className="text-md font-bold mb-3">Featured Image</h5>
                  <div className="flex flex-col w-full">
                    {selectedImages && (
                      <div className={` flex flex-col w-full`}>
                        <Image
                          width={200}
                          height={200}
                          src={selectedImages}
                          alt="Uploaded"
                          className="w-full h-full rounded-md"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveProductPicture}
                          className="text-sm text-red-500 flex justify-start py-2 underline underline-offset-2"
                        >
                          Remove product Image
                        </button>
                      </div>
                    )}

                    {!selectedImages ? (
                      <div
                        onClick={openModal}
                        className={` flex flex-col w-full`}
                      >
                        <div className="z-20 flex flex-col-reverse items-center justify-center w-full h-[200px] cursor-pointer border py-20 bg-gray-200 rounded-md">
                          <svg
                            width="21"
                            height="20"
                            viewBox="0 0 21 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.0925 2.4917C6.35684 2.4917 4.48901 2.4917 3.32849 3.65177C2.16797 4.81185 2.16797 6.67896 2.16797 10.4132C2.16797 14.1473 2.16797 16.0145 3.32849 17.1746C4.48901 18.3347 6.35684 18.3347 10.0925 18.3347C13.8281 18.3347 15.6959 18.3347 16.8565 17.1746C18.017 16.0145 18.017 14.1473 18.017 10.4132V9.99626"
                              stroke="black"
                              strokeWidth="1.25"
                              strokeLinecap="round"
                            />
                            <path
                              d="M4.66602 17.4913C8.17433 13.5319 12.117 8.28093 17.9993 12.2192"
                              stroke="black"
                              strokeWidth="1.25"
                            />
                            <path
                              d="M15.4982 1.66504V8.33847M18.8362 4.98087L12.1602 4.99327"
                              stroke="black"
                              strokeWidth="1.25"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  {!selectedImages && (
                    <div className="mt-5">
                      <p className="text-xs text-red-500">
                        * Upload an image for the product
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between items-start space-y-3">
                  <h5 className="text-md font-bold mb-3">Image Gallery</h5>
                  <div className="grid grid-cols-3 justify-between items-start gap-5 w-full">
                    {selectedGalleryImages.map((image, index) => (
                      <div className="relative" key={index}>
                        <Image
                          width={100}
                          height={100}
                          src={image}
                          alt="Uploaded"
                          className="object-cover rounded-md w-full h-[90px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveProductGallery(image)}
                          className="absolute -top-1 -right-1 bg-red-400 w-5 h-5 rounded-full font-bold text-sm text-white flex justify-center items-center pb-1 shadow-md"
                        >
                          x
                        </button>
                      </div>
                    ))}

                    <div onClick={openGalleryModal}>
                      <label
                        htmlFor="galleryImageUpload"
                        className="z-20 flex flex-col-reverse items-center justify-center w-full h-[90px] cursor-pointer border py-2 bg-gray-200 rounded-md"
                      >
                        <svg
                          width="21"
                          height="20"
                          viewBox="0 0 21 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.0925 2.4917C6.35684 2.4917 4.48901 2.4917 3.32849 3.65177C2.16797 4.81185 2.16797 6.67896 2.16797 10.4132C2.16797 14.1473 2.16797 16.0145 3.32849 17.1746C4.48901 18.3347 6.35684 18.3347 10.0925 18.3347C13.8281 18.3347 15.6959 18.3347 16.8565 17.1746C18.017 16.0145 18.017 14.1473 18.017 10.4132V9.99626"
                            stroke="black"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                          />
                          <path
                            d="M4.66602 17.4913C8.17433 13.5319 12.117 8.28093 17.9993 12.2192"
                            stroke="black"
                            strokeWidth="1.25"
                          />
                          <path
                            d="M15.4982 1.66504V8.33847M18.8362 4.98087L12.1602 4.99327"
                            stroke="black"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold">Product SEO</h5>
              <div className="mt-5">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div className="p-3 border bg-white rounded-md shadow-md w-full mb-5 md:col-span-2">
                    <div>
                      <div className="flex justify-start items-center gap-3">
                        <Image
                          width={50}
                          height={50}
                          src="https://i.ibb.co/2k6sk2y/cropped-Favicon.png"
                          alt="cropped-Favicon"
                          border="0"
                          className="w-7 h-7 p-1 object-cover rounded-full bg-gray-200"
                        />
                        <div className="flex flex-col">
                          <p>Best Electronics</p>
                          <p className="text-xs">
                            www.bestelectronics.com.bd - Electronics Store
                          </p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-[#3764D7] text-lg font-semibold mt-3">
                          {titleInputValue}
                        </h3>
                      </div>
                      <div className="grid grid-cols-3 justify-between items-start gap-3 mt-3 text-md">
                        <div className="col-span-2">
                          <span>{descriptionInputValue}</span>
                        </div>
                        <Image
                          width={200}
                          height={200}
                          src={
                            selectedImages ||
                            "https://i.ibb.co/sqPhfrt/notimgpng.png"
                          }
                          alt="Deep-Blue-300x300"
                          className="w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div></div>
                </div>

                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="seoTitle"
                    className="text-sm font-semibold text-gray-600"
                  >
                    SEO Title
                  </label>
                  <input
                    type="text"
                    id="seoTitle"
                    value={titleInputValue}
                    onChange={handleTitleInputChange}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none"
                  />
                  <div className="w-full h-2 bg-gray-300 rounded-full">
                    <div
                      className={`h-full ${getTitleProgressBarColor()} rounded-lg`}
                      style={{
                        width: `${calculateTitleProgress(titleInputValue)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex flex-col space-y-1 w-full mt-5">
                  <label
                    htmlFor="seoDescription"
                    className="text-sm font-semibold text-gray-600"
                  >
                    SEO Description
                  </label>
                  <textarea
                    id="seoDescription"
                    name="seoDescription"
                    value={descriptionInputValue}
                    onChange={handleDescriptionInputChange}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none"
                  />
                  <div className="w-full h-2 bg-gray-300 rounded-full">
                    <div
                      className={`h-full ${getDescriptionProgressBarColor()} rounded-lg`}
                      style={{
                        width: `${calculateDescriptionProgress(
                          descriptionInputValue
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 justify-between items-start">
                <div className="flex flex-col justify-between items-start space-y-3">
                  <h5 className="text-md font-bold mb-3">Featured Video</h5>
                  <div className="flex flex-col w-full">
                    <input
                      type="file"
                      id="featuredVideoUpload"
                      className="hidden"
                    />
                    <label
                      htmlFor="featuredVideoUpload"
                      className="z-20 flex flex-col-reverse items-center justify-center h-[430px] cursor-pointer border py-20 bg-gray-200 rounded-md"
                    >
                      <svg
                        width="21"
                        height="20"
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.16602 5.8335H17.9993"
                          stroke="black"
                          strokeWidth="1.25"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14.25 1.66675L11.75 5.83341"
                          stroke="black"
                          strokeWidth="1.25"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.41602 1.6665L5.91602 5.83317"
                          stroke="black"
                          strokeWidth="1.25"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10.0827 17.4998C6.35073 17.4998 4.48476 17.4998 3.32538 16.3405C2.16602 15.1811 2.16602 13.3151 2.16602 9.58317C2.16602 5.85122 2.16602 3.98525 3.32538 2.82587C4.48476 1.6665 6.35073 1.6665 10.0827 1.6665C13.8146 1.6665 15.6806 1.6665 16.84 2.82587C17.9994 3.98525 17.9993 5.85122 17.9993 9.58317"
                          stroke="black"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12.166 14.9998H18.8327M15.4993 18.3332V11.6665"
                          stroke="black"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                        />
                      </svg>
                    </label>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-start space-y-3">
                  <h5 className="text-md font-bold mb-3">Video Gallery</h5>
                  <div className="grid grid-cols-3 justify-between items-start gap-5 ">
                    <div>
                      <input
                        type="file"
                        id="galleryVideoUpload"
                        className="hidden "
                      />
                      <label
                        htmlFor="galleryVideoUpload"
                        className="z-20 flex flex-col-reverse items-center justify-center w-[95px] h-[160px] cursor-pointer border py-2 bg-gray-200 rounded-md"
                      >
                        <svg
                          width="21"
                          height="20"
                          viewBox="0 0 21 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.16602 5.8335H17.9993"
                            stroke="black"
                            strokeWidth="1.25"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14.25 1.66675L11.75 5.83341"
                            stroke="black"
                            strokeWidth="1.25"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8.41602 1.6665L5.91602 5.83317"
                            stroke="black"
                            strokeWidth="1.25"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10.0827 17.4998C6.35073 17.4998 4.48476 17.4998 3.32538 16.3405C2.16602 15.1811 2.16602 13.3151 2.16602 9.58317C2.16602 5.85122 2.16602 3.98525 3.32538 2.82587C4.48476 1.6665 6.35073 1.6665 10.0827 1.6665C13.8146 1.6665 15.6806 1.6665 16.84 2.82587C17.9994 3.98525 17.9993 5.85122 17.9993 9.58317"
                            stroke="black"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                          />
                          <path
                            d="M12.166 14.9998H18.8327M15.4993 18.3332V11.6665"
                            stroke="black"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                          />
                        </svg>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-3">Product Description</h5>
              <AddProductRichText preValue="" />
            </div>

            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-3">Product Data</h5>
              <div className="flex justify-between items-center gap-5 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab("general")}
                  className={`${activeTab === "general"
                      ? "border-gray-500 text-black "
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } flex items-center py-2 px-4 border-b-2 text-center font-medium focus:outline-none bg-gray-100 w-full rounded-md`}
                >
                  General
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("inventory")}
                  className={`${activeTab === "inventory"
                      ? "border-gray-500 text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } flex items-center py-2 px-4 border-b-2 text-center font-medium focus:outline-none bg-gray-100 w-full rounded-md`}
                >
                  Inventory
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("shipping")}
                  className={`${activeTab === "shipping"
                      ? "border-gray-500 text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } flex items-center py-2 px-4 border-b-2 text-center font-medium focus:outline-none bg-gray-100 w-full rounded-md`}
                >
                  Shipping
                </button>
              </div>
              <div>
                <div
                  className={`
                  ${activeTab == "general" ? "block" : "hidden"}
                  `}
                >
                  <div className="grid grid-cols-2 gap-3 border-b-2 pb-5">
                    <div className="flex flex-col space-y-1 w-full">
                      <label
                        htmlFor="regularPrice"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Regular Price
                      </label>
                      <input
                        type="number"
                        id="regularPrice"
                        name="regularPrice"
                        required
                        className="border border-gray-300 rounded-md p-2 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-1 w-full">
                      <label
                        htmlFor="salePrice"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Sale Price
                      </label>
                      <input
                        type="number"
                        id="salePrice"
                        name="salePrice"
                        className="border border-gray-300 rounded-md p-2 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-1 w-full">
                      <label
                        htmlFor="salesStart"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Sale Start (Optional)
                      </label>
                      <input
                        type="date"
                        id="salesStart"
                        name="salesStart"
                        defaultValue={new Date().toISOString().split("T")[0]}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-1 w-full">
                      <label
                        htmlFor="salesEnd"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Sale End (Optional)
                      </label>
                      <input
                        type="date"
                        id="salesEnd"
                        name="salesEnd"
                        defaultValue={new Date().toISOString().split("T")[0]}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="taxStatus"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Tax Status
                      </label>
                      <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                        <select
                          id="taxStatus"
                          name="taxStatus"
                          className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                        >
                          <option value="Taxable">Taxable</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="taxClass"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Tax Class
                      </label>
                      <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                        <select
                          id="taxClass"
                          name="taxClass"
                          className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                        >
                          <option value="Standard">Standard</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="inventoryStatus"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Inventory Status
                      </label>
                      <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                        <select
                          id="inventoryStatus"
                          name="inventoryStatus"
                          className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                        >
                          <option value="Online & Offline">
                            Online & Offline
                          </option>
                          <option value="Only Online">Only Online</option>
                          <option value="Only Offline">Only Offline</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`
                  ${activeTab == "inventory" ? "block" : "hidden"}
                  `}
                >
                  <div className="grid grid-cols-2 justify-between items-center">
                    <label htmlFor="productSku">SKU</label>
                    <input
                      type="text"
                      id="productSku"
                      name="productSku"
                      className="border border-gray-300 rounded-md p-2 focus:outline-none uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-2 justify-between items-center my-5">
                    <span>Stock Management</span>
                    <div className="flex justify-start items-center gap-3">
                      <input
                        id="stockManagement"
                        type="checkbox"
                        name="stockManagement"
                        className="w-4 h-4 bg-gray-100 rounded border-gray-300 dark:border-gray-600"
                      />
                      <label
                        htmlFor="stockManagement"
                        className="font-semibold"
                      >
                        Track stock quantity for this product
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 justify-between items-start border-b-2 py-5">
                    <span>Stock Status</span>
                    <div>
                      <div className="flex justify-start items-center gap-3 mb-1">
                        <input
                          id="In Stock"
                          type="radio"
                          name="stockStatus"
                          value="In Stock"
                          className="w-4 h-4 bg-gray-100 rounded border-gray-300 dark:border-gray-600"
                        />
                        <label htmlFor="In Stock" className="font-semibold">
                          In Stock
                        </label>
                      </div>
                      <div className="flex justify-start items-center gap-3 mb-1">
                        <input
                          id="Out of Stock"
                          type="radio"
                          name="stockStatus"
                          value="Out of Stock"
                          className="w-4 h-4 bg-gray-100 rounded border-gray-300 dark:border-gray-600"
                        />
                        <label htmlFor="Out of Stock" className="font-semibold">
                          Out of Stock
                        </label>
                      </div>
                      <div className="flex justify-start items-center gap-3">
                        <input
                          id="On Backorder"
                          type="radio"
                          name="stockStatus"
                          value="On Backorder"
                          className="w-4 h-4 bg-gray-100 rounded border-gray-300 dark:border-gray-600"
                        />
                        <label htmlFor="On Backorder" className="font-semibold">
                          On Backorder
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 justify-between items-center mt-5">
                    <span>Sold Individually</span>
                    <div className="flex justify-start items-center gap-3">
                      <input
                        id="soldIndividually"
                        type="checkbox"
                        name="soldIndividually"
                        className="w-4 h-4 bg-gray-100 rounded border-gray-300 dark:border-gray-600"
                      />
                      <label
                        htmlFor="soldIndividually"
                        className="font-semibold"
                      >
                        Limit purchase to 1 item per order
                      </label>
                    </div>
                  </div>
                </div>
                <div
                  className={`
                  ${activeTab == "shipping" ? "block" : "hidden"}
                  `}
                >
                  <div className="grid grid-cols-2 justify-between items-center">
                    <span>Weight (KG)</span>
                    <input
                      type="text"
                      id="weight"
                      name="weight"
                      className="border border-gray-300 rounded-md p-2 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 justify-between items-center py-5">
                    <span>Dimension</span>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="number"
                        id="length"
                        name="length"
                        placeholder="Length"
                        className="border border-gray-300 rounded-md p-2 focus:outline-none"
                      />
                      <input
                        type="number"
                        id="width"
                        name="width"
                        placeholder="Width"
                        className="border border-gray-300 rounded-md p-2 focus:outline-none"
                      />
                      <input
                        type="number"
                        id="height"
                        name="height"
                        placeholder="Height"
                        className="border border-gray-300 rounded-md p-2 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-3">
                Product Short Description
              </h5>
              <AddProductShortDesRichText />
            </div>

            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-3">Product Specification</h5>
              <div>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                />
                <div>
                  {specData && specData.length > 0 && (
                    <table className="w-full text-md my-10">
                      <tbody>
                        {specData.map((item, index) => (
                          <tr className="" key={index}>
                            <td className="border px-5 py-2 w-1/2">
                              {item.key}
                            </td>
                            <td className="border px-5 py-2 w-1/2">
                              {item.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end items-center w-full space-y-5">
            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-3">{productStatus}</h5>
              <div className="mt-3 font-semibold text-sm">
                <div>
                  <span>Status: {productStatus}</span>
                </div>
                <div className="mt-3">
                  <span>Published on: {new Date().toDateString()} </span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleProductStatus}
                className="text-white text-sm bg-black px-3 py-2 rounded-md mt-5 w-full uppercase font-semibold hover:bg-gray-800 focus:outline-none"
              >
                Toggle to
                {productStatus === "Published" ? " Draft" : " Published"}
              </button>
            </div>

            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-3">Product Categories</h5>
              <div className="flex justify-between items-center gap-5 mb-5">
                <button
                  type="button"
                  className={`${categoryTab === "all"
                      ? "border-gray-500 text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } flex items-center py-2 px-4 border-b-2 text-center font-medium focus:outline-none bg-gray-100 w-full rounded-md`}
                  onClick={() => setCategoryTab("all")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`${categoryTab === "popular"
                      ? "border-gray-500 text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } flex items-center py-2 px-4 border-b-2 text-center font-medium focus:outline-none bg-gray-100 w-full rounded-md`}
                  onClick={() => setCategoryTab("popular")}
                >
                  Popular
                </button>
              </div>
              <div
                className={`
                ${categoryTab === "all" ? "block" : "hidden"
                  } h-52 overflow-y-scroll
                `}
              >
                {renderCategoryList(AllCategories)}
              </div>
              <div
                className={`
                ${categoryTab === "popular" ? "block" : "hidden"}
                `}
              >
                Non Found For This Time
              </div>
            </div>

            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-3">Product Tags</h5>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  id="productTag"
                  value={tagInputValue}
                  onChange={(e) => setTagInputValue(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none col-span-3"
                />
                <button
                  onClick={handleTagValue}
                  className="border text-black font-semibold rounded-md"
                >
                  Add
                </button>
              </div>
              <div className="my-3 flex flex-wrap justify-start items-center gap-2">
                {tagValueArray.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded-full px-3 py-1 flex justify-between items-center "
                  >
                    <span className="text-md text-black">{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(index)}
                      className="text-gray-300 font-semibold ml-2"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-3">Product Brand</h5>
              <div className="flex justify-between items-center gap-5 mb-5">
                <button
                  type="button"
                  className={`${brandTab === "brand"
                      ? "border-gray-500 text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } flex items-center py-2 px-4 border-b-2 text-center font-medium focus:outline-none bg-gray-100 w-full rounded-md`}
                  onClick={() => setBrandTab("brand")}
                >
                  Brand
                </button>
                <button
                  type="button"
                  className={`${brandTab === "new"
                      ? "border-gray-500 text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } flex items-center py-2 px-4 border-b-2 text-center font-medium focus:outline-none bg-gray-100 w-full rounded-md`}
                  onClick={() => setBrandTab("new")}
                >
                  Add New Brand
                </button>
              </div>
              <div
                className={`
                ${brandTab === "brand" ? "block" : "hidden"}
                `}
              >
                <div className="relative flex border border-gray-300 px-2 mt-1 w-full rounded-md bg-white hover:border-gray-400">
                  {productBrand?.length > 0 && (
                    <select
                      id="productBrand"
                      name="productBrand"
                      required
                      className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                    >
                      <option value="">Select a brand </option>
                      {productBrand?.map((brand, index) => (
                        <option key={index} value={brand?._id}>
                          {brand?.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div
                className={`
                ${brandTab === "new" ? "block" : "hidden"}
                `}
              >
                <input
                  type="text"
                  id="brandName"
                  name="brandName"
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Brand Name"
                  className="border border-gray-300 rounded-md p-2 focus:outline-none w-full"
                />
                <button
                  type="button"
                  onClick={handleCreateBrand}
                  className="text-white text-sm bg-black px-3 py-2 rounded-md mt-5 w-full uppercase font-semibold hover:bg-gray-800 focus:outline-none"
                >
                  Add Brand
                </button>
              </div>
            </div>

            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-3">Product Notes</h5>
              <div className="w-full bg-gray-100 p-3 mb-5 rounded-md">
                <p className="mb-3">
                  Payment to be made upon delivery. Order status changed from
                  Pending payment to Processing.
                </p>
                <p className="text-gray-600">Feb 28, 2024, 17:59</p>
              </div>
              <div className="flex flex-col space-y-1">
                <label
                  htmlFor="productNotes"
                  className="text-sm font-semibold text-gray-600"
                >
                  Note
                </label>
                <textarea
                  id="productNotes"
                  name="productNotes"
                  className="border border-gray-300 rounded-md p-2 focus:outline-none "
                />
              </div>
            </div>
          </div>
        </section>
      </form>

      <div>
        <ImageUploadModal isOpen={isModalOpen} onClose={closeModal} />
        <GalleryUploadModal
          isGalleryOpen={isGalleryModalOpen}
          onGalleryClose={closeGalleryModal}
        />
      </div>
    </main>
  );
}
