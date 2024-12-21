import express from "express"
import ProjectController from "../controller/project-controller.js";
const projectRouter = express.Router();


projectRouter.post("/create-project",ProjectController.createProject)
projectRouter.get("/projects",ProjectController.getAllProject)




export default projectRouter