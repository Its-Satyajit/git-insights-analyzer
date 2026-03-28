const { Queue } = require("bullmq");

const connection = {
	host: "localhost",
	port: 6379,
};

async function test() {
	const queue = new Queue("analysis", { connection });
	console.log("Queue created");
	const job = await queue.add("test", { foo: "bar" }, { jobId: "test123" });
	console.log("Job added", job.id);
	const counts = await queue.getJobCounts();
	console.log("Counts", counts);
	await queue.close();
}

test().catch(console.error);
