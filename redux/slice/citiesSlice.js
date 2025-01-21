import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  cities: [],
  status: "idle",
  error: null,
};

export const fetchCities = createAsyncThunk(
  "cities/fetchCities",
  async () => {
    const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
    const path = "/city/getAllCities";
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
      console.error("Error fetching cities:", error);
      throw error;
    }
  }
);

const citiesSlice = createSlice({
  name: "cities",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { getAllCities } = citiesSlice.actions;
export default citiesSlice.reducer;
