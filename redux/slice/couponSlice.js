import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  coupons: [],
  status: "idle",
  error: null,
};

export const fetchCoupons = createAsyncThunk(
  "coupons/fetchCoupons",
  async () => {
    const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
    const path = "/discount/getAllCoupon";
    const url = `${API_ENDPOINT}${path}`;

    const user = localStorage.getItem("user");
    const token = user ? JSON.parse(user).accessToken : "";

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    try {
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching coupons:", error);
      throw error;
    }
  }
);

const couponSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { getAllCoupons } = couponSlice.actions;
export default couponSlice.reducer;
