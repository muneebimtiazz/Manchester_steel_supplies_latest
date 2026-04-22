import app from "./app";
import connectDb from "./config/db_config";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("Trying to connect DB...");
    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start", error);
  }
};

startServer();