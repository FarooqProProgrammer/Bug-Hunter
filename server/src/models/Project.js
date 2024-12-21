import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
   
    liveLink: {
        type: String,
    },
    githubLink: {
        type: String,
    },
    tags: {
        type: [String],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to the 'User' model
        required: true,  // You can set this as required based on your use case
    }
});

const ProjectModel = mongoose.model("Project", projectSchema);

export default ProjectModel
