import mongoose from "mongoose";

const connectToDatabse = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI!;
    await mongoose.connect(mongoURI);
    console.log("JWT App is connected to its Database 🎉");
  } catch (error) {
    console.error("Unable to connect JWT's Database 😞", error);
    process.exit(1);
  }
};

export default connectToDatabse;