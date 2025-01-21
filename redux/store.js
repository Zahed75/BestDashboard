import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "@/redux/slice/categorySlice";
import productsReducer from "@/redux/slice/productsSlice";
import ordersReducer from "@/redux/slice/orderSlice";
import usersReducer from "@/redux/slice/usersSlice";
import authReducer from "@/redux/slice/authSlice";
import outletsReducer from "@/redux/slice/outletSlice";
import couponsReducer from "@/redux/slice/couponSlice";
import customersReducer from "@/redux/slice/customersSlice";
import reportReducer from "@/redux/slice/reportSlice";
import imagesReducer from "@/redux/slice/imagesSlice";
import galleryReducer from "@/redux/slice/gallerySlice";
import citiesReducer from "@/redux/slice/citiesSlice";

const store = configureStore({
  reducer: {
    categories: categoryReducer,
    products: productsReducer,
    outlets: outletsReducer,
    orders: ordersReducer,
    users: usersReducer,
    auth: authReducer,
    coupons: couponsReducer,
    report: reportReducer,
    customer: customersReducer,
    images: imagesReducer,
    gallery: galleryReducer,
    cities: citiesReducer,
  },
});

export default store;
