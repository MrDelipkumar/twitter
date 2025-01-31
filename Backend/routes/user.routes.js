import express from "express"
import protectRoute from "../middleware/proctectRoute.js";
import { getProfile , followUnFollowuser , getSuggestedUsers , updateUser} from "../controllers/user.contollers.js";

const router = express.Router();

router.get("/profile/:userName" , protectRoute , getProfile)
router.post("/follow/:id" , protectRoute , followUnFollowuser )
router.get("/suggested" ,protectRoute,getSuggestedUsers)
router.post("/update", protectRoute , updateUser)

export default router;