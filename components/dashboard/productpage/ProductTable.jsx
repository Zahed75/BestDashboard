"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CiMenuBurger, CiMenuFries } from "react-icons/ci";
import { FaCaretDown } from "react-icons/fa";
import Pagination from "@/components/global/pagination/Pagination";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/utils/FetchApi";
import Image from "next/image";
import Modal from "@/components/global/modal/Modal";

export default function ProductTable({ AllProducts, AllOutlets }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage] = useState(10);
  const [currentPageOutlet, setCurrentPageOutlet] = useState(1);
  const [dataPerPageOutlet] = useState(10);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showButton, setShowButton] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryOutlet, setSearchQueryOutlet] = useState("");
  const [showAction, setShowAction] = useState(false);
  const [filter, setFilter] = useState("All");
  const [products, setProducts] = useState(AllProducts || []);
  const [outlets, setOutlets] = useState(AllOutlets || []);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState();
  const [user, setUser] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  // const [productId, setProductId] = useState();
  // const [productStock, setProductStock] = useState();
  // const [selectedOutlet, setSelectedOutlet] = useState();

  const router = useRouter();

  const titleData = ["All", "Published", "Draft"];
  const data = products;

  const noPicture = "https://i.ibb.co/sqPhfrt/notimgpng.png";

  useEffect(() => {
    setProducts(AllProducts || []);
  }, [AllProducts]);

  useEffect(() => {
    setOutlets(AllOutlets || []);
  }, [AllOutlets]);

  // const data_outlets = outlets;
  useEffect(() => {
    if (outlets.length > 0) {
      console.log('Updated outlets:', outlets);
    }
  }, [outlets]);

  useEffect(() => {
    if (selectedItem) {
      console.log("Updated selectedItem:", selectedItem); // Log when selectedItem changes
    }
  }, [selectedItem]);

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

  useEffect(() => {
    const fetchProductOutletDetails = async () => {
      if (!(productDetails?._id)) return;

      try {
        const res = await fetchApi(
          `/product/quantity/${productDetails?._id}`,
          "GET"
        );
        const data = res?.data?.data?.outletQuantities;
        console.log(data);
        setProductDetails(data);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };
    fetchProductOutletDetails();
  }, [productDetails]);

  const selectItem = (item) => {
    setSelectedItem(item);
  };


  const handleTitleButtonClick = (title) => {
    setFilter(title);
    setSearchQuery("");
  };

  // const handleUpdateProductStock = async (itemId) => {
  //   try {



  //     const response = await fetchApi(
  //       `/inventory/all-products-inventory/${itemId}`,
  //       "GET"
  //     );
  //     console.log(response);

  //     // const selectedOutlet = inventory.outletId === itemId ? inventory : null;
  //     // setSelectedOutlet(response?.inventory?.outletId);
  //     const selectedProduct = response?.inventory?.products
  //       .find(product => product._id === productId);
  //     console.log(selectedProduct);
  //     // Display the quantity if the product is found, otherwise show 0
  //     const quantity = selectedProduct ? selectedProduct.quantity : 0;

  //     setProductStock(quantity);

  //   } catch (err) {
  //     console.log("An error occurred products quantity.", err);
  //   }
  // };

  // filter function for outlet
  // const filteredData_outlet = productDetails?.filter((item) => {
  //   if (!item?.outletName) return false; // Check if outletName exists

  //   const searchWords = searchQueryOutlet.toLowerCase().split(' ');
  //   return searchWords.every(word => item.outletName.toLowerCase().includes(word));
  // }
  // );

  const filteredData_outlet = Array.isArray(productDetails)
    ? productDetails.filter((item) => {
      if (!item?.outletName) return false; // Check if outletName exists

      const searchWords = searchQueryOutlet.toLowerCase().split(' ');
      return searchWords.every(word => item.outletName.toLowerCase().includes(word));
    })
    : [];


  // Sorting function for outlet
  const sortedData_outlet = filteredData_outlet.sort((a, b) => {
    if (!sortBy) return 0;
    if (sortDirection === "asc") {
      return a[sortBy].localeCompare(b[sortBy]);
    } else {
      return b[sortBy].localeCompare(a[sortBy]);
    }
  });

  const filteredData = data
    .filter((item) => {
      if (filter === "Draft") {
        return item.productStatus === "Draft";
      } else if (filter === "Published") {
        return item.productStatus === "Published";
      }
      return true;
    })
    .filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  const sortData = (filteredData, sortBy, sortDirection) => {
    if (!sortBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = sortBy.split(".").reduce((o, i) => (o ? o[i] : ""), a);
      const bValue = sortBy.split(".").reduce((o, i) => (o ? o[i] : ""), b);

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        return 0;
      }
    });
  };

  const sortedData = sortData(filteredData, sortBy, sortDirection);

  const indexOfLastData = currentPage * dataPerPage;
  const indexOfFirstData = indexOfLastData - dataPerPage;
  const currentData = sortedData.slice(indexOfFirstData, indexOfLastData);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  //Sorted Outlet List
  // const indexOfLastDataOutlet = currentPageOutlet * dataPerPageOutlet;
  // const indexOfFirstDataOutlet = indexOfLastDataOutlet - dataPerPageOutlet;
  const currentDataOutput = sortedData_outlet.slice();

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
    setSelectedItems(selectAll ? [] : [...data.map((item) => item._id)]);
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

  const handleDeleteProduct = async () => {
    try {
      let updatedProducts = [...products];

      for (const itemId of selectedItems) {
        const response = await fetchApi(
          `/product/deleteProduct/${itemId}`,
          "DELETE"
        );

        if (response) {
          updatedProducts = updatedProducts.filter(
            (item) => item._id !== itemId
          );
        } else {
          console.log(`Failed to delete product with ID ${itemId}.`);
        }
      }

      setProducts(updatedProducts);
      setSelectedItems([]);

      console.log("Selected products deleted successfully!");
    } catch (err) {
      console.log("An error occurred while deleting selected products.", err);
    }
  };

  const handleUpdateProduct = async () => {
    try {
      for (const itemId of selectedItems) {
        router.push(`/dashboard/products/${itemId}`);
      }
    } catch (error) {
      console.log(
        "An error occurred while updating selected categories.",
        error
      );
    }
  };

  const handleDuplicateProduct = async (product) => {
    try {
      const productNameRegex = new RegExp(
        `^${product.productName}( copy( \\d+)?)?$`
      );
      const existingProducts = currentData.filter((p) =>
        productNameRegex.test(p.productName)
      );

      let newProductName = `${product.productName} copy 1`;
      if (existingProducts.length > 0) {
        newProductName = `${product.productName} copy ${existingProducts.length + 1
          }`;
      }

      const duplicatedProductData = {
        productName: newProductName,
        categoryId: product?.categoryId,
        productBrand: product?.productBrand,
        productImage:
          product.productImage || "https://i.ibb.co/sqPhfrt/notimgpng.png",
        isTrash: false,
        productGallery: product?.productGallery,
        productVideos: [],
        productSpecification: product?.productSpecification,
        productDescription: product?.productDescription,
        productShortDescription: product?.productShortDescription,
        productStatus: "Draft",
        seo: {
          productTitle: `${newProductName} at Best Electronics`,
          prodDescription:
            "Best Electronics is the leading provider of high-quality electronics products. We offer a wide range of products including laptops, mobile phones, tablets, cameras, and more.",
          productTags: product?.seo?.productTags,
          productNotes: product?.seo?.productNotes,
        },
        general: {
          regularPrice: product?.general?.regularPrice,
          salePrice: product?.general?.salePrice,
          taxStatus: product?.general?.taxStatus,
          taxClass: product?.general?.taxClass,
        },
        inventory: {
          sku: " ",
          stockManagement: product?.inventory?.stockManagement || false,
          stockStatus: product?.inventory?.stockStatus || "Out of Stock",
          soldIndividually: product?.inventory?.soldIndividually || false,
          inventoryStatus:
            product?.inventory?.inventoryStatus || "Online & Offline",
        },
        shipping: {
          weight: product?.shipping?.weight || 0,
          productDimensions: {
            length: product?.shipping?.productDimensions?.length || 0,
            width: product?.shipping?.productDimensions?.width || 0,
            height: product?.shipping?.productDimensions?.height || 0,
          },
        },
        date: new Date(),
      };

      const response = await fetchApi(
        "/product/addProduct",
        "POST",
        duplicatedProductData
      );

      if (response) {
        const newProductId = response?.product?._id;
        router.push(`/dashboard/products/${newProductId}`);
      } else {
        const errorData = await response.json();
        console.log("Failed to duplicate product:", errorData);
      }
    } catch (error) {
      console.log("Error duplicating product:", error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleUpdateStock = async () => {
    // try {
    //   for (const itemId of selectedItem) {
    //     router.push(`/dashboard/outlets/${itemId}`);
    //   }
    // } catch (error) {
    //   console.log(
    //     "An error occurred while updating Product Stock.",
    //     error
    //   );
    // }
    setShowAddMenu(false);
  };


  return (
    <main>
      <div className="grid grid-cols-1 md:grid-cols-3 justify-between items-center gap-y-3 mt-5 border-b-2 pb-5">
        <div className="flex justify-between md:justify-start items-center  w-full">
          <h5 className="text-lg md:text-2xl font-bold">All Products</h5>
          <button
            onClick={() => setShowButton(!showButton)}
            className="text-sm md:text-lg text-gray-500 block md:hidden"
          >
            {showButton ? (
              <CiMenuFries className="text-xl font-bold" />
            ) : (
              <CiMenuBurger className="text-xl font-bold" />
            )}
          </button>
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
          {(user?.role === "HQ" || user?.role === "AD") && (
            <div className="flex justify-between items-center gap-3 mr-auto md:mr-0 relative">
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
                      onClick={handleUpdateProduct}
                      className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 w-full"
                    >
                      Update
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleDeleteProduct}
                      className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 w-full"
                    >
                      Delete
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
          {(user?.role === "HQ" || user?.role === "AD") && (
            <div className="ml-auto md:ml-0 text-white border border-black bg-black rounded-lg shadow-md">
              <Link
                href="/dashboard/addproduct"
                className="flex justify-center items-center px-2 py-1"
              >
                <span className="text-xl font-semibold mr-1">+</span>{" "}
                <span className="text-nowrap">Add Product</span>
              </Link>
            </div>
          )}
        </div>
      </div>
      {/* button component */}
      <div
        className={`
      ${showButton ? "flex" : "hidden"}
       flex-col md:flex-row gap-2 pb-5 border-b-2 justify-start items-center mt-5 `}
      >
        {titleData.map((title, index) => (
          <button
            key={index}
            onClick={() => handleTitleButtonClick(title)}
            className="bg-gray-100 text-gray-500 px-10 py-2 text-md rounded-md hover:bg-black hover:text-white duration-700 shadow-md w-full md:w-auto"
          >
            {title}
          </button>
        ))}
      </div>
      <section className="w-full my-5">
        {/* table component*/}
        <div className="w-full mx-auto my-5">
          <div className="flex flex-col">
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table
                    id="joy-bangla"
                    className="min-w-full table-fixed dark:divide-gray-700"
                  >
                    {/* table head */}
                    <thead className="bg-gray-100 ">
                      <tr>
                        <th scope="col" className="px-6 py-6 lg:p-4 w-6">
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
                          onClick={() => handleSort("productName")}
                          className="py-3 text-[12px] lg:text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          Product name &#x21d5;
                        </th>
                        <th
                          scope="col"
                          onClick={() => handleSort("inventory.sku")}
                          className="px-8 lg:px-0 py-3 text-[12px] lg:text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          SKU &#x21d5;
                        </th>
                        <th
                          scope="col"
                          onClick={() => handleSort("general.salePrice")}
                          className="px-3 lg:px-0 py-3 text-[12px] lg:text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          SalePrice &#x21d5;
                        </th>
                        <th
                          scope="col"
                          onClick={() => handleSort("date")}
                          className="px-3 lg:px-0 py-3 text-[12px] lg:text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          Published &#x21d5;
                        </th>
                        <th
                          scope="col"
                          onClick={() => handleSort("inventory.stockStatus")}
                          className="px-3 lg:px-0 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          Stock &#x21d5;
                        </th>
                        {/* <th
                          scope="col"
                          className="px-6 lg:px-0 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                        >
                          Available
                        </th> */}
                      </tr>
                    </thead>
                    <tbody className="bg-white text-black">
                      {currentData?.map((item) => (
                        <tr
                          key={item._id}
                          className={`${item.id % 2 !== 0 ? "" : "bg-gray-100"
                            } hover:bg-gray-100 duration-700 `}
                        >
                          <td scope="col" className="px-6 lg:px-4 py-4">
                            <div className="flex items-center">
                              <input
                                id={`checkbox_${item._id}`}
                                type="checkbox"
                                className="w-4 h-4  bg-gray-100 rounded border-gray-300"
                                checked={selectedItems.includes(item._id)}
                                onChange={() => handleSelectItem(item._id)}
                              />
                              <label
                                htmlFor={`checkbox_${item._id}`}
                                className="sr-only"
                              >
                                checkbox
                              </label>
                            </div>
                          </td>
                          <td className="px-0 py-4 text-sm font-medium text-gray-900 whitespace-nowrap group">
                            <div className="flex justify-start items-center">
                              <Image
                                className="w-7 h-7 rounded-md"
                                width={30}
                                height={30}
                                src={item?.productImage || noPicture}
                                alt={item?.productName}
                              />
                              <div className="flex flex-col justify-center items-start ml-2 ">
                                {user?.role === "HQ" || user?.role === "AD" ? (
                                  <><Link href={`/dashboard/products/${item._id}`}>
                                    <span className="text-wrap">
                                      {item?.productName}
                                    </span>
                                  </Link>
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateProduct(item)}
                                      className="text-xs cursor-pointer text-gray-500 opacity-0 group-hover:opacity-100 group-hover:text-[#f16521] duration-700"
                                    >
                                      Duplicate
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-wrap">
                                    {item?.productName}
                                  </span>
                                )}

                              </div>
                            </div>
                          </td>
                          <td className="px-6 lg:px-0 py-4 text-sm font-medium text-gray-500 whitespace-nowrap ">
                            {item?.inventory?.sku}
                          </td>
                          <td className="px-6 md:px-0 py-4 text-sm font-medium text-gray-900 whitespace-nowrap ">
                            <span className="text-md">৳</span>
                            {item?.general?.salePrice}
                          </td>
                          <td className="px-6 lg:px-0 py-4 text-sm font-medium text-gray-900 whitespace-nowrap ">
                            {/* {formatTime(item?.date)} */}
                            {item?.CreatedAt}
                          </td>
                          <td className="px-6 lg:px-0 py-4 text-sm font-medium text-center whitespace-nowrap">
                            {/* <Link href={`/dashboard/products/${item._id}`}> */}
                            <div
                              className={`${item?.inventory?.stockStatus === "In Stock"
                                ? "bg-green-100 text-green-400"
                                : "bg-red-100 text-red-400"
                                } inline-block px-1 py-1 rounded-md mr-2 `}
                            >
                              <div className="flex justify-center px-1" onClick={() =>
                                selectItem({ item })}>
                                {item?.inventory?.stockStatus}
                                <svg
                                  className="cursor-pointer ml-2" onClick={() => {

                                    // setProductId(item?._id);
                                    // handleUpdateProductStock(item?._id);
                                    setProductDetails(item);
                                    setShowAddMenu(true);
                                  }}
                                  width="21"
                                  height="22"
                                  viewBox="0 0 21 22"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M11.4863 4.02943L12.4792 3.03652C13.0276 2.48815 13.9167 2.48815 14.465 3.03652C15.0134 3.58489 15.0134 4.47398 14.465 5.02235L13.4721 6.01526M11.4863 4.02943L7.77894 7.73679C7.03854 8.47721 6.66832 8.84738 6.41623 9.29852C6.16413 9.74966 5.9105 10.8149 5.66797 11.8336C6.68662 11.591 7.75189 11.3374 8.20302 11.0853C8.65416 10.8332 9.02434 10.463 9.76476 9.7226L13.4721 6.01526M11.4863 4.02943L13.4721 6.01526"
                                    stroke="#3E445A"
                                    strokeWidth="1.0625"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M14.875 9.00024C14.875 12.0054 14.875 13.5081 13.9414 14.4417C13.0078 15.3752 11.5052 15.3752 8.5 15.3752C5.4948 15.3752 3.99219 15.3752 3.0586 14.4417C2.125 13.5081 2.125 12.0054 2.125 9.00024C2.125 5.99504 2.125 4.49244 3.0586 3.55884C3.99219 2.62524 5.4948 2.62524 8.5 2.62524"
                                    stroke="#3E445A"
                                    strokeWidth="1.0625"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </div>
                            </div>
                            {/* </Link> */}
                          </td>
                          {/* <td className="px-6 lg:px-0 py-4 text-[12px] font-medium  whitespace-nowrap ">
                            <button
                              className={`px-2 py-1 rounded-md border border-black`}
                            >
                              {item?.inventory?.inventoryStatus}
                            </button>
                          </td> */}
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
      </section>
      <Modal addModal={() => setShowAddMenu(false)}>
        <div
          id="menu"
          className={`w-full h-full bg-gray-900 bg-opacity-80 top-0 right-0 ${showAddMenu ? "fixed" : "hidden"
            } sticky-0 z-30`}
        >
          <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">

              <div className="flex items-center justify-between p-4">
                {selectedItem && (
                  <div className="flex justify-start items-center">
                    <Image
                      className="w-9 h-9 rounded-md"
                      width={30}
                      height={30}
                      src={selectedItem?.item?.productImage || noPicture}
                      alt={selectedItem?.item?.productImage}
                    />
                    <div className="flex flex-col justify-center items-start ml-2 ">

                      {/* <span className="text-wrap">
                        {item?.productName}
                      </span> */}
                      <h2 className="text-lg font-semibold">{selectedItem?.item?.productName}</h2>

                    </div>
                  </div>
                )}

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
              {/* <div className="flex flex-col items-between justify-between p-4 w-full border rounded-lg focus-within:shadow-lg bg-[#F9FAFB] shadow-md overflow-hidden">

                <div className="w-12 text-gray-300">
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
                  placeholder="Search"
                />

              </div> */}

              <div className="px-4">
                <div className="flex items-center p-2 w-full border rounded-lg focus-within:shadow-lg bg-[#F9FAFB]">
                  <div className="w-6 h-6 text-gray-300 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full"
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
                    onChange={(e) => setSearchQueryOutlet(e.target.value)}
                    className="peer w-full outline-none text-sm text-gray-500 bg-[#F9FAFB] pl-2"
                    type="text"
                    id="search"
                    placeholder="Search something.."
                  />
                </div>
                {/* <hr className="my-4 border-gray-300" /> */}
                <div className="overflow-y-auto max-h-80 hide-scrollbar mt-4">
                  <table
                    className="min-w-full table-fixed dark:divide-gray-700"
                  >
                    {/* table head */}
                    <thead className="bg-gray-100 ">
                      <tr>
                        <th
                          scope="col"
                          onClick={() => handleSort("outletName")}
                          className="px-6 py-6 lg:p-4 text-[12px] lg:text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          OUTLET NAME &#x21d5;
                        </th>
                        <th
                          scope="col"
                          onClick={() => handleSort("outletLocation")}
                          className="px-8 lg:px-0 py-3 text-[12px] lg:text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          ADDRESS
                        </th>
                        <th
                          scope="col"
                          // onClick={() => handleSort("inventory.stockStatus")}
                          className="px-3 lg:px-0 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          STOCK
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-black">
                      {/* try another Way */}
                      {/* Remove Comment
                      {Array.isArray(productDetails) && productDetails.map((outlet) => (
                        <tr
                          key={outlet._id}
                          className={`${outlet.id % 2 !== 0 ? "" : "bg-gray-100"
                            } hover:bg-gray-100 duration-700 `}
                        Finish Comment      */}
                      {/* //  onClick={() => {


                        //   handleUpdateProductStock(outlet?._id)

                        // }}
                        > */}
                      {/* Remove Comment
                          <td scope="col" className="px-6 lg:px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap group">
                            <div className="flex justify-start items-center">
                              <Image
                                className="w-9 h-9 rounded-md"
                                width={30}
                                height={30}
                                src={outlet?.outletImage || noPicture}
                                alt={outlet?.outletImage}
                              />
                              <div className="flex flex-col justify-center items-start ml-2 ">
                                Finish Comment */}
                      {/* <Link href={`/dashboard/products/${item._id}`}> */}
                      {/* Remove Comment
                                <span className="text-wrap">
                                  {outlet?.outletName}
                                  Finish Comment */}
                      {/* BEL Banani */}
                      {/* Remove Comment
                                </span>
                                Finish Comment */}
                      {/* </Link> */}
                      {/* Remove Comment
                              </div>
                            </div>
                          </td>
                          <td className="px-6 lg:px-0 py-4 text-sm font-medium text-gray-500 whitespace-nowrap ">
                            {outlet?.outletLocation}
                            finish Comment */}
                      {/* House-01, Road-02 */}
                      {/* Remove Comment
                          </td>

                          <td className="px-6 lg:px-0 py-4 text-sm font-medium text-center whitespace-nowrap flex justify-center">
finish Comment */}
                      {/* <Link href={`/dashboard/products/${item._id}`}> */}
                      {/* <div
                            className={`${item?.inventory?.stockStatus === "In Stock"
                              ? "bg-green-100 text-green-400"
                              : "bg-red-100 text-red-400"
                              } inline-block px-1 py-1 rounded-md mr-2 `}
                          >
                            <div className="flex justify-center px-1" onClick={() => setShowAddMenu(true)}>
                              {item?.inventory?.stockStatus}
                              <svg
                                className="cursor-pointer ml-2"
                                width="21"
                                height="22"
                                viewBox="0 0 21 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11.4863 4.02943L12.4792 3.03652C13.0276 2.48815 13.9167 2.48815 14.465 3.03652C15.0134 3.58489 15.0134 4.47398 14.465 5.02235L13.4721 6.01526M11.4863 4.02943L7.77894 7.73679C7.03854 8.47721 6.66832 8.84738 6.41623 9.29852C6.16413 9.74966 5.9105 10.8149 5.66797 11.8336C6.68662 11.591 7.75189 11.3374 8.20302 11.0853C8.65416 10.8332 9.02434 10.463 9.76476 9.7226L13.4721 6.01526M11.4863 4.02943L13.4721 6.01526"
                                  stroke="#3E445A"
                                  strokeWidth="1.0625"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M14.875 9.00024C14.875 12.0054 14.875 13.5081 13.9414 14.4417C13.0078 15.3752 11.5052 15.3752 8.5 15.3752C5.4948 15.3752 3.99219 15.3752 3.0586 14.4417C2.125 13.5081 2.125 12.0054 2.125 9.00024C2.125 5.99504 2.125 4.49244 3.0586 3.55884C3.99219 2.62524 5.4948 2.62524 8.5 2.62524"
                                  stroke="#3E445A"
                                  strokeWidth="1.0625"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                          </div> */}
                      {/* finish Comment
                            <div className="w-[166px] h-[48px] p-3 border-2 bg-gray-50 border-gray-300 rounded-lg">
                              <input
                                type="number"
                                // type="text"
                                defaultValue={outlet?.quantity}
                                // defaultValue={productStock}
                                className="font-inter font-normal w-[142px] h-[24px] bg-gray-50 text-[19px] text-center border-none focus:outline-none"
                              />

                            </div>
                            finish comment */}
                      {/* </Link> */}
                      {/* Remove Comment
                          </td>
                          finish Comment */}
                      {/* <td className="px-6 lg:px-0 py-4 text-[12px] font-medium  whitespace-nowrap ">
                            <button
                              className={`px-2 py-1 rounded-md border border-black`}
                            >
                              {item?.inventory?.inventoryStatus}
                            </button>
                          </td> */}
                      {/* Remove Comment
                        </tr>
                      ))} */}
                      {/* finish Point for Try */}
                      {Array.isArray(productDetails) && productDetails.length > 0 ? (currentDataOutput.map((outlet) => {
                        // Find the matching outlet in allOutlets by comparing _id

                        // const matchedOutlet = outlets.find((allOutlet) => allOutlet._id === outlet._id);
                        const matchedOutlet = outlets.find((allOutlet) => allOutlet.outletName === outlet.outletName);

                        return (

                          <tr
                            key={outlet._id}
                            className={`
                               hover:bg-gray-100 duration-700`}
                          //  onClick={() => {


                          //   handleUpdateProductStock(outlet?._id)

                          // }}
                          >
                            <td scope="col" className="px-6 lg:px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap group">
                              <div className="flex justify-start items-center">
                                <Image
                                  className="w-9 h-9 rounded-md"
                                  width={30}
                                  height={30}
                                  src={matchedOutlet?.outletImage || noPicture}
                                  alt={outlet?.outletImage}
                                />
                                <div className="flex flex-col justify-center items-start ml-2 ">
                                  {/* <Link href={/dashboard/products/${item._id}}> */}
                                  <span className="text-wrap">
                                    {outlet?.outletName}
                                    {/* BEL Banani */}
                                  </span>
                                  {/* </Link> */}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 lg:px-0 py-4 text-sm font-medium text-gray-500 whitespace-nowrap ">
                              {outlet?.outletLocation}
                              {/* House-01, Road-02 */}
                            </td>

                            <td className="px-6 lg:px-0 py-4 text-sm font-medium text-center whitespace-nowrap flex justify-center">
                              {/* <Link href={/dashboard/products/${item._id}}> */}
                              {/* <div
                            className={${item?.inventory?.stockStatus === "In Stock"
                              ? "bg-green-100 text-green-400"
                              : "bg-red-100 text-red-400"
                              } inline-block px-1 py-1 rounded-md mr-2 }
                          >
                            <div className="flex justify-center px-1" onClick={() => setShowAddMenu(true)}>
                              {item?.inventory?.stockStatus}
                              <svg
                                className="cursor-pointer ml-2"
                                width="21"
                                height="22"
                                viewBox="0 0 21 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11.4863 4.02943L12.4792 3.03652C13.0276 2.48815 13.9167 2.48815 14.465 3.03652C15.0134 3.58489 15.0134 4.47398 14.465 5.02235L13.4721 6.01526M11.4863 4.02943L7.77894 7.73679C7.03854 8.47721 6.66832 8.84738 6.41623 9.29852C6.16413 9.74966 5.9105 10.8149 5.66797 11.8336C6.68662 11.591 7.75189 11.3374 8.20302 11.0853C8.65416 10.8332 9.02434 10.463 9.76476 9.7226L13.4721 6.01526M11.4863 4.02943L13.4721 6.01526"
                                  stroke="#3E445A"
                                  strokeWidth="1.0625"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M14.875 9.00024C14.875 12.0054 14.875 13.5081 13.9414 14.4417C13.0078 15.3752 11.5052 15.3752 8.5 15.3752C5.4948 15.3752 3.99219 15.3752 3.0586 14.4417C2.125 13.5081 2.125 12.0054 2.125 9.00024C2.125 5.99504 2.125 4.49244 3.0586 3.55884C3.99219 2.62524 5.4948 2.62524 8.5 2.62524"
                                  stroke="#3E445A"
                                  strokeWidth="1.0625"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                          </div> */}
                              <div className="w-[166px] h-[48px] p-3 border-2 bg-gray-50 border-gray-300 rounded-lg">
                                <input
                                  type="number"
                                  // type="text"
                                  defaultValue={outlet?.quantity}
                                  // defaultValue={productStock}
                                  className="font-inter font-normal w-[142px] h-[24px] bg-gray-50 text-[19px] text-center border-none focus:outline-none"
                                />

                              </div>
                              {/* </Link> */}
                            </td>
                            {/* <td className="px-6 lg:px-0 py-4 text-[12px] font-medium  whitespace-nowrap ">
                            <button
                              className={px-2 py-1 rounded-md border border-black}
                            >
                              {item?.inventory?.inventoryStatus}
                            </button>
                          </td> */}
                          </tr>
                        );
                      })
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center py-4">No product details available.</td>
                        </tr>
                      )}

                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 border-t flex justify-center">
                <button onClick={handleUpdateStock}
                  className="w-full bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">Save Changes</button>
              </div>
            </div>
          </div>

        </div>
      </Modal>
    </main>
  );
}
