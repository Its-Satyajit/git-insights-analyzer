import "dotenv/config";
import { startAnalysisWorker } from "~/server/queue/worker";
import "~/env";

console.log("Starting analysis worker...");

startAnalysisWorker();

console.log("Worker is running. Press Ctrl+C to stop.");
