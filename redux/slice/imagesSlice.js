import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedImages: null,
};

const imageSlice = createSlice({
  name: "images",
  initialState,
  reducers: {
    setSelectedImages: (state, action) => {
      state.selectedImages = action.payload;
    },
    addImage: (state, action) => {
      state.selectedImages = action.payload;
    },
    removeImage: (state, action) => {
      state.selectedImages = null;
    },
  },
});

export const { setSelectedImages, addImage, removeImage } = imageSlice.actions;

export default imageSlice.reducer;
