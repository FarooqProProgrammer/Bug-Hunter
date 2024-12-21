import mongoose from 'mongoose';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

export const connectDb = async () => {
  try {
    await mongoose.connect('mongodb+srv://farooq123:farooq123@cluster0.ijdh8yd.mongodb.net/bughunter?retryWrites=true&w=majority&appName=Cluster0');
    console.log(chalk.green.bold('Database connected successfully!'));
  } catch (error) {
    console.log(chalk.red.bold('Database connection failed!'));
    console.error(chalk.red(error.message));
    process.exit(1); 
  }
};
