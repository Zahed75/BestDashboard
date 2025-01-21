"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import Modal from "@/components/global/modal/Modal";
import { fetchProducts } from "@/redux/slice/productsSlice";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { fetchApi } from "@/utils/FetchApi";
import Pagination from "@/components/global/pagination/Pagination";

export default function InventoryTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [dataPerPage] = useState(10);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const noPicture = "https://i.ibb.co/sqPhfrt/notimgpng.png";
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [outletId, setOutletId] = useState("");
  const [outletStock, setOutletStock] = useState([]);
  const [user, setUser] = useState([]);

  const products = useSelector((state) => state?.products);
  const dispatch = useDispatch();
  const pathname = usePathname();

  useEffect(() => {
    dispatch(fetchProducts());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const pathParts = pathname?.split("/") || [];
      const outletIdFromPath = pathParts[pathParts.length - 1];

      if (!outletIdFromPath) {
        console.error("No outletId found in path");
        return;
      }

      setOutletId(outletIdFromPath);

      try {
        const response = await fetchApi(
          `/inventory/all-products-inventory/${outletIdFromPath}`,
          "GET"
        );

        if (response && response.inventory) {
          console.log("Fetched inventory data:", response.inventory);
          setOutletStock(response.inventory.products || []);
        } else {
          console.log("No inventory data found");
          setOutletStock([]);
        }
      } catch (error) {
        console.error("Error fetching inventory data:", error);

        setOutletStock([]);
      }
    };

    fetchData();
  }, [pathname]);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchSingleUser = async () => {
      if (!(user?.userId)) return;

      try {
        const res = await fetchApi(
          `/auth/users/${user?.userId}`,
          "GET"
        );
        const data = res?.user;
        setUser(data);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };
    fetchSingleUser();
  }, [user]);

  const productsData = products?.products?.products || [];
  const inStockProducts = outletStock || [];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectItem = (item) => {
    setSelectedItem(item);
    setIsOpen(false);
  };

  const filteredData = inStockProducts?.filter((item) =>
    Object.values(item).some(
      (value) =>
        value != null &&
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
  const lastItemIndex = Math.min(
    currentPage * dataPerPage,
    filteredData.length
  );

  const totalItems = filteredData.length;

  const showingText = `Showing ${firstItemIndex}-${lastItemIndex} of ${totalItems}`;

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const handleAddInventory = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target);

    const quantity = formData.get("quantity");

    const data = {
      outletId: outletId,
      productId: selectedItem?.item?._id,
      quantity: quantity,
    };

    try {
      const response = await fetchApi(`/inventory/add-Inventory`, "POST", data);

      if (response) {
        setIsLoading(false);
        setShowAddMenu(false);
        fetchData();
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleDeleteInventory = async (productId) => {
    const data = {
      outletId: outletId,
      productId: productId,
    };
    console.log("deleted data", data);

    try {
      const response = await fetchApi(
        `/inventory/delete-inventory-product`,
        "DELETE",
        data
      );

      console.log("inventory product response", response);

      if (response) {
        console.log("Product deleted successfully", response);
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleUpdateInventory = async (e, productId) => {
    e.preventDefault();
    setIsLoading(true);

    const quantity = e.target.value;

    const data = {
      outletId: outletId,
      productId: productId,
      newQuantity: quantity,
    };

    try {
      const response = await fetchApi(
        `/inventory/update-inventory`,
        "PUT",
        data
      );

      if (response) {
        setIsLoading(false);
        setShowAddMenu(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  // const incrementQuantity = async (productId, oldQuantity) => {
  //   const updatedQuantity = ++oldQuantity;

  //   const data = {
  //     outletId: outletId,
  //     productId: productId,
  //     newQuantity: updatedQuantity,
  //   };

  //   try {
  //     const response = await fetchApi(
  //       `/inventory/update-inventory`,
  //       "PUT",
  //       data
  //     );
  //     if (response) {
  //       console.log("Product quantity incremented successfully", response);
  //       setOutletStock((prevStock) =>
  //         prevStock.map((item) =>
  //           item._id === productId
  //             ? { ...item, quantity: updatedQuantity }
  //             : item
  //         )
  //       );
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const decrementQuantity = async (productId, oldQuantity) => {
  //   if (oldQuantity <= 0) return;
  //   const updatedQuantity = --oldQuantity;

  //   const data = {
  //     outletId: outletId,
  //     productId: productId,
  //     newQuantity: updatedQuantity,
  //   };

  //   try {
  //     const response = await fetchApi(
  //       `/inventory/update-inventory`,
  //       "PUT",
  //       data
  //     );
  //     if (response) {
  //       console.log("Product quantity decremented successfully", response);

  //       setOutletStock((prevStock) =>
  //         prevStock.map((item) =>
  //           item._id === productId
  //             ? { ...item, quantity: updatedQuantity }
  //             : item
  //         )
  //       );
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const incrementQuantity = async (productId, oldQuantity) => {
    const updatedQuantity = oldQuantity + 1;

    // Optimistically update the UI
    setOutletStock((prevStock) =>
      prevStock.map((item) =>
        item._id === productId ? { ...item, quantity: updatedQuantity } : item
      )
    );

    const data = {
      outletId: outletId,
      productId: productId,
      newQuantity: updatedQuantity,
    };

    try {
      const response = await fetchApi(
        `/inventory/update-inventory`,
        "PUT",
        data
      );
      if (!response || !response.success) {
        // Rollback UI changes in case of failure
        setOutletStock((prevStock) =>
          prevStock.map((item) =>
            item._id === productId ? { ...item, quantity: oldQuantity } : item
          )
        );
      }
    } catch (error) {
      console.log("Error incrementing quantity:", error);

      // Rollback UI changes in case of error
      setOutletStock((prevStock) =>
        prevStock.map((item) =>
          item._id === productId ? { ...item, quantity: oldQuantity } : item
        )
      );
    }
  };

  const decrementQuantity = async (productId, oldQuantity) => {
    if (oldQuantity <= 0) return;

    const updatedQuantity = oldQuantity - 1;

    // Optimistically update the UI
    setOutletStock((prevStock) =>
      prevStock.map((item) =>
        item._id === productId ? { ...item, quantity: updatedQuantity } : item
      )
    );

    const data = {
      outletId: outletId,
      productId: productId,
      newQuantity: updatedQuantity,
    };

    try {
      const response = await fetchApi(
        `/inventory/update-inventory`,
        "PUT",
        data
      );
      if (!response || !response.success) {
        // Rollback UI changes in case of failure
        setOutletStock((prevStock) =>
          prevStock.map((item) =>
            item._id === productId ? { ...item, quantity: oldQuantity } : item
          )
        );
      }
    } catch (error) {
      console.log("Error decrementing quantity:", error);

      // Rollback UI changes in case of error
      setOutletStock((prevStock) =>
        prevStock.map((item) =>
          item._id === productId ? { ...item, quantity: oldQuantity } : item
        )
      );
    }
  };

  console.log("outlet stock ::", outletStock);

  return (
    <section className="w-full my-5">
      <div className="grid grid-cols-1 md:grid-cols-3 justify-between items-center gap-y-3 mt-5 border-b-2 pb-5">
        <div className="flex justify-between md:justify-start items-center w-full">
          <h5 className="text-lg md:text-2xl font-bold">Inventory</h5>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 ml-auto w-full md:col-span-2">
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

          <div className="ml-auto md:ml-0 text-white border border-black bg-black rounded-lg shadow-md">
            <button
              onClick={() => setShowAddMenu(true)}
              className="flex justify-center items-center px-2 py-1"
            >
              <span className="text-xl font-semibold mr-1">+</span>{" "}
              <span className="text-nowrap">Add Inventory</span>
            </button>
          </div>
        </div>
      </div>
      {/* table component*/}
      <div className="w-full mx-auto my-5">
        <div className="flex flex-col">
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden ">
                <table className="min-w-full table-fixed dark:divide-gray-700">
                  <thead className="bg-gray-100 ">
                    <tr>
                      <th
                        scope="col"
                        onClick={() => handleSort("productName")}
                        className="p-3 text-[12px] lg:text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                      >
                        Product name &#x21d5;
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("sku")}
                        className="px-8 lg:px-0 py-3  text-[12px] lg:text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                      >
                        SKU &#x21d5;
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("price")}
                        className="px-8 lg:px-0 py-3  text-[12px] lg:text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                      >
                        Price &#x21d5;
                      </th>

                      <th
                        scope="col"
                        onClick={() => handleSort("stock")}
                        className="px-8 lg:px-0 py-3  text-[12px] lg:text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                      >
                        Stock &#x21d5;
                      </th>
                      <th
                        scope="col"
                        className="px-8 lg:px-0 py-3  text-[12px] lg:text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-black">
                    {outletStock?.map((item) => (
                      <tr
                        key={item?._id}
                        className={`${item.id % 2 !== 0 ? "" : "bg-gray-100"
                          } hover:bg-gray-100 duration-700`}
                      >
                        <td className="p-4 text-sm font-medium text-gray-900 text-wrap md:whitespace-nowrap">
                          {(user.role === "HQ" || user.role === "AD") ? (
                            <Link href={`/dashboard/products/${item?._id}`}>
                              <div className="flex justify-start items-center">
                                <Image
                                  width={30}
                                  height={30}
                                  className="w-7 h-7 rounded-md"
                                  src={item?.productImage || noPicture}
                                  alt={item?.productName}
                                />
                                <span className="ml-2">{item?.productName}</span>
                              </div>
                            </Link>
                          ) : (
                            <div className="flex justify-start items-center">
                              <Image
                                width={30}
                                height={30}
                                className="w-7 h-7 rounded-md"
                                src={item?.productImage || noPicture}
                                alt={item?.productName}
                              />
                              <span className="ml-2">{item?.productName}</span>
                            </div>
                          )}
                        </td>
                        <td className="pl-10 lg:px-0 py-4 text-sm font-medium text-gray-500 whitespace-nowrap ">
                          {item?.inventory?.sku}
                        </td>
                        <td className="px-6 lg:px-0 py-4 text-sm font-medium text-gray-900 whitespace-nowrap ">
                          <span className="text-md">৳</span>
                          {item?.general?.salePrice}
                        </td>
                        {(user.role === "HQ" || user.role === "AD") ? (
                          <td className="px-6 lg:px-0 py-4 text-sm font-medium text-center whitespace-nowrap ">
                            <div
                              className={`${item.inventory?.stockStatus === "In Stock"
                                ? "bg-green-100 text-green-400"
                                : "bg-red-100 text-red-400"
                                } inline-block px-1 py-1 rounded-md mr-2 `}
                            >
                              <div className="flex justify-center px-1 space-x-2">
                                <div className="flex items-center">
                                  <input
                                    type="number"
                                    min="0"
                                    id="newQuantity"
                                    name="newQuantity"
                                    defaultValue={item.quantity || 0}
                                    onChange={(e) =>
                                      handleUpdateInventory(e, item?._id)
                                    }
                                    className="ml-2 w-12 text-center focus:outline-0 rounded"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    decrementQuantity(item._id, item?.quantity)
                                  }
                                  className="bg-white text-red-500 p-1 rounded-full hover:bg-gray-100"
                                >
                                  <svg
                                    width="11"
                                    height="2"
                                    viewBox="0 0 11 2"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M0.0175781 1L10.5938 1"
                                      stroke="#F05252"
                                      stroke-width="1.5"
                                    />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    incrementQuantity(item?._id, item?.quantity)
                                  }
                                  className="bg-white text-green-500 p-1 rounded-full hover:bg-gray-100"
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6.23633 0.711914V11.2882"
                                      stroke="#0E9F6E"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      d="M0.949219 6L11.5255 6"
                                      stroke="#0E9F6E"
                                      stroke-width="1.5"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </td>
                        ) : (
                          <td className="px-6 lg:px-0 py-4 text-sm font-medium text-center whitespace-nowrap">
                            <div
                              className={`${item.inventory?.stockStatus === "In Stock"
                                ? "bg-green-100 text-green-400"
                                : "bg-red-100 text-red-400"
                                } inline-block px-1 py-1 rounded-md mr-2 `}
                            >
                              <div className="flex items-center">
                                <div className="flex justify-center px-1 space-x-2">
                                  <span className="ml-2 w-12 text-center focus:outline-0 rounded">{item.quantity || 0}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                        {(user.role === "HQ" || user.role === "AD") && (
                          <td className="px-6 lg:px-0 py-4 text-[12px] font-medium  whitespace-nowrap ">
                            <button className={` px-2 py-1 rounded-md borde`}>
                              <svg
                                className="cursor-pointer"
                                onClick={() => handleDeleteInventory(item._id)}
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
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
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

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
      <Modal addModal={() => setShowAddMenu(false)}>
        <div
          id="menu"
          className={`w-full h-full bg-gray-900 bg-opacity-80 top-0 right-0 ${showAddMenu ? "fixed" : "hidden"
            } sticky-0 z-30`}
        >
          <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
            <form
              onSubmit={handleAddInventory}
              className="w-full md:w-1/2 lg:w-1/2 bg-white p-6 rounded-md shadow-md"
            >
              <div className="flex justify-between items-center w-full">
                <h3 className="text-xl font-semibold">Add Inventory</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowAddMenu(false);
                  }}
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
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Product
                </label>
                <div className="relative mt-2">
                  <div
                    onClick={toggleDropdown}
                    className="block w-full pl-4 pr-10 py-2 h-[54px] text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {selectedItem && (
                      <div className="flex items-center justify-start">
                        <Image
                          className="w-8 h-8 rounded-md"
                          width={30}
                          height={30}
                          src={selectedItem?.item?.productImage}
                          alt={selectedItem?.item?.productName || "No Image"}
                        />

                        <div className="flex flex-col justify-center items-start ml-2">
                          <h2 className="text-sm font-medium">
                            {selectedItem?.item?.productName ||
                              "No Product Available"}
                          </h2>
                        </div>
                      </div>
                    )}

                    {/* Dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                          }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {productsData?.map((item, index) => (
                        <ul key={index} className="py-1">
                          <li
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => selectItem({ item })}
                          >
                            <div className="flex items-center">
                              <Image
                                className="w-8 h-8 rounded-md"
                                width={30}
                                height={30}
                                src={item?.productImage}
                                alt={item?.productName}
                              />
                              <span className="ml-2 text-sm">
                                {item.productName}
                              </span>
                            </div>
                          </li>
                        </ul>
                      ))}
                    </div>
                  )}
                </div>

                <label className="block mt-4 text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  required
                  id="quantity"
                  name="quantity"
                  className="mt-2 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none"
                  placeholder="Enter quantity"
                />
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-900 focus:outline-0"
                >
                  {isLoading ? "Loading..." : "Add Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </section>
  );
}
