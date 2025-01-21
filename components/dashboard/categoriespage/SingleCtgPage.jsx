"use client";
import Skeleton from "@/components/global/skeleton/Skeleton";
import { fetchCategories } from "@/redux/slice/categorySlice";
import { fetchApi } from "@/utils/FetchApi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function SingleCtgPage({ category }) {
  const [titleInputValue, setTitleInputValue] = useState("");
  const [descriptionInputValue, setDescriptionInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const categories = useSelector((state) => state?.categories);
  const router = useRouter();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const AllCategories = categories?.categories?.categories;
  const data = AllCategories || [];

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

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    const categoryName = e.target.categoriesName.value;
    const categoryDescription = e.target.note.value;
    const parentCategory = e.target.parentCategory.value;
    const title = e.target.seoTitle.value;
    const metaDescription = e.target.seoDescription.value;

    const updatedCategory = {
      categoryName,
      categoryDescription,
      fetaureImage: "",
      parentCategory,
      title,
      metaDescription,
    };
    const catId = category?._id;

    console.log(updatedCategory, catId);
    try {
      const catId = category?._id;
      const response = await fetchApi(
        `/category/updateCategory/${catId}`,
        "PUT",
        updatedCategory
      );
      if (response) {
        setLoading(false);
        router.push("/dashboard/products/categories");
      } else {
        setLoading(false);
        console.log("Failed to update category");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const findCategoryById = (id) => {
    const parentCategory = AllCategories?.find(
      (category) => category._id === id
    );
    if (parentCategory) return parentCategory;

    for (const category of AllCategories) {
      const subCategory = category?.subCategories?.find(
        (subcategory) => subcategory._id === id
      );
      if (subCategory) return subCategory;
    }

    return null;
  };

  return (
    <main className="">
      {data.length === 0 ? (
        <Skeleton />
      ) : (
        <div>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-start items-center">
              <Link href="/dashboard/products/categories">
                <svg
                  width="19"
                  height="32"
                  className="cursor-pointer w-5 md:w-10 h-5 md:h-10"
                  viewBox="0 0 19 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17 2L3 16L17 30" stroke="black" strokeWidth="3" />
                </svg>
              </Link>

              <h1 className="text-lg md:text-5xl font-semibold ml-5">
                {category?.categoryName}
              </h1>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="w-full relative flex flex-col justify-center items-center bg-white p-4 rounded-md">
              <form onSubmit={handleUpdateCategory} className="w-full">
                <button
                  type="submit"
                  className="py-2 px-4 mt-5 bg-black text-white rounded-md mb-5 flex ml-auto"
                >
                  {loading ? "Updating..." : "Update"}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1 w-full">
                    <label
                      htmlFor="categoriesName"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Categories Name
                    </label>
                    <input
                      type="text"
                      id="categoriesName"
                      name="categoriesName"
                      defaultValue={category?.categoryName}
                      required
                      className="border border-gray-300 rounded-md p-2 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1 w-full">
                    <label
                      htmlFor="categoriesSlug"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Slug
                    </label>
                    <input
                      type="text"
                      id="categoriesSlug"
                      value={category?.slug}
                      readOnly
                      disabled
                      className="border border-gray-300 rounded-md p-2 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <label
                    htmlFor="parentCategory"
                    className="text-sm font-semibold text-gray-600"
                  >
                    Parent Categories
                  </label>
                  <br />
                  <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                    <select
                      id="parentCategory"
                      name="parentCategory"
                      className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                    >
                      {category?.parentCategory ? (
                        <option value={category?.parentCategory}>
                          {
                            findCategoryById(category?.parentCategory)
                              ?.categoryName
                          }
                        </option>
                      ) : (
                        <option value="">Select Parent Category</option>
                      )}

                      {AllCategories?.map((parentCategory) => (
                        <>
                          <option
                            value={parentCategory?._id}
                            key={parentCategory?._id}
                          >
                            {parentCategory?.categoryName}
                          </option>

                          {parentCategory?.subCategories?.map((subcategory) => (
                            <option
                              key={subcategory._id}
                              value={subcategory._id}
                              className="ml-2"
                            >
                              &nbsp;&nbsp;{subcategory?.categoryName}
                            </option>
                          ))}
                        </>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col space-y-1 w-full mt-5">
                  <label
                    htmlFor="note"
                    className="text-sm font-semibold text-gray-600"
                  >
                    Description
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    cols={30}
                    rows={3}
                    optional
                    defaultValue={category?.categoryDescription}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none w-full"
                  />
                </div>
                <div className="p-5 border bg-white rounded-md shadow-md w-full md:w-4/6 my-5">
                  <h5 className="text-md font-bold">Categories SEO</h5>
                  <div className="mt-5">
                    {/* preview */}
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
                                www.bestelectronics.com.bd 
                              </p>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-[#3764D7] text-lg font-semibold mt-3">
                              {titleInputValue || category?.title}
                            </h3>
                          </div>
                          <div className="grid grid-cols-3 justify-between items-start gap-3 mt-3 text-md">
                            <div className="col-span-2">
                              <span>
                                {descriptionInputValue ||
                                  category?.metaDescription}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div></div>
                    </div>

                    {/* SEO Title */}
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
                        name="seoTitle"
                        value={titleInputValue || category?.title}
                        onChange={handleTitleInputChange}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none"
                      />
                      <div className="w-full h-2 bg-gray-300 rounded-full">
                        <div
                          className={`h-full ${getTitleProgressBarColor()} rounded-lg`}
                          style={{
                            width: `${calculateTitleProgress(
                              titleInputValue
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    {/* SEO Description */}
                    <div className="flex flex-col space-y-1 w-full mt-5">
                      <label
                        htmlFor="seoDescription"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Meta Description
                      </label>
                      <textarea
                        id="seoDescription"
                        name="seoDescription"
                        value={
                          descriptionInputValue || category?.metaDescription
                        }
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
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
