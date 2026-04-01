import { Router, type IRouter } from "express";
import healthRouter from "./health";
import petsRouter from "./pets";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/pets", petsRouter);

export default router;
