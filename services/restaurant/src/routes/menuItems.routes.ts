import epxress from "express";
import isAuth, { isSeller } from "../middlewares/isAuth.middleware.js";
import {
  addMenuItem,
  deleteMenuItem,
  getMenuItems,
  toggleMenuItemAvailability,
} from "../controllers/menuItems.controller.js";

const router = epxress.Router();

router.post("/new", isAuth, isSeller, addMenuItem);
router.get("/all/:id", isAuth, getMenuItems);
router.delete("/delete/:id", isAuth, isSeller, deleteMenuItem);
router.delete("/status/:id", isAuth, isSeller, toggleMenuItemAvailability);

export default router;
