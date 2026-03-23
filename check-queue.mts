import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = fs.readFileSync(path.join(__dirname, ".env"), "utf-8");
envFile.split("\n").forEach((line) => {
	const match = line.match(/^([^=]+)=(.*)$/);
	if (match) {
		const key = match[1].trim();
		let value = match[2].trim();
		if (value.startsWith('"') && value.endsWith('"')) {
			value = value.slice(1, -1);
		}
		process.env[key] = value;
	}
});

const { analysisQueue } = await import("./src/server/queue/index");

async function check() {
	const counts = await analysisQueue.getJobCounts();
	console.log("Queue counts:", counts);
	const jobs = await analysisQueue.getJobs([
		"waiting",
		"active",
		"completed",
		"failed",
		"delayed",
	]);
	console.log(
		"Jobs:",
		jobs.map((j) => ({
			id: j.id,
			name: j.name,
			processedOn: j.processedOn,
			finishedOn: j.finishedOn,
		})),
	);
	await analysisQueue.close();
}

check();
