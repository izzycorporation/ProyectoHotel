import axiosInstance from "../api/axios";

export const getDirtyRooms = async () => {
    const response = await axiosInstance.get("/limpieza/dirty");
    return response.data;
};

export const registerCleaning = async (cleaningData: {
    usuario_id: number;
    habitacion_id: number;
    observacion: string;
}) => {
    const response = await axiosInstance.post("/limpieza/register", cleaningData);
    return response.data;
};

export const getCleaningRecords = async () => {
    const response = await axiosInstance.get("/limpieza/records");
    return response.data;
};
