import { app } from "./app";
import connectDB from "./src/utils/db";
require("dotenv").config();

app.listen(process.env.PORT, () => {
    console.log(`server is listening on ${process.env.PORT}`);
    connectDB();
})