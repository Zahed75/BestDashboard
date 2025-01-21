"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { CiMenuFries, CiMenuBurger } from "react-icons/ci";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Loading from "@/app/dashboard/loading";
import Pagination from "@/components/global/pagination/Pagination";
import { fetchApi } from "@/utils/FetchApi";
import { useRouter } from "next/navigation";
import { FaCaretDown, FaFilter } from "react-icons/fa";
import { MdFilterAltOff } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "@/redux/slice/usersSlice";
import { fetchOutlets } from "@/redux/slice/outletSlice";

export default function OrderTable({ AllOrders }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage] = useState(10);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showButton, setShowButton] = useState(true);
  const [showAction, setShowAction] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Both Payment Methods");
  const [filterData, setFilterData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [user, setUser] = useState([]);
  const [orders, setOrders] = useState(AllOrders || []);

  const router = useRouter();
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users.users);
  const outlets = useSelector((state) => state.outlets);
  const allOutlets = outlets?.outlets?.outlet || [];
  const data = filterData.length > 0 ? filterData : orders;

  useEffect(() => {
    setOrders(AllOrders || []);
  }, [AllOrders]);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchOutlets());
  }, [dispatch]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!(user?.userId)) return;

      try {
        const data = await fetchApi(`/auth/users/${user?.userId}`, "GET");
        setUser(data?.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }

    };
    fetchData();
  }, [user]);

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


  // console.log("User_Details", user);

  const titleDataOptions = [
    { value: "All", label: "All" },
    { value: "Received", label: "Received" },
    { value: "Order Placed", label: "Placed" },
    { value: "Order Confirmed", label: "Confirmed" },
    { value: "Order Processing", label: "Processing" },
    { value: "Ready for Delivery", label: "Ready" },
    { value: "Order Dispatched", label: "Dispatched" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Order Delivered", label: "Delivered" },
  ];

  const handleTitleButtonClick = (title) => {
    setSearchQuery(title === "All" ? "" : title);
  };

  const filteredData = data?.filter((item) =>
    Object.values(item).some(
      (value) =>
        value != null &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const sortedData = filteredData?.sort((a, b) => {
    if (!sortBy) return 0;
    const aValue = a[sortBy]?.toString().toLowerCase();
    const bValue = b[sortBy]?.toString().toLowerCase();
    return sortDirection === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const indexOfLastData = currentPage * dataPerPage;
  const indexOfFirstData = indexOfLastData - dataPerPage;
  const currentData = sortedData?.slice(indexOfFirstData, indexOfLastData);
  const pdfData = sortedData;

  const sortedData_filter = filterData?.sort((a, b) => {
    if (!sortBy) return 0;
    const aValue = a[sortBy]?.toString().toLowerCase();
    const bValue = b[sortBy]?.toString().toLowerCase();
    return sortDirection === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const currentData_filter = sortedData_filter?.slice(indexOfFirstData, indexOfLastData);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const firstItemIndex = (currentPage - 1) * dataPerPage + 1;
  const lastItemIndex = Math.min(currentPage * dataPerPage, data?.length);
  const totalItems = data?.length;

  const showingText = `Showing ${firstItemIndex}-${lastItemIndex} of ${totalItems}`;

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const getOutletName = (outletId) => {
    const outlet = outlets?.outlets?.outlet?.find((outlet) => outlet?._id === outletId);
    return outlet ? outlet.outletName : outletId;
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedItems(selectAll ? [] : data.map((item) => item._id));
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(itemId)
        ? prevSelectedItems.filter((id) => id !== itemId)
        : [...prevSelectedItems, itemId]
    );
  };

  const handleDeleteOrder = async () => {
    try {
      let updatedOrders = [...orders];
      for (const itemId of selectedItems) {
        const response = await fetchApi(
          `/order/deleteOrder/${itemId}`,
          "DELETE"
        );
        if (response) {
          updatedOrders = updatedOrders.filter((item) => item._id !== itemId);
        } else {
          console.log(`Failed to delete category with ID ${itemId}.`);
        }
      }
      setSelectedItems([]);
      setOrders(updatedOrders);
      console.log("Selected categories deleted successfully!");
    } catch (err) {
      console.log("An error occurred while deleting selected categories.", err);
    }
  };

  const handleUpdateOrder = async () => {
    try {
      for (const itemId of selectedItems) {
        router.push(`/dashboard/orders/${itemId}`);
      }
    } catch (error) {
      console.log(
        "An error occurred while updating selected categories.",
        error
      );
    }
  };

  function formatDate(dateString) {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    if (isNaN(date)) return "N/A";

    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  }

  const advanceFilterHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Destructure the form elements
      const {
        filterOutlet,
        filterOrderStatus,
        filterPaymentMethod,
        filterChannel,
        filterStartDate,
        filterEndDate,
      } = e.target.elements;

      // Retrieve the filter values
      const outlet = filterOutlet.value;
      const status = filterOrderStatus.value;
      const paymentMethod = filterPaymentMethod.value;
      const channel = filterChannel.value;
      const startDate = filterStartDate.value
        ? new Date(filterStartDate.value)
        : null;
      const endDate = filterEndDate.value
        ? new Date(filterEndDate.value)
        : null;

      if (startDate && endDate && startDate > endDate) {
        alert("Start date cannot be greater than end date.");
        setIsLoading(false);
        return;
      }

      if (startDate && endDate) {
        setStartDate(startDate);
        setEndDate(endDate);
      } else {
        setStartDate(null);
        setEndDate(null);
      }

      if (paymentMethod === "Both Payment Methods") {
        setPaymentMethod("Both Payment Methods");
      } else {
        setPaymentMethod(paymentMethod);
      }

      // Filter orders based on the provided criteria
      const filteredOrders = AllOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);

        // const outletMatch = outlet === "allOutlets" || order.outlet === outlet;
        // const statusMatch = status === "allStatus" || order.orderStatus === status;
        // const paymentMethodMatch = paymentMethod ===
        //   "Both Payment Methods" || order.paymentMethod === paymentMethod;
        // const channelMatch = channel === "allChannel" || order.channel === channel;
        // const startDateMatch = !startDate || orderDate >= startDate;
        // const endDateMatch = !endDate || orderDate <= endDate;
        const startDateMatch = !startDate || orderDate >= startDate;
        const endDateMatch = !endDate || orderDate <= endDate;
        const channelMatch = order.channel === channel;
        const paymentMethodMatch = order.paymentMethod === paymentMethod;
        const statusMatch = "allStatus" === status || order.orderStatus === status;
        const outletMatch = "allOutlets" === outlet || order.outlet === outlet;

        return (
          // outletMatch &&
          // statusMatch &&
          // paymentMethodMatch &&
          // channelMatch &&
          startDateMatch &&
          endDateMatch &&
          outletMatch &&
          paymentMethodMatch &&
          channelMatch &&
          statusMatch
        );
      });

      // Update state with the filtered data
      if (filteredOrders.length === 0) {
        setFilterData([]);
      }
      setFilterData(filteredOrders);
      setShowFilter(false);
      console.log("Filtered data:", filteredOrders);
    } catch (error) {
      console.log("An error occurred while filtering data.", error);
    }

    setIsLoading(false);
  };

  const totalOrders = data?.length;
  const uniqueCustomers = new Set(data?.map((order) => order?.customer)).size;

  let deliveredCount = 0;
  let cancelledCount = 0;
  let otherCount = 0;
  let deliveredTotalTaka = 0;
  let cancelledTotalTaka = 0;
  let otherTotalTaka = 0;
  data?.forEach((order) => {
    if (order.orderStatus === "Order Delivered") {
      deliveredCount++;
      deliveredTotalTaka += order.totalPrice;
    } else if (order.orderStatus === "Cancelled") {
      cancelledCount++;
      cancelledTotalTaka += order.totalPrice;
    } else {
      otherCount++;
      otherTotalTaka += order.totalPrice;
    }
  });

  const today = new Date();
  const defaultDate = formatDate(today);
  const reportDate =
    startDate && endDate
      ? `${formatDate(startDate)} to ${formatDate(endDate)}`
      : `${defaultDate}`;

  const exportPdf = async () => {
    const doc = new jsPDF({ orientation: "landscape" });

    const img = new Image();
    img.src = "https://i.ibb.co/RpLHjCv/log.png";
    img.onload = () => {
      // Set font size
      doc.setFontSize(12);

      // Header information
      doc.text("Order Summary Report:", 10, 20);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(`Payment Method: ${paymentMethod}`, 10, 30);
      doc.text(`Report Generated on: ${reportDate}`, 10, 35);

      doc.setTextColor(0, 0, 0);
      doc.text("Account Details:", 10, 45);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(`Outlet Name: ${user.role === "HQ" || user.role === "AD" ? "Head Office" : `${user.outlet}`}`, 10, 60);
      // doc.text(
      //   `Account Name: ${user.firstName}  ${user.lastName}`,
      //   10,
      //   55
      // );
      doc.text(
        `Outlet ${user.role === "MGR" ? "Manager" : "Authorized Person"}: ${user.firstName}  ${user.lastName}`,
        10,
        55
      );
      // doc.text("Account Address: Head Office", 10, 60);
      // doc.text(`Account Address: ${user.role === "HQ" || user.role === "AD" ? "Head Office" : `${user.outlet} Branch`}`, 10, 60);



      // Add the company logo
      const logoWidth = 90;
      const logoHeight = 15;
      const rightMargin = 10;
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoX = pageWidth - logoWidth - rightMargin;
      const logoY = 10;
      doc.addImage(img, "PNG", logoX, logoY, logoWidth, logoHeight);

      // Head Office information
      const headOfficeX = logoX;
      const headOfficeY = logoY + logoHeight + 20;
      doc.setTextColor(0, 0, 0);
      doc.text("Head Office:", headOfficeX, headOfficeY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(
        "Level 16, City Center, 90/1, Motijheel C/A",
        headOfficeX,
        headOfficeY + 10
      );
      doc.text("Dhaka, Bangladesh", headOfficeX, headOfficeY + 15);

      const totalPrice = pdfData?.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      doc.autoTable({
        html: "#my-table",
        startY: 70,
        headStyles: {
          fillColor: "#F26522",
          textColor: [255, 255, 255],
        },
        columnStyles: {
          0: { cellWidth: 40 }, // Order column width
          1: { cellWidth: 45 }, // Customer column width
          2: { cellWidth: 30 }, // Phone column width
          3: { cellWidth: 40 }, // Payment Method column width
          4: { cellWidth: 40 }, // Order time column width
          5: { cellWidth: 20 }, // Channel column width
          6: { cellWidth: 30 }, // Status column width
          7: { cellWidth: 30 }, // Amount column width
        },
        margin: { left: 10, right: 10 },
      });

      const marginBottom = 20;
      const pageHeight = doc.internal.pageSize.getHeight();

      const rightX = pageWidth - 90; // Adjust this to position it on the right
      const lineXStart = rightX;
      const lineXEnd = rightX + 75; // Length of the underline

      const textBlockHeight = 30;
      const tableStartY = pageHeight - marginBottom - textBlockHeight - 5;

      const paymentProportionY = pageHeight - marginBottom - 30;

      // Calculate total payments
      const onlinePayments = data
        .filter((order) => order.paymentMethod === "Online Payment")
        .reduce((sum, order) => sum + order.totalPrice, 0);
      const codPayments = data
        .filter((order) => order.paymentMethod === "Cash On Delivery")
        .reduce((sum, order) => sum + order.totalPrice, 0);

      // Calculate total orders for each payment method
      const totalOnlineOrders = data.filter(
        (order) => order.paymentMethod === "Online Payment"
      ).length;
      const totalCodOrders = data.filter(
        (order) => order.paymentMethod === "Cash On Delivery"
      ).length;

      const paymentRatioOnline = totalOnlineOrders
        ? ((onlinePayments / totalPrice) * 100).toFixed(2) + "%"
        : "0%";
      const paymentRatioCod = totalCodOrders
        ? ((codPayments / totalPrice) * 100).toFixed(2) + "%"
        : "0%";

      const totalOnlineOrdersTaka = data
        .filter((order) => order.paymentMethod === "Online Payment")
        .reduce((sum, order) => sum + order.totalPrice, 0)
        .toLocaleString();
      const totalCodOrdersTaka = data
        .filter((order) => order.paymentMethod === "Cash On Delivery")
        .reduce((sum, order) => sum + order.totalPrice, 0)
        .toLocaleString();

      // Add text on the right
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Payment proportion`, rightX, paymentProportionY);
      doc.line(
        lineXStart,
        paymentProportionY + 2,
        lineXEnd,
        paymentProportionY + 2
      );

      doc.text(
        `Online: ${totalOnlineOrdersTaka} BDT (${paymentRatioOnline})`,
        rightX,
        pageHeight - marginBottom - 20
      );
      doc.text(
        `Cash On Delivery: ${totalCodOrdersTaka} BDT (${paymentRatioCod})`,
        rightX,
        pageHeight - marginBottom - 10
      );

      // Calculate the percentages for the table data
      const deliveredPercentage =
        ((deliveredCount / totalOrders) * 100).toFixed(0) + "%";
      const cancelledPercentage =
        ((cancelledCount / totalOrders) * 100).toFixed(0) + "%";
      const otherPercentage =
        ((otherCount / totalOrders) * 100).toFixed(0) + "%";

      // Create the table on the left, aligned with the text on the right
      const deliveredCustomers = new Set(
        data
          .filter((order) => order.orderStatus === "Order Delivered")
          .map((order) => order.customer)
      ).size;

      const cancelledCustomers = new Set(
        data
          .filter((order) => order.orderStatus === "Cancelled")
          .map((order) => order.customer)
      ).size;

      const totalCustomers =
        deliveredCustomers + cancelledCustomers + otherCount;

      doc.autoTable({
        head: [
          ["Status", "Orders", "Customers", "Percentage", "Total Amount (BDT)"],
        ],
        body: [
          [
            `Delivered`,
            deliveredCount,
            deliveredCustomers,
            `${deliveredPercentage}`,
            `${deliveredTotalTaka.toLocaleString()}`,
          ],
          [
            `Cancelled`,
            cancelledCount,
            cancelledCustomers,
            `${cancelledPercentage}`,
            `${cancelledTotalTaka.toLocaleString()}`,
          ],
          [
            `Other`,
            otherCount,
            totalCustomers - deliveredCustomers - cancelledCustomers,
            `${otherPercentage}`,
            `${otherTotalTaka.toLocaleString()}`,
          ],
          [
            `Total`,
            totalOrders,
            totalCustomers,
            `100%`,
            `${totalPrice.toLocaleString()}`,
          ],
        ],
        startY: tableStartY, // Align table with the bottom text
        headStyles: { fillColor: "#F26522", textColor: [255, 255, 255] },
        margin: { left: 10, right: pageWidth / 2 + 10 },
      });

      doc.save("dataTable.pdf");
    };
  };

  return (
    <main>
      {isLoading && <Loading />}

      <div className="grid grid-cols-1 md:grid-cols-3 justify-between items-center gap-y-3 mt-5 border-b-2 pb-5">
        <div className="flex justify-between md:justify-start items-center  w-full">
          <h5 className="text-lg md:text-2xl font-bold">All Orders</h5>
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
        <div className="flex flex-col md:col-span-2 md:flex-row justify-between items-center gap-3 ml-auto w-full">
          {/* search bar */}
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
              className="peer h-full w-full outline-none text-sm text-gray-500 bg-[#F9FAFB] pr-2 "
              type="text"
              id="search"
              placeholder="Search something.."
            />
          </div>
          <div className="flex justify-between items-center gap-3 ml-auto w-full">
            <div className="flex justify-between items-center gap-3 w-full">
              <div className="ml-auto border border-[#F9FAFB] bg-[#F9FAFB] rounded-lg shadow-md w-full">
                <button
                  onClick={exportPdf}
                  className="flex mx-auto py-2 text-nowrap"
                >
                  Export As &#x2193;
                </button>
              </div>
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
                        onClick={handleUpdateOrder}
                        className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 w-full"
                      >
                        Update
                      </button>
                    </li>
                    {(user?.role === "HQ" || user?.role === "AD") && (
                      <li>
                        <button
                          onClick={handleDeleteOrder}
                          className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 w-full"
                        >
                          Delete
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="font-bold py-2 px-4 rounded-lg shadow-md focus:outline-0 focus:ring-0 flex justify-center items-center bg-[#F9FAFB] text-gray-500 hover:bg-gray-100 duration-700 min-w-24"
              >
                Filter
                <FaFilter
                  className={`${!showFilter ? "block" : "hidden"
                    } cursor-pointer ml-1 w-4 h-4 flex justify-center items-center mx-auto text-gray-500`}
                />
                <MdFilterAltOff
                  className={`${showFilter ? "block" : "hidden"
                    } cursor-pointer ml-1 w-6 h-6 flex justify-center items-center mx-auto text-gray-500`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* button component */}
      <div
        className={`
      ${showButton ? "flex" : "hidden"}
       flex-col md:flex-row gap-2 pb-5 border-b-2 justify-start items-center mt-5 `}
      >
        {titleDataOptions?.map((title, index) => (
          <button
            key={index}
            onClick={() => handleTitleButtonClick(title?.value)}
            className="bg-gray-100 text-gray-500 px-3 py-2 text-sm lg:text-md rounded-md hover:bg-black hover:text-white duration-700 shadow-md w-full"
          >
            {title?.label}
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
                  <table className="min-w-full table-auto dark:divide-gray-700 overflow-x-scroll">
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
                          onClick={() => handleSort("orderId")}
                          className="px-12 py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          Order &#x21d5;
                        </th>
                        <th
                          scope="col"
                          onClick={() => handleSort("createdAt")}
                          className="px-3 py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          Order time &#x21d5;
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                        >
                          Outlet
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          Order Type
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          onClick={() => handleSort("channel")}
                          className="px-3 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          Channel &#x21d5;
                        </th>

                        <th
                          scope="col"
                          onClick={() => handleSort("orderStatus")}
                          className="px-3 py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          Status &#x21d5;
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-black">
                      {/* {currentData?.map((item) => ( */}
                      {(currentData_filter && currentData_filter.length > 0 ? currentData_filter : currentData)?.map((item) => (
                        <tr
                          key={item._id}
                          className={`${item._id % 2 !== 0 ? "" : "bg-gray-100"
                            } hover:bg-gray-100 duration-700`}
                        >
                          <td scope="col" className="p-4">
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
                          <td className="py-4 text-sm font-medium text-gray-900 whitespace-nowrap underline underline-offset-2">
                            <Link href={`/dashboard/orders/${item._id}`}>
                              {item.orderId}
                            </Link>
                          </td>
                          <td className="py-4 text-sm font-medium text-gray-500 whitespace-nowrap ">
                            {formatDate(item.createdAt)}
                          </td>

                          <td className="py-4 text-sm text-center font-medium text-gray-900 whitespace-nowrap" key={item?._id}>
                            {getOutletName(item.outlet)}
                          </td>
                          <td className="py-4 text-sm font-medium text-gray-900 text-center whitespace-nowrap ">
                            {item.orderType}
                          </td>
                          <td className="py-4 text-sm font-medium text-gray-900 text-center whitespace-nowrap ">
                            <span className="text-md">৳</span>
                            {item.totalPrice.toLocaleString()}
                          </td>
                          <td className="py-4 text-sm font-medium text-gray-900 text-center whitespace-nowrap ">
                            {item.channel}
                          </td>

                          <td className="py-4 text-[12px] font-medium  whitespace-nowrap ">
                            <span
                              className={`${item.orderStatus === "Received"
                                ? "bg-yellow-200 text-yellow-800"
                                : item.orderStatus === "Order Confirmed"
                                  ? "bg-blue-200 text-blue-800"
                                  : item.orderStatus === "Order Delivered"
                                    ? "bg-green-200 text-green-800"
                                    : item.orderStatus === "Order Placed"
                                      ? "bg-cyan-200 text-cyan-800"
                                      : item.orderStatus === "Order Processing"
                                        ? "bg-fuchsia-200 text-fuchsia-800"
                                        : item.orderStatus === "Ready for Delivery"
                                          ? "bg-teal-200 text-teal-800"
                                          : item.orderStatus === "Cancelled"
                                            ? "bg-red-200 text-red-800"
                                            : item.orderStatus === "Order Dispatched"
                                              ? "bg-orange-200 text-orange-800"
                                              : ""
                                } px-2 py-1 rounded-full`}
                            >
                              {item.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* table for pdf */}
                  <table
                    id="my-table"
                    className="min-w-full table-auto dark:divide-gray-700 hidden"
                  >
                    <thead className="bg-gray-100 ">
                      <tr>
                        <th
                          scope="col"
                          className="py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                        >
                          Order
                        </th>
                        <th
                          scope="col"
                          className="py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                        >
                          Customer
                        </th>
                        <th
                          scope="col"
                          className="py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                        >
                          Phone
                        </th>
                        <th
                          scope="col"
                          className="py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                        >
                          PaymentMethod
                        </th>
                        <th
                          scope="col"
                          className="px-8 lg:px-0 py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          Order time
                        </th>

                        <th
                          scope="col"
                          className="px-8 lg:px-0 py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          Channel
                        </th>

                        <th
                          scope="col"
                          className="px-8 lg:px-0 py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-8 lg:px-0 py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                        >
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-black">
                      {pdfData?.map((item) => (
                        <tr
                          key={item._id}
                          className={`${item._id % 2 !== 0 ? "" : "bg-gray-100"
                            } hover:bg-gray-100 duration-700`}
                        >
                          <td className="py-4 text-sm font-medium text-gray-900 whitespace-nowrap underline underline-offset-2">
                            {item.orderId}
                          </td>
                          <td className="py-4 text-sm font-medium text-gray-900 whitespace-nowrap underline underline-offset-2">
                            {item.firstName + " " + item.lastName}
                          </td>
                          <td className="py-4 text-sm font-medium text-gray-900 whitespace-nowrap underline underline-offset-2">
                            {item.phoneNumber}
                          </td>
                          <td className="py-4 text-sm font-medium text-gray-900 whitespace-nowrap underline underline-offset-2">
                            {item.paymentMethod}
                          </td>
                          <td className="py-4 text-sm font-medium text-gray-500 whitespace-nowrap ">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="py-4 text-sm font-medium text-gray-900 whitespace-nowrap ">
                            {item.channel}
                          </td>
                          <td className="py-4 text-[12px] font-medium  whitespace-nowrap ">
                            <span
                              className={`${item.orderStatus === "Received"
                                ? "bg-yellow-200 text-yellow-800"
                                : item.orderStatus === "Confirmed"
                                  ? "bg-blue-200 text-blue-800"
                                  : item.orderStatus === "Delivered"
                                    ? "bg-green-200 text-green-800"
                                    : item.orderStatus === "On-Hold"
                                      ? "bg-red-200 text-red-800"
                                      : item.orderStatus === "Spammed"
                                        ? "bg-red-200 text-red-800"
                                        : item.orderStatus === "Cancelled"
                                          ? "bg-red-200 text-red-800"
                                          : item.orderStatus === "Dispatched"
                                            ? "bg-orange-200 text-orange-600"
                                            : ""
                                } px-2 py-1 rounded-full`}
                            >
                              {item.orderStatus}
                            </span>
                          </td>
                          <td className="py-4 text-sm font-medium text-gray-900 whitespace-nowrap ">
                            {item.totalPrice.toLocaleString()}
                          </td>
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

      <div
        className={`${showFilter ? "flex" : "hidden"
          } fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-50 items-center justify-center`}
      >
        <div className="bg-white w-11/12 md:w-1/3 mx-auto my-10 rounded-lg shadow-lg p-5">
          <div className="flex justify-between items-center">
            <h5 className="text-lg font-bold">Filter</h5>
            <IoMdClose
              onClick={() => setShowFilter(false)}
              className="p-1 rounded-full bg-gray-100 w-6 h-6 cursor-pointer"
            />
          </div>
          <form
            onSubmit={advanceFilterHandler}
            className="flex flex-col gap-3 mt-5"
          >
            <div className="">
              <label
                htmlFor="filterOutlet"
                className="text-sm font-semibold text-gray-600"
              >
                Outlet
              </label>{" "}
              <br />
              <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                <select
                  name="filterOutlet"
                  id="filterOutlet"
                  // disabled
                  // defaultValue={}
                  //  onChange={handleFilterOutlet}
                  className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                >
                  <option value="allOutlets">Select an Outlet</option>
                  {allOutlets.map((outlet) => (
                    <option
                      key={outlet?._id}
                      value={outlet?.outletName}
                    >
                      {outlet?.outletName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="">
              <label
                htmlFor="filterOrderStatus"
                className="text-sm font-semibold text-gray-600"
              >
                Order Status
              </label>{" "}
              <br />
              <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                <select
                  name="filterOrderStatus"
                  id="filterOrderStatus"
                  className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                >
                  <option value="allStatus">Select a Status</option>
                  <option value="Received">Received</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="On-Hold">On-Hold</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Spammed">Spammed</option>
                </select>
              </div>
            </div>
            <div className="">
              <label
                htmlFor="filterChannel"
                className="text-sm font-semibold text-gray-600"
              >
                Channel
              </label>{" "}
              <br />
              <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                <select
                  name="filterChannel"
                  id="filterChannel"
                  required
                  className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                >
                  <option value="allChannel">Select a Channel</option>
                  <option value="mobile">Mobile</option>
                  <option value="web">Web</option>
                </select>
              </div>
            </div>
            <div className="">
              <label
                htmlFor="filterPaymentMethod"
                className="text-sm font-semibold text-gray-600"
              >
                Payment Method
              </label>
              <br />
              <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                <select
                  name="filterPaymentMethod"
                  id="filterPaymentMethod"
                  required
                  className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                >
                  <option value="Both Payment Methods">
                    Both Payment Methods
                  </option>
                  <option value="Cash On Delivery">Cash On Delivery</option>
                  <option value=">Online Payment">Online Payment</option>
                </select>
              </div>
            </div>

            <div className="">
              <label
                htmlFor="filterDateRange"
                className="text-sm font-semibold text-gray-600"
              >
                Date Range
              </label>{" "}
              <br />
              <div className="grid grid-cols-2 justify-between items-center gap-3">
                <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                  <input
                    type="date"
                    name="filterStartDate"
                    id="filterStartDate"
                    className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                    required
                  />
                </div>
                <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                  <input
                    type="date"
                    name="filterEndDate"
                    id="filterEndDate"
                    className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="p-2 rounded-lg bg-black text-white w-full mt-5"
              >
                Apply Filter
              </button>
            </div>
          </form>
        </div>
      </div>
    </main >
  );
}
