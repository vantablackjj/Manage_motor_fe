import axiosInstance from "./axios.config";

export const importApi = {
  importData: (module, file, mode = "SAFE") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    return axiosInstance.post(`/import/${module}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
