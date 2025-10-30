import { Router } from "express";
import { authGuard, requireRole } from "../middleware/auth.js";
import { listMovies, getMovie, createMovie, updateMovie, deleteMovie, searchMovies } from "../controllers/movie.controller.js";
const router = Router();
router.get("/", listMovies);
router.get("/search", searchMovies);
router.get("/:id", getMovie);
// ADMIN-only writes
router.post("/", authGuard, requireRole("ADMIN"), createMovie);
router.put("/:id", authGuard, requireRole("ADMIN"), updateMovie);
router.delete("/:id", authGuard, requireRole("ADMIN"), deleteMovie);
export default router;
