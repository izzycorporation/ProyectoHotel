import { Router } from "express";
import {
    getDirtyRooms,
    registerCleaning,
    getCleaningRecords,
} from "../controllers/limpieza.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

// Todas las rutas de limpieza requieren token
router.use(verifyToken);

router.get("/dirty", getDirtyRooms);
router.post("/register", registerCleaning);
router.get("/records", getCleaningRecords);

export default router;
