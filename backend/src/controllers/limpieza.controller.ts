import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getDirtyRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await prisma.habitacion.findMany({
            where: {
                OR: [
                    { estado: "Sucia" },
                    { estado: "Sucio" }
                ]
            },
            orderBy: { numero: "asc" },
        });

        return res.status(200).json(rooms);
    } catch (error) {
        console.error("Error al obtener habitaciones sucias:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const registerCleaning = async (req: Request, res: Response) => {
    try {
        const { usuario_id, habitacion_id, observacion } = req.body;

        if (!usuario_id || !habitacion_id) {
            return res.status(400).json({
                error: "Campos obligatorios faltantes",
                detalles: "El ID de usuario y el ID de habitación son requeridos.",
            });
        }

        // 1. Crear el registro de limpieza
        const cleaningRecord = await prisma.limpieza.create({
            data: {
                usuario_id: parseInt(usuario_id),
                habitacion_id: parseInt(habitacion_id),
                fecha_hora: new Date(),
                observacion: observacion || "",
            },
        });

        // 2. Actualizar el estado de la habitación
        await prisma.habitacion.update({
            where: { id: parseInt(habitacion_id) },
            data: {
                estado: "Disponible",
                ocupado: false,
            },
        });

        return res.status(201).json({
            mensaje: "Actividad de limpieza registrada y habitación actualizada",
            limpieza: cleaningRecord,
        });
    } catch (error) {
        console.error("Error al registrar limpieza:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const getCleaningRecords = async (req: Request, res: Response) => {
    try {
        const records = await prisma.limpieza.findMany({
            include: {
                habitacion: true,
                usuario: true,
            },
            orderBy: { fecha_hora: "desc" },
        });

        return res.status(200).json(records);
    } catch (error) {
        console.error("Error al obtener registros de limpieza:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};
