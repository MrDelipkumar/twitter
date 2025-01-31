import express from "express"
import protectRoute from "../middleware/proctectRoute.js";
import { createPost , deletePost ,createComment ,linkUnlikePost , getAllPosts , getLikedPosts,getFollowingPosts,getUserPosts } from "../controllers/post.controller.js";
const router = express.Router();
router.get("/all",protectRoute,getAllPosts)
router.get("/following", protectRoute, getFollowingPosts);
router.get("/user/:userName",protectRoute,getUserPosts)
router.get("/likes/:id",protectRoute,getLikedPosts)
router.post("/create" , protectRoute , createPost)
router.post("/like/:id" , protectRoute , linkUnlikePost)
router.post("/comment/:id" , protectRoute , createComment)
router.delete("/:id" , protectRoute , deletePost)

export default router;