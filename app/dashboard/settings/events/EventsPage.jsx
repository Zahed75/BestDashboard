"use client";
import Modal from "@/components/global/modal/Modal";
import { fetchCategories } from "@/redux/slice/categorySlice";
import { fetchApi } from "@/utils/FetchApi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function EventsPage({ initialItems }) {
  const [showUpdateMenu, setShowUpdateMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const categories = useSelector((state) => state?.categories);
  const [openItems, setOpenItems] = useState({});
  const [selectedCat, setSelectedCat] = useState([]);
  const [gridProducts, setGridProducts] = useState([]);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updateItemData, setUpdateItemData] = useState([]);
  const [gridItems, setGridItems] = useState(initialItems || []);

  useEffect(() => {
    setGridItems(initialItems || []);
  }, [initialItems]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedItem) {
      setUpdateItemData(selectedItem.selectProducts || []);
    }
  }, [selectedItem]);

  const AllCategories = categories?.categories?.categories;

  const handleViewProducts = async (e) => {
    const id = e.target.value;

    try {
      const response = await fetchApi(
        `/product/getProductByCategoryId/${id}`,
        "GET"
      );
      if (response) {
        let data = await response?.products;

        setSelectedCat(data || []);
      } else {
        setSelectedCat([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleCollapse = (id) => {
    setOpenItems((prevOpenItems) => ({
      ...prevOpenItems,
      [id]: !prevOpenItems[id],
    }));
  };

  const handleHideOutOfStock = () => {
    setHideOutOfStock((prevState) => !prevState);
  };

  const handleGridProduct = (e) => {
    const productId = e.target.value;

    const productExists = gridProducts.some((item) => item._id === productId);

    if (!productExists) {
      const productToAdd = selectedCat.find((item) => item._id === productId);
      if (productToAdd) {
        setGridProducts([...gridProducts, productToAdd]);
      }
    } else {
      const newGridProducts = gridProducts.filter(
        (item) => item._id !== productId
      );
      setGridProducts(newGridProducts);
    }
  };

  const handleUpdateSelectProduct = (e) => {
    const productId = e.target.value;

    const productExists = updateItemData.some((item) => item._id === productId);

    if (!productExists) {
      const productToAdd = selectedCat.find((item) => item._id === productId);
      if (productToAdd) {
        setUpdateItemData([...updateItemData, productToAdd]);
      }
    } else {
      const newGridProducts = updateItemData.filter(
        (item) => item._id !== productId
      );
      setUpdateItemData(newGridProducts);
    }
  };

  const handleRemoveProduct = (productId) => {
    const newGridProducts = gridProducts.filter(
      (item) => item._id !== productId
    );
    setGridProducts(newGridProducts);
  };
  const handleRemoveUpdateProduct = (productId) => {
    const newUpdateGridProducts = updateItemData.filter(
      (item) => item._id !== productId
    );
    setUpdateItemData(newUpdateGridProducts);
  };

  const handleAddProductGrid = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData(e.target);
    const data = {
      gridName: formData.get("gridName"),
      url: formData.get("url"),
      gridDescription: formData.get("productGridDescription"),
      productRow: formData.get("productRow"),
      productColumn: formData.get("productColumn"),
      filterCategories: [],
      selectProducts: [...gridProducts],
      ordersBy: formData.get("ordersBy"),
    };
    console.log("gridProducts", data);
    try {
      const response = await fetchApi("/grid/createGrid", "POST", data);
      if (response) {
        setMessage("Grid created successfully");
        setGridItems([...gridItems, response?.grid]);
        setShowAddMenu(false);
        setIsLoading(false);
      } else {
        setError("Error creating grid");
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setError("Error creating grid");
      setIsLoading(false);
    }
  };

  const handleDeleteGrid = async (gridId) => {
    try {
      const response = await fetchApi(`/grid/deleteGrids/${gridId}`, "DELETE");
      if (response) {
        setMessage("Grid deleted successfully");
        console.log("response", response);
        const newGrids = gridItems.filter((item) => item._id !== gridId);
        setGridItems(newGrids);
        setGridProducts([]);
      } else {
        setError("Error deleting grid");
      }
    } catch (error) {
      console.error(error);
      setError("Error deleting grid");
    }
  };

  const filteredProducts = hideOutOfStock
    ? selectedCat.filter(
        (item) => item?.inventory?.stockStatus !== "Out of Stock"
      )
    : selectedCat;

  const ordersByValues = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const openUpdateMenu = (item) => {
    setSelectedItem(item);
    setShowUpdateMenu(true);
  };

  const handleOrderByChange = (e) => {
    setSelectedItem((prevState) => ({
      ...prevState,
      ordersBy: e.target.value,
    }));
  };

  const handleUpdateProductGrid = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let updateGrid = [...gridItems];

    const formData = new FormData(e.target);
    const data = {
      _id: selectedItem._id,
      gridName: formData.get("UpdateGridName"),
      url: formData.get("updateUrl"),
      gridDescription: formData.get("UpdateProductGridDescription"),
      productRow: formData.get("UpdateProductRow"),
      productColumn: formData.get("updateProductColumn"),
      filterCategories: [],
      selectProducts: updateItemData,
      ordersBy: formData.get("UpdateOrderBy"),
    };
    console.log("gridProducts", data);
    try {
      const response = await fetchApi(
        `/grid/productGrids/${selectedItem._id}`,
        "PATCH",
        data
      );
      if (response) {
        updateGrid = updateGrid.map((item) =>
          item._id === selectedItem._id ? response?.grid : item
        );
        setShowUpdateMenu(false);
        setIsLoading(false);
        e.target.reset();
        setMessage("");
        setError("");
      } else {
        setError("Error updating grid");
        setIsLoading(false);
      }
      setGridItems(updateGrid);
    } catch (error) {
      console.error(error);
      setError("Error updating grid");
      setIsLoading(false);
    }
  };

  return (
    <main>
      <section className="w-full">
        <div className="flex flex-row justify-between item center mt-4">
          <h3 className="text-sm md:text-lg text-black font-extrabold  py-2">
            All Product Grids
          </h3>
          <button
            onClick={() => setShowAddMenu(true)}
            className="text-sm text-white bg-black rounded-md px-5 py-2  w-auto flex md:ml-auto mt-2"
          >
            + Add Grid
          </button>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-col gap-5 my-5 w-full">
            {gridItems?.map((item, index) => (
              <div
                key={item._id}
                // draggable
                // onDragStart={() => handleDragStart(index)}
                // onDragEnter={() => handleDragEnter(index)}
                // onDragEnd={handleDragEnd}
                // }`}
                className={`w-full h-auto bg-slate-50 flex items-center justify-center mx-auto cursor-move rounded-md shadow-md transition-transform duration-700 ease-in-out hover:bg-slate-100 "scale-[1.02]
                  `}
                style={{
                  transition: "transform 0.3s ease-in-out",
                }}
              >
                <div className="flex flex-col w-full gap-5">
                  <div className="flex justify-between items-center gap-x-2 w-full px-5 mt-5">
                    <div className="text-sm text-white bg-black rounded-full px-2">
                      {item.productColumn} x {item.productRow}
                    </div>
                    <div className="flex flex-row gap-x-2">
                      <svg
                        className="cursor-pointer"
                        onClick={() => openUpdateMenu(item)}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.2141 4.98239L17.6158 3.58063C18.39 2.80646 19.6452 2.80646 20.4194 3.58063C21.1935 4.3548 21.1935 5.60998 20.4194 6.38415L19.0176 7.78591M16.2141 4.98239L10.9802 10.2163C9.93493 11.2616 9.41226 11.7842 9.05637 12.4211C8.70047 13.058 8.3424 14.5619 8 16C9.43809 15.6576 10.942 15.2995 11.5789 14.9436C12.2158 14.5877 12.7384 14.0651 13.7837 13.0198L19.0176 7.78591M16.2141 4.98239L19.0176 7.78591"
                          stroke="black"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21 12C21 16.2426 21 18.364 19.682 19.682C18.364 21 16.2426 21 12 21C7.75736 21 5.63604 21 4.31802 19.682C3 18.364 3 16.2426 3 12C3 7.75736 3 5.63604 4.31802 4.31802C5.63604 3 7.75736 3 12 3"
                          stroke="black"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>

                      <svg
                        className="cursor-pointer"
                        onClick={() => handleDeleteGrid(item._id)}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5"
                          stroke="#FF3B30"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5"
                          stroke="#FF3B30"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M9.5 16.5V10.5"
                          stroke="#FF3B30"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M14.5 16.5V10.5"
                          stroke="#FF3B30"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col w-full gap-x-2 px-5 mb-2">
                    <div className="flex flex-row justify-between items-center">
                      <div>
                        <h4 className="text-[#202435] text-md md:text-xl font-semibold uppercase">
                          {item?.gridName}
                        </h4>
                        <h4 className="text-[#9B9BB4] text-xs md:text-sm font-semibold">
                          {item?.gridDescription}
                        </h4>
                      </div>

                      <div
                        className="flex justify-center ml-auto"
                        onClick={() => toggleCollapse(item?._id)}
                      >
                        <svg
                          width="26"
                          height="14"
                          viewBox="0 0 26 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={`cursor-pointer transition-transform duration-300 ${
                            openItems[item?._id] ? "rotate-180" : ""
                          }`}
                        >
                          <path d="M1 0.5L13 12.5L25 0.5" stroke="black" />
                        </svg>
                      </div>
                    </div>
                    <div
                      className={`mt-2 overflow-hidden transition-max-height duration-500 ease-in-out ${
                        openItems[item?._id] ? "h-auto" : "h-0"
                      }`}
                    >
                      <div className="p-4 bg-white rounded-lg">
                        <div
                          className={`grid grid-cols-1 md:grid-cols-${item?.productColumn} lg:grid-cols-${item?.productColumn} justify-center`}
                        >
                          {item?.selectProducts?.map((product) => (
                            <div
                              key={product._id}
                              className={`w-full min-h-full overflow-hidden border shadow-sm hover:shadow-lg duration-700 rounded-md p-5 mx-auto relative`}
                            >
                              <div className="relative group duration-700">
                                {product?.general?.salePrice ? (
                                  <div className="absolute top-0 left-0 bg-[#F16521] rounded-full text-white z-10">
                                    <p className="text-sm px-1 py-1">
                                      {(
                                        ((product?.general?.regularPrice -
                                          product?.general?.salePrice) /
                                          product?.general?.regularPrice) *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                <Link href="">
                                  <div className="object-cover min-h-[200px] flex justify-center overflow-hidden">
                                    <Image
                                      src={product?.productImage}
                                      width={200}
                                      height={200}
                                      alt="product"
                                      className="hover:scale-105 duration-700"
                                    />
                                  </div>
                                </Link>
                                <div className="mt-5 flex justify-start items-center">
                                  <p
                                    className={`text-xs font-semibold border rounded-md px-3 py-1 ${
                                      (product?.inventory?.stockStatus ===
                                        "In Stock" &&
                                        " text-[#70BE38] border-[#70BE38]") ||
                                      " text-red-400 border-red-400"
                                    }`}
                                  >
                                    {product?.inventory?.stockStatus}
                                  </p>
                                </div>
                                <div className="mt-3">
                                  <Link href="">
                                    <h4 className="text-[#202435] font-sans font-medium leading-[1.4] hover:text-[#F16521] duration-700 text-sm  h-10">
                                      {product?.productName}
                                    </h4>
                                  </Link>
                                  <div className="mt-5 text-slate-500 text-md">
                                    <div className=" ">
                                      Offer Price:{" "}
                                      <span className="font-semibold ml-1">
                                        ৳{product?.general?.salePrice}
                                      </span>{" "}
                                    </div>
                                    <div className="">
                                      M.R.P:
                                      <del className="ml-1">
                                        ৳{product?.general?.regularPrice}
                                      </del>
                                    </div>
                                    <div className="flex justify-start items-center">
                                      Your Save:
                                      <div className="ml-1 flex justify-start items-center">
                                        {product?.general?.salePrice ? (
                                          <p className="font-semibold">
                                            {(
                                              ((product?.general?.regularPrice -
                                                product?.general?.salePrice) /
                                                product?.general
                                                  ?.regularPrice) *
                                              100
                                            ).toFixed(1)}
                                            %
                                          </p>
                                        ) : (
                                          <></>
                                        )}
                                        <p>
                                          (
                                          {product?.general?.regularPrice -
                                            product?.general?.salePrice}
                                          )
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Modal updateModal={() => setShowUpdateMenu(false)}>
        <div
          id="update-menu"
          className={`w-full h-full bg-gray-900 bg-opacity-80 top-0 right-0 ${
            showUpdateMenu ? "fixed" : "hidden"
          } sticky-0 z-30`}
        >
          <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full bg-white p-6 rounded-md shadow-md">
              <div className="flex justify-between items-center w-full">
                <span className="text-2xl font-bold">Update Product Grid</span>
                <button
                  onClick={() => setShowUpdateMenu(false)}
                  className="text-gray-400 focus:outline-none"
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
              <form onSubmit={handleUpdateProductGrid} className="w-full mt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="UpdateGridName"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Product Grid Name
                    </label>
                    <input
                      type="text"
                      id="UpdateGridName"
                      name="UpdateGridName"
                      defaultValue={selectedItem?.gridName}
                      required
                      className="border border-gray-300 rounded-md p-2 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="updateUrl"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Url
                    </label>
                    <input
                      type="text"
                      id="updateUrl"
                      name="updateUrl"
                      defaultValue={selectedItem?.url ?? ""}
                      required
                      className="border border-gray-300 rounded-md p-2 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="UpdateProductGridDescription"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Product Grid Description
                    </label>
                    <input
                      type="text"
                      id="UpdateProductGridDescription"
                      name="UpdateProductGridDescription"
                      defaultValue={selectedItem?.gridDescription}
                      required
                      className="border border-gray-300 rounded-md p-2 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label
                        htmlFor="UpdateProductRow"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Row
                      </label>
                      <input
                        type="number"
                        id="UpdateProductRow"
                        name="UpdateProductRow"
                        min={0}
                        defaultValue={selectedItem?.productRow}
                        required
                        className="border border-gray-300 rounded-md p-2 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label
                        htmlFor="updateProductColumn"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Column
                      </label>
                      <input
                        type="number"
                        id="updateProductColumn"
                        name="updateProductColumn"
                        min={0}
                        defaultValue={selectedItem?.productColumn}
                        required
                        className="border border-gray-300 rounded-md p-2 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label
                        htmlFor="filterCategory"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Filter Category
                      </label>
                      <div className="relative border border-gray-300 rounded-md">
                        <select
                          onChange={handleViewProducts}
                          id="filterCategory"
                          name="filterCategory"
                          className="w-full h-10 pl-3 pr-10 text-gray-600 bg-white rounded-md focus:outline-none"
                        >
                          <option value="">Select Category</option>
                          {AllCategories?.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.categoryName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label
                        htmlFor="UpdateOrderBy"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Order By
                      </label>
                      <div className="relative border border-gray-300 rounded-md">
                        <select
                          id="UpdateOrderBy"
                          name="UpdateOrderBy"
                          value={selectedItem?.ordersBy?.toString() || ""}
                          onChange={(e) => handleOrderByChange(e)}
                          required
                          className="w-full h-10 pl-3 pr-10 text-gray-600 bg-white rounded-md focus:outline-none"
                        >
                          <option value="">Select Order</option>
                          {ordersByValues?.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="selectProduct"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Select Product
                    </label>
                    <div className="relative border border-gray-300 rounded-md">
                      <div className="mx-3 flex-grow mt-1">
                        {updateItemData?.map((item) => (
                          <div
                            className="bg-gray-100 rounded-md px-1 inline-block text-[12px] text-gray-600 mx-1"
                            key={item._id}
                          >
                            <span className="">{item._id}</span>
                            <button
                              onClick={() =>
                                handleRemoveUpdateProduct(item._id)
                              }
                              className="hover:shadow-sm ml-2 font-semibold"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                      <select
                        onChange={handleUpdateSelectProduct}
                        id="selectProduct"
                        name="selectProduct"
                        disabled={
                          !filteredProducts || filteredProducts.length === 0
                        }
                        required
                        className="w-full h-10 pl-3 pr-10 text-gray-600 bg-white rounded-md focus:outline-none"
                      >
                        <option value="">Select Product</option>
                        {filteredProducts?.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.productName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1 w-full">
                    <label className="inline-flex items-center cursor-pointer gap-2">
                      Hide Out of Stock
                      <input
                        onClick={handleHideOutOfStock}
                        type="checkbox"
                        name="hideOutOfStock"
                        id="hideOutOfStock"
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
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
                  {isLoading ? "Loading..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Modal>

      <Modal addModal={() => setShowAddMenu(false)}>
        <div
          id="menu"
          className={`w-full h-full bg-gray-900 bg-opacity-80 top-0 right-0 ${
            showAddMenu ? "fixed" : "hidden"
          } sticky-0 z-30`}
        >
          <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full bg-white p-6 rounded-md shadow-md">
              <div className="flex justify-between items-center w-full">
                <span className="text-2xl font-bold">Add Product Grid</span>
                <button
                  onClick={() => setShowAddMenu(false)}
                  className="text-gray-400 focus:outline-none"
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
              <form onSubmit={handleAddProductGrid} className="w-full mt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="gridName"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Product Grid Name
                    </label>
                    <input
                      type="text"
                      id="gridName"
                      name="gridName"
                      required
                      className="border border-gray-300 rounded-md p-2 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="url"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Url
                    </label>
                    <input
                      type="text"
                      id="url"
                      name="url"
                      required
                      className="border border-gray-300 rounded-md p-2 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="productGridDescription"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Product Grid Description
                    </label>
                    <input
                      type="text"
                      id="productGridDescription"
                      name="productGridDescription"
                      required
                      className="border border-gray-300 rounded-md p-2 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label
                        htmlFor="productRow"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Row
                      </label>
                      <input
                        type="number"
                        id="productRow"
                        name="productRow"
                        required
                        className="border border-gray-300 rounded-md p-2 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label
                        htmlFor="productColumn"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Column
                      </label>
                      <input
                        type="number"
                        id="productColumn"
                        name="productColumn"
                        required
                        className="border border-gray-300 rounded-md p-2 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label
                        htmlFor="filterCategory"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Filter Category
                      </label>
                      <div className="relative border border-gray-300 rounded-md">
                        <select
                          onChange={handleViewProducts}
                          id="filterCategory"
                          name="filterCategory"
                          required
                          className="w-full h-10 pl-3 pr-10 text-gray-600 bg-white rounded-md focus:outline-none"
                        >
                          <option value="">Select Category</option>
                          {AllCategories?.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.categoryName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label
                        htmlFor="orderBy"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Order By
                      </label>
                      <div className="relative border border-gray-300 rounded-md">
                        <select
                          id="ordersBy"
                          name="ordersBy"
                          required
                          className="w-full h-10 pl-3 pr-10 text-gray-600 bg-white rounded-md focus:outline-none"
                        >
                          <option value="">Select Order</option>
                          {Array.from({ length: 9 }, (_, index) => (
                            <option key={index + 1} value={index + 1}>
                              {index + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="selectProduct"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Select Product
                    </label>
                    <div className="relative border border-gray-300 rounded-md">
                      <div className="mx-3 flex-grow mt-1">
                        {gridProducts?.map((item) => (
                          <div
                            className="bg-gray-100 rounded-md px-1 inline-block text-[12px] text-gray-600 mx-1"
                            key={item._id}
                          >
                            <span className="">{item._id}</span>
                            <button
                              onClick={() => handleRemoveProduct(item._id)}
                              className="hover:shadow-sm ml-2 font-semibold"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                      <select
                        onChange={handleGridProduct}
                        id="selectProduct"
                        name="selectProduct"
                        disabled={
                          !filteredProducts || filteredProducts.length === 0
                        }
                        required
                        className="w-full h-10 pl-3 pr-10 text-gray-600 bg-white rounded-md focus:outline-none"
                      >
                        <option value="">Select Product</option>
                        {filteredProducts?.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.productName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1 w-full">
                    <label className="inline-flex items-center cursor-pointer gap-2">
                      Hide Out of Stock
                      <input
                        onClick={handleHideOutOfStock}
                        type="checkbox"
                        name="hideOutOfStock"
                        id="hideOutOfStock"
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
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
                  {isLoading ? "Loading..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Modal>
    </main>
  );
}
