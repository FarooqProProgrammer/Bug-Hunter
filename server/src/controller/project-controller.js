import Joi from 'joi';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import ProjectModel from "../models/Project.js";


// Define Joi validation schema
const projectSchema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    liveLink: Joi.string().uri().optional(),
    githubLink: Joi.string().uri().optional(),
    tags: Joi.array().items(Joi.string()).min(1).required(),
    user: Joi.string().required(), // Assuming user is a string ID
});

class ProjectController {
    static async createProject(req, res) {
        try {
            // Validate request body with Joi
            const { error } = projectSchema.validate(req.body);
            if (error) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: error.details[0].message,
                });
            }

            const { title, description, liveLink, githubLink, tags, user } = req.body;

            // Create the project
            const newProject = new ProjectModel({
                title,
                description,
                liveLink,
                githubLink,
                tags,
                user,
            });

            await newProject.save();

            // Send a success response with the project data
            return res.status(StatusCodes.CREATED).json({
                message: getReasonPhrase(StatusCodes.CREATED),
                project: newProject,
            });
        } catch (error) {
            console.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: getReasonPhrase(StatusCodes.BAD_REQUEST),
                response: "Error creating project",
            });
        }
    }

    static async getAllProject(req, res) {
        try {
            // Use populate to fetch the user and exclude the password field
            const projects = await ProjectModel.find().populate('user', '-password');

            if (!projects) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: 'No projects found',
                });
            }

            return res.status(StatusCodes.OK).json({
                message: getReasonPhrase(StatusCodes.OK),
                projects: projects,
            });

        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: getReasonPhrase(StatusCodes.BAD_REQUEST),
                error: error.message,
            });
        }
    }


}

export default ProjectController;
