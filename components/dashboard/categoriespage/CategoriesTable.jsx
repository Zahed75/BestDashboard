"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import Modal from "@/components/global/modal/Modal";
import Pagination from "@/components/global/pagination/Pagination";
import { fetchApi } from "@/utils/FetchApi";
import { useRouter } from "next/navigation";

export default function CategoriesTable({ AllCategories }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage] = useState(10);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [categories, setCategories] = useState(AllCategories || []);

  const data = categories;

  useEffect(() => {
    setCategories(AllCategories || []);
  }, [AllCategories]);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).userId : "";
    const categoryName = e.target.categoriesName.value;
    const description = e.target.note.value;
    const parentCategoryId = e.target.parentCategoryId.value;

    setIsLoading(true);
    try {
      const data = {
        userId,
        categoryName,
        categoryDescription: description,
        parentCategory: parentCategoryId || "",
        fetaureImage: "",
        title: "",
        metaDescription: "",
      };
      console.log(data);
      const response = await fetchApi("/category/addCategory", "POST", data);

      setIsLoading(false);
      setShowMenu(false);

      if (response) {
        setMessage("Category added successfully!");
        setCategories([...categories, response?.category]);
        setMessage("");
      } else {
        setError("Failed to add category. Please try again.");
      }
    } catch (err) {
      setIsLoading(false);
      setError("An error occurred while adding the category.");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      let updatedCategories = [...categories];
      for (const itemId of selectedItems) {
        const response = await fetchApi(
          `/category/deleteCategory/${itemId}`,
          "DELETE"
        );
        if (response) {
          updatedCategories = updatedCategories.filter(
            (item) => item._id !== itemId
          );
        } else {
          console.log(`Failed to delete category with ID ${itemId}.`);
        }
      }
      setSelectedItems([]);
      setCategories(updatedCategories);
      console.log("Selected categories deleted successfully!");
    } catch (err) {
      console.log("An error occurred while deleting selected categories.", err);
    }
  };

  const handleUpdateCategory = async () => {
    try {
      for (const itemId of selectedItems) {
        router.push(`/dashboard/products/categories/${itemId}`);
      }
    } catch (error) {
      console.log(
        "An error occurred while updating selected categories.",
        error
      );
    }
  };

  // Filtered data based on search query
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Sorting function
  const sortedData = filteredData.sort((a, b) => {
    if (!sortBy) return 0;
    if (sortDirection === "asc") {
      return a[sortBy].localeCompare(b[sortBy]);
    } else {
      return b[sortBy].localeCompare(a[sortBy]);
    }
  });

  // Pagination
  const indexOfLastData = currentPage * dataPerPage;
  const indexOfFirstData = indexOfLastData - dataPerPage;
  const currentData = sortedData.slice(indexOfFirstData, indexOfLastData);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const firstItemIndex = (currentPage - 1) * dataPerPage + 1;
  const lastItemIndex = Math.min(currentPage * dataPerPage, data.length);
  const totalItems = data.length;

  const showingText = `Showing ${firstItemIndex}-${lastItemIndex} of ${totalItems}`;

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedItems(selectAll ? [] : [...data?.map((item) => item._id)]);
  };

  const handleSelectItem = (itemId) => {
    const selectedIndex = selectedItems.indexOf(itemId);
    if (selectedIndex === -1) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems([
        ...selectedItems.slice(0, selectedIndex),
        ...selectedItems.slice(selectedIndex + 1),
      ]);
    }
  };

  const renderSubcategories = (subCategories, level) => {
    if (!subCategories) return null;

    return subCategories.map((subcategory) => (
      <>
        <tr
          key={subcategory._id}
          className={`bg-gray-${
            level % 2 === 0 ? "100" : "50"
          } hover:bg-gray-100 duration-700`}
        >
          <td scope="col" className="px-4 py-4">
            <div className="flex items-center">
              <input
                id={`checkbox_${subcategory?._id}`}
                type="checkbox"
                className="w-4 h-4 bg-gray-100 rounded border-gray-300"
                checked={selectedItems.includes(subcategory?._id)}
                onChange={() => handleSelectItem(subcategory?._id)}
              />
              <label
                htmlFor={`checkbox_${subcategory?._id}`}
                className="sr-only"
              >
                checkbox
              </label>
            </div>
          </td>
          <td className="py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
            <Link href={`/dashboard/products/categories/${subcategory._id}`}>
              {" ".repeat(level * 2)}
              {subcategory.categoryName}
            </Link>
          </td>
          <td className="px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
            {subcategory.slug}
          </td>
          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
            {subcategory.productCount}
          </td>
        </tr>

        {renderSubcategories(subcategory.subCategories, level + 2)}
      </>
    ));
  };

  return (
    <section className="w-full my-5">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 justify-between items-center gap-y-3 mt-5 border-b-2 pb-5">
          <div className="flex justify-between md:justify-start items-center w-full">
            <h5 className="text-lg md:text-2xl font-bold">All Categories</h5>
          </div>
          <div className="flex flex-col md:flex-row justify-start items-center gap-3 ml-auto w-full md:col-span-2">
            <div className="relative flex items-center w-full py-2 rounded-lg focus-within:shadow-lg bg-[#F9FAFB] shadow-md overflow-hidden">
              <div className="grid place-items-center h-full w-12 text-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <input
                onChange={(e) => setSearchQuery(e.target.value)}
                className="peer h-full w-full outline-none text-sm text-gray-500 bg-[#F9FAFB] pr-2"
                type="text"
                id="search"
                placeholder="Search something.."
              />
            </div>
            <div className="flex justify-end items-center gap-3 ml-auto">
              <div className="flex justify-between items-center gap-3 relative">
                <div className=" bg-[#F9FAFB] rounded-lg shadow-md ">
                  <button
                    onClick={() => setShowAction(!showAction)}
                    className="bg-[#F9FAFB] mx-4 py-2 flex justify-center items-center"
                  >
                    Action <FaCaretDown className="ml-3" />
                  </button>
                </div>
                <div
                  onMouseLeave={() => setShowAction(false)}
                  className={`
              ${showAction ? "block" : "hidden"}
              absolute top-11 bg-white text-base list-none divide-y divide-gray-100 rounded shadow-md w-full`}
                  id="dropdown"
                >
                  <ul className="py-1" aria-labelledby="dropdown">
                    <li>
                      <button
                        onClick={handleUpdateCategory}
                        className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 w-full"
                      >
                        Update
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleDeleteCategory}
                        className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 w-full"
                      >
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="ml-auto md:ml-0 text-white border border-black bg-black rounded-lg shadow-md">
                <button
                  onClick={() => setShowMenu(true)}
                  className="flex justify-center items-center px-2 py-1"
                >
                  <span className="text-xl font-semibold mr-1">+</span>{" "}
                  <span className="text-nowrap">Add Categories</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mx-auto my-5">
          <div className="flex flex-col">
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden ">
                  <table className="min-w-full  dark:divide-gray-700">
                    {/* table head */}
                    <thead className="bg-gray-100 ">
                      <tr>
                        <th scope="col" className="p-4 w-6">
                          <div className="flex items-center">
                            <input
                              id="checkbox_all"
                              type="checkbox"
                              className="w-4 h-4 bg-gray-100 rounded border-gray-300 "
                              onChange={handleSelectAll}
                              checked={selectAll}
                            />
                            <label htmlFor="checkbox-all" className="sr-only">
                              checkbox
                            </label>
                          </div>
                        </th>
                        <th
                          scope="col"
                          onClick={() => handleSort("categoryName")}
                          className="py-3 text-sm font-medium text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          categories &#x21d5;
                        </th>
                        <th
                          scope="col"
                          onClick={() => handleSort("slug")}
                          className="px-6 py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          Slug &#x21d5;
                        </th>
                        <th
                          scope="col"
                          className="py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                        >
                          Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-black">
                      {currentData
                        ?.sort()
                        .reverse()
                        .map((item) => (
                          <>
                            <tr
                              key={item._id}
                              className={`${
                                item._id % 2 !== 0 ? "" : "bg-gray-100"
                              } hover:bg-gray-100 duration-700`}
                            >
                              <td scope="col" className="p-4">
                                <div className="flex items-center">
                                  <input
                                    id={`checkbox_${item?._id}`}
                                    type="checkbox"
                                    className="w-4 h-4 bg-gray-100 rounded border-gray-300"
                                    checked={selectedItems.includes(item?._id)}
                                    onChange={() => handleSelectItem(item?._id)}
                                  />
                                  <label
                                    htmlFor={`checkbox_${item?._id}`}
                                    className="sr-only"
                                  >
                                    checkbox
                                  </label>
                                </div>
                              </td>
                              <td className="py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                <Link
                                  href={`/dashboard/products/categories/${item._id}`}
                                >
                                  {item.categoryName}
                                </Link>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                                {item.slug}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                {item.productCount}
                              </td>
                            </tr>

                            {renderSubcategories(item.subCategories, 1)}
                          </>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* page footer */}
            <Pagination
              currentPage={currentPage}
              dataPerPage={dataPerPage}
              totalItems={sortedData.length}
              paginate={paginate}
              showingText={showingText}
              data={sortedData}
            />
          </div>
        </div>

        <Modal closeModal={() => setShowMenu(false)}>
          <div
            id="menu"
            className={`w-full h-full bg-gray-900 bg-opacity-80 top-0 right-0 ${
              showMenu ? "fixed" : "hidden"
            } sticky-0`}
          >
            <div className="2xl:container h-screen 2xl:mx-auto py-48 px-4 md:px-28 flex justify-center items-center">
              <div className="max-w-[565px] lg:min-w-[565px] md:w-auto relative flex flex-col justify-center items-center bg-white p-4 rounded-md">
                <div className="flex justify-between items-center w-full">
                  <span className="text-3xl font-bold">Add Categories</span>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="text-gray-400  focus:outline-none"
                    aria-label="close"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="w-full mt-10">
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
                        required
                        className="border border-gray-300 rounded-md p-2 focus:outline-noneF"
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
                        readOnly
                        disabled
                        className="border border-gray-300 rounded-md p-2 focus:outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    <label
                      htmlFor="parentCategoryId"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Parent Categories
                    </label>
                    <br />
                    <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                      <select
                        id="parentCategoryId"
                        name="parentCategoryId"
                        className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                      >
                        <option value="">Select Parent Category</option>
                        {AllCategories?.map((item) => (
                          <>
                            {/* Parent Category */}
                            <option key={item._id} value={item._id}>
                              {item.categoryName}
                            </option>
                            {/* Subcategories */}
                            {item?.subCategories?.map((subcategory) => (
                              <option
                                key={subcategory._id}
                                value={subcategory._id}
                                className="ml-2"
                              >
                                &nbsp;&nbsp;{subcategory.categoryName}
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
                      className="border border-gray-300 rounded-md p-2 focus:outline-none w-full"
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm mt-2">{error}</div>
                  )}
                  {message && (
                    <div className="text-green-500 text-sm mt-2">{message}</div>
                  )}

                  <button
                    type="submit"
                    className="py-2 px-4 mt-5 bg-black text-white rounded-md w-full"
                  >
                    {isLoading ? "Loading..." : "Add Category"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </section>
  );
}
