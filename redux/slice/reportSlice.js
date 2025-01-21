import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  report: null,
  status: "idle",
  error: null,
};

export const fetchReport = createAsyncThunk(
  "reports/fetchReport",
  async ({ startDate, endDate }) => {
    const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
    const path = `/reports/totalSales?startDate=${startDate}&endDate=${endDate}`;
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
      console.error("Error fetching report:", error);
      throw error;
    }
  }
);

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReport.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.report = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default reportSlice.reducer;
