import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  customers: [],
  status: "idle",
  error: null,
};

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async () => {
    const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
    const path = "/customer/getCustomer";
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
      console.error("Error fetching customers:", error);
      throw error;
    }
  }
);

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { getAllCustomers } = customersSlice.actions;
export default customersSlice.reducer;
