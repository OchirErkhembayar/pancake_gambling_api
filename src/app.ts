import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";

import authRoutes from "./routes/auth";

const app = express();

app.use('/auth/', authRoutes);

app.use(cors());
app.use(bodyParser.json());

app.use(bodyParser);

app.listen(8000);
