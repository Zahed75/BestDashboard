"use client";
import CustomerDynamicHead from "@/components/dashboard/customers/dynamic/CustomerDynamichead";
import { fetchApi } from "@/utils/FetchApi";
import useImgBBUpload from "@/utils/useImgBBUpload";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ImageUploadModal from "@/components/global/modal/ImageUploadModal ";
import { removeImage } from "@/redux/slice/imagesSlice";
import { useDispatch, useSelector } from "react-redux";

export default function SingleCustomer({ customer }) {
  const [districts, setDistricts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomerImageDeleted, setIsCustomerImageDeleted] = useState(false);
  const [customerImage, setCustomerImage] = useState("");

  const dispatch = useDispatch();
  const selectedImages = useSelector((state) => state.images.selectedImages);


  const { error, handleUpload, imageUrl, uploading } = useImgBBUpload();

  const router = useRouter();

  const handleUserImgFileChange = async (event) => {
    const file = event.target.files[0];
    setIsLoading(true);

    try {
      const uploadedImageUrl = await handleUpload(file);

      setIsLoading(false);
      console.log(uploadedImageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCustomerImage(customer?.profilePicture);
    const fetchDistricts = async () => {
      try {
        const res = await fetch("https://bdapis.com/api/v1.2/districts");
        const data = await res.json();
        setDistricts(data?.data || []);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };

    fetchDistricts();
  }, []);

  const handleUpdateCustomer = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);

    const data = {
      userName: form.get("userName"),
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      phoneNumber: form.get("phoneNumber"),
      city: form.get("city"),
      profilePicture: customerImage || "http://service.bestelectronics.com.bd/media/images/user.png",
      billingInfo: {
        firstName: form.get("billingFirstName"),
        lastName: form.get("billingLastName"),
        district: form.get("billingDistrict"),
        zipCode: form.get("billingZipCode"),
        fullAddress: form.get("billingFullAddress"),
        phoneNumber: form.get("billingPhoneNumber"),
        email: form.get("billingEmail"),
      },
      shippingInfo: {
        firstName: form.get("shippingFirstName"),
        lastName: form.get("shippingLastName"),
        district: form.get("shippingDistrict"),
        zipCode: form.get("shippingZipCode"),
        fullAddress: form.get("shippingFullAddress"),
        phoneNumber: form.get("shippingPhoneNumber"),
        email: form.get("shippingEmail"),
      },
    };
    console.log(data);
    try {
      const response = fetchApi(
        `/customer/updateCustomer/${customer?._id}`,
        "PATCH",
        data
      );

      if (response) {
        setIsLoading(false);
        router.push("/dashboard/customers");
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const copyBillingInfo = () => {
    const form = document.forms[0]; // Assuming this is the first form on the page
    const billingFirstName = form.billingFirstName.value;
    const billingLastName = form.billingLastName.value;
    const billingDistrict = form.billingDistrict.value;
    const billingZipCode = form.billingZipCode.value;
    const billingFullAddress = form.billingFullAddress.value;
    const billingPhoneNumber = form.billingPhoneNumber.value;
    const billingEmail = form.billingEmail.value;

    form.shippingFirstName.value = billingFirstName;
    form.shippingLastName.value = billingLastName;
    form.shippingDistrict.value = billingDistrict;
    form.shippingZipCode.value = billingZipCode;
    form.shippingFullAddress.value = billingFullAddress;
    form.shippingPhoneNumber.value = billingPhoneNumber;
    form.shippingEmail.value = billingEmail;
  };

  const handleRemoveProductPicture = () => {
    setCustomerImage("");
  };
  const handleRemoveCustomerPicture = async () => {
    dispatch(removeImage());
    setIsCustomerImageDeleted(true);
  };

  console.log("single customer", customer);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  return (
    <main className="">
      <form onSubmit={handleUpdateCustomer} className="w-full">
        <section className="mt-10 flex justify-between items-center">
          <CustomerDynamicHead customer={customer} />
          <button
            type="submit"
            className="text-sm text-white bg-black rounded-md px-3 py-2 text-nowrap"
          >
            {isLoading ? "Updating Customer..." : "Update Customer"}
          </button>
        </section>

        <section className="grid grid-cols-1 justify-between items-start gap-5 w-full my-10">
          <div className="flex flex-col justify-start items-center w-full col-span-2 space-y-5">
            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-3">General</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 justify-between items-start gap-5">
                {customerImage || "http://service.bestelectronics.com.bd/media/images/user.png" ? (
                  <div className="relative w-[145px] h-[145px] rounded-md">
                    <Image
                      src={customerImage || "http://service.bestelectronics.com.bd/media/images/user.png"}
                      alt="customer-profile-picture"
                      width={145}
                      height={145}
                      className="w-[145px] h-[145px] object-cover rounded-md"
                    />
                    {/* <button
                      type="button"
                      onClick={() => handleRemoveProductPicture()}
                      className="absolute -top-1 -right-1 bg-red-400 w-5 h-5 rounded-full font-bold text-sm text-white flex justify-center items-center pb-1 shadow-md"
                    >
                      x
                    </button> */}
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      name="file-upload"
                      onChange={handleUserImgFileChange}
                      className="hidden "
                    />
                    <label
                      htmlFor="file-upload"
                      className="z-20 flex flex-col-reverse items-center justify-center w-[145px] h-[145px] cursor-pointer border py-2 bg-gray-200 rounded-md"
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
                )}
                {/* <div className="flex flex-col justify-between items-start space-y-3">
                  {customerImage && (
                    <div
                      className={`flex flex-col w-full ${isCustomerImageDeleted ? "hidden" : "block"
                        }`}
                    >
                      <Image
                        width={145}
                        height={145}
                        src={customerImage}
                        alt="Uploaded"
                        className="w-[145px] h-[145px] rounded-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveCustomerPicture}
                        className="text-sm text-red-500 flex justify-start py-2 underline underline-offset-2"
                      >
                        Remove customer Image
                      </button>
                    </div>
                  )}
                  {isCustomerImageDeleted && (
                    <div className="flex flex-col w-[145px]">
                      {selectedImages && (
                        <div>
                          <Image
                            width={145}
                            height={145}
                            src={selectedImages}
                            alt="Uploaded"
                            className="w-[145px] h-[145px] rounded-md"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveCustomerPicture}
                            className="text-sm text-red-500 flex justify-start py-2 underline underline-offset-2"
                          >
                            Remove Customer Image
                          </button>
                        </div>
                      )}

                      {!selectedImages ? (
                        <div onClick={openModal}>
                          <div className="z-20 flex flex-col-reverse items-center justify-center w-[145px] h-[145px] cursor-pointer border py-2 bg-gray-200 rounded-md">
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
                          <p className="text-xs text-red-500">
                            * Upload an image for the Customer
                          </p>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  )}
                </div> */}

                <div className="md:col-span-3 ">
                  <div className="grid grid-cols-3 justify-between items-center gap-5">
                    <div className="flex flex-col space-y-1 w-full">
                      <label
                        htmlFor="userName"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        id="userName"
                        name="userName"
                        defaultValue={customer?.userName}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none "
                      />
                    </div>
                    <div className="flex flex-col space-y-1 w-full">
                      <label
                        htmlFor="firstName"
                        className="text-sm font-semibold text-gray-600"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        defaultValue={customer?.firstName}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none "
                      />
                    </div>

                    <div className="flex flex-col space-y-1 w-full">
                      <label
                        htmlFor="lastName"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        defaultValue={customer?.lastName}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none "
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 justify-between items-center gap-5 mt-5">
                    <div className="flex flex-col space-y-1 w-full">
                      <label
                        htmlFor="email"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        readOnly
                        defaultValue={customer?.email}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col space-y-1 w-full">
                      <label
                        htmlFor="phone"
                        className="text-sm font-semibold text-gray-600"
                      >
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        defaultValue={customer?.phoneNumber}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none "
                      />
                    </div>
                  </div>
                  <div className="space-y-1 w-full mt-5">
                    <label
                      className="text-sm font-semibold text-gray-600"
                      htmlFor="city"
                    >
                      City
                    </label>
                    <select
                      className="border border-gray-300 bg-transparent rounded-md w-full py-2 px-3 focus:outline-0"
                      name="city"
                      id="city"
                      defaultValue={customer?.city}
                      required
                    >
                      {customer?.city ? (
                        <option value={customer?.city}>{customer?.city}</option>
                      ) : (
                        <option value="">Select City</option>
                      )}
                      {districts?.map((district, index) => (
                        <option key={index} value={district.district}>
                          {district.district}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-5">Billing Info</h5>
              <div className="grid grid-cols-2 justify-between items-center gap-5 pb-5">
                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="billingFirstName"
                    className="text-sm font-semibold text-gray-600"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="billingFirstName"
                    name="billingFirstName"
                    defaultValue={customer?.billingInfo?.firstName}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none "
                  />
                </div>
                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="billingLastName"
                    className="text-sm font-semibold text-gray-600"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="billingLastName"
                    name="billingLastName"
                    defaultValue={customer?.billingInfo?.lastName}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none "
                  />
                </div>
                <div className="space-y-1 w-full">
                  <label
                    className="text-sm font-semibold text-gray-600"
                    htmlFor="billingDistrict"
                  >
                    District
                  </label>
                  <select
                    className="border border-gray-300 bg-transparent rounded-md w-full py-2 px-3 focus:outline-0"
                    name="billingDistrict"
                    id="billingDistrict"
                    defaultValue={customer?.billingInfo?.district}
                  >
                    {customer?.billingInfo?.district ? (
                      <option value={customer?.billingInfo?.district}>
                        {customer?.billingInfo?.district}
                      </option>
                    ) : (
                      <option value="">Select District</option>
                    )}
                    {districts?.map((district, index) => (
                      <option key={index} value={district.district}>
                        {district.district}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="billingZipCode"
                    className="text-sm font-semibold text-gray-600"
                  >
                    PostalCode / Zip
                  </label>
                  <input
                    type="text"
                    id="billingZipCode"
                    name="billingZipCode"
                    defaultValue={customer?.billingInfo?.zipCode}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none "
                  />
                </div>
                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="billingFullAddress"
                    className="text-sm font-semibold text-gray-600"
                  >
                    full Address
                  </label>
                  <input
                    type="text"
                    id="billingFullAddress"
                    name="billingFullAddress"
                    defaultValue={customer?.billingInfo?.fullAddress}
                    placeholder="House No, Road No, Area"
                    className="border border-gray-300 rounded-md p-2 focus:outline-none "
                  />
                </div>
                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="billingPhoneNumber"
                    className="text-sm font-semibold text-gray-600"
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="billingPhoneNumber"
                    name="billingPhoneNumber"
                    defaultValue={customer?.billingInfo?.phoneNumber}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none "
                  />
                </div>
                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="billingEmail"
                    className="text-sm font-semibold text-gray-600"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="billingEmail"
                    name="billingEmail"
                    defaultValue={customer?.billingInfo?.email}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none "
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <div className="flex justify-between items-center mb-5">
                <h5 className="text-md font-bold ">Shipping Info</h5>
                <button
                  type="button"
                  onClick={copyBillingInfo}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 15C9 12.1716 9 10.7574 9.87868 9.87868C10.7574 9 12.1716 9 15 9H16C18.8284 9 20.2426 9 21.1213 9.87868C22 10.7574 22 12.1716 22 15V16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15C12.1716 22 10.7574 22 9.87868 21.1213C9 20.2426 9 18.8284 9 16V15Z"
                      stroke="black"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16.9999 9C16.9975 6.04291 16.9528 4.51121 16.092 3.46243C15.9258 3.25989 15.7401 3.07418 15.5376 2.90796C14.4312 2 12.7875 2 9.5 2C6.21252 2 4.56878 2 3.46243 2.90796C3.25989 3.07417 3.07418 3.25989 2.90796 3.46243C2 4.56878 2 6.21252 2 9.5C2 12.7875 2 14.4312 2.90796 15.5376C3.07417 15.7401 3.25989 15.9258 3.46243 16.092C4.51121 16.9528 6.04291 16.9975 9 16.9999"
                      stroke="black"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-md font-bold">
                    Copy from Billing Info
                  </span>
                </button>
              </div>
              <div className="grid grid-cols-2 justify-between items-center gap-5 pb-5">
                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="shippingFirstName"
                    className="text-sm font-semibold text-gray-600"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="shippingFirstName"
                    name="shippingFirstName"
                    defaultValue={customer?.shippingInfo?.firstName}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none "
                  />
                </div>
                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="shippingLastName"
                    className="text-sm font-semibold text-gray-600"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="shippingLastName"
                    name="shippingLastName"
                    defaultValue={customer?.shippingInfo?.lastName}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none "
                  />
                </div>
                <div className="space-y-1 w-full">
                  <label
                    className="text-sm font-semibold text-gray-600"
                    htmlFor="shippingDistrict"
                  >
                    District
                  </label>
                  <select
                    className="border border-gray-300 bg-transparent rounded-md w-full py-2 px-3 focus:outline-0"
                    name="shippingDistrict"
                    id="shippingDistrict"
                    defaultValue={customer?.shippingInfo?.district}
                  >
                    {customer?.shippingInfo?.district ? (
                      <option value={customer?.shippingInfo?.district}>
                        {customer?.shippingInfo?.district}
                      </option>
                    ) : (
                      <option value="">Select District</option>
                    )}
                    {districts?.map((district, index) => (
                      <option key={index} value={district.district}>
                        {district.district}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="shippingZipCode"
                    className="text-sm font-semibold text-gray-600"
                  >
                    PostalCode / Zip
                  </label>
                  <input
                    type="text"
                    id="shippingZipCode"
                    name="shippingZipCode"
                    defaultValue={customer?.shippingInfo?.zipCode}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none "
                  />
                </div>
                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="shippingFullAddress"
                    className="text-sm font-semibold text-gray-600"
                  >
                    full Address
                  </label>
                  <input
                    type="text"
                    id="shippingFullAddress"
                    name="shippingFullAddress"
                    defaultValue={customer?.shippingInfo?.fullAddress}
                    placeholder="House No, Road No, Area"
                    className="border border-gray-300 rounded-md p-2 focus:outline-none "
                  />
                </div>
                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="shippingPhoneNumber"
                    className="text-sm font-semibold text-gray-600"
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="shippingPhoneNumber"
                    name="shippingPhoneNumber"
                    defaultValue={customer?.shippingInfo?.phoneNumber}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none "
                  />
                </div>
                <div className="flex flex-col space-y-1 w-full">
                  <label
                    htmlFor="shippingEmail"
                    className="text-sm font-semibold text-gray-600"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="shippingEmail"
                    name="shippingEmail"
                    defaultValue={customer?.shippingInfo?.email}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none "
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
      <div className="container mx-auto">
        <ImageUploadModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </main>
  );
}
