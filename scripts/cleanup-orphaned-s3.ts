import {
	DeleteObjectsCommand,
	ListObjectsV2Command,
	S3Client,
} from "@aws-sdk/client-s3";
import "dotenv/config";

async function cleanupOrphanedS3() {
	const accessKeyId = process.env.IDRIVE_E2_ACCESS_KEY;
	const secretAccessKey = process.env.IDRIVE_E2_SECRET_KEY;
	const bucketName = process.env.IDRIVE_E2_BUCKET_NAME;
	const region = process.env.IDRIVE_E2_REGION || "eu-central-2";
	const endpoint =
		process.env.IDRIVE_E2_ENDPOINT || `https://s3.${region}.idrivee2.com`;

	if (!accessKeyId || !secretAccessKey || !bucketName) {
		console.error("Error: Missing required environment variables.");
		process.exit(1);
	}

	const client = new S3Client({
		region,
		endpoint,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
		forcePathStyle: true,
	});

	const isDev = process.env.NODE_ENV === "development";
	const prefix = isDev ? "dev/analysis" : "analysis";

	console.log(`Scanning S3 bucket: ${bucketName}`);
	console.log(`Prefix: ${prefix}`);
	console.log("");

	const listResponse = await client.send(
		new ListObjectsV2Command({
			Bucket: bucketName,
			Prefix: prefix,
			MaxKeys: 1000,
		}),
	);

	if (!listResponse.Contents || listResponse.Contents.length === 0) {
		console.log("No objects found.");
		return;
	}

	const folders = new Set<string>();
	for (const obj of listResponse.Contents) {
		const key = obj.Key;
		if (!key) continue;
		const parts = key.split("/");
		if (parts.length >= 2) {
			folders.add(parts[1]);
		}
	}

	const testRepos = [...folders].filter((f) => f.startsWith("test-repo-"));

	console.log(`Found ${folders.size} unique repo folders`);
	console.log(`Found ${testRepos.length} test-repo-* folders to delete:`);
	for (const r of testRepos) {
		console.log(`  - ${r}`);
	}
	console.log("");

	if (testRepos.length === 0) {
		console.log("No test repos to clean up.");
		return;
	}

	let totalDeleted = 0;
	for (const repoId of testRepos) {
		const folderPrefix = `${prefix}/${repoId}/`;
		console.log(`Deleting: ${folderPrefix}...`);

		const objectsResponse = await client.send(
			new ListObjectsV2Command({
				Bucket: bucketName,
				Prefix: folderPrefix,
				MaxKeys: 1000,
			}),
		);

		if (!objectsResponse.Contents || objectsResponse.Contents.length === 0) {
			console.log("  (empty, skipping)");
			continue;
		}

		await client.send(
			new DeleteObjectsCommand({
				Bucket: bucketName,
				Delete: {
					Objects: objectsResponse.Contents.map((obj) => ({
						Key: obj.Key,
					})),
					Quiet: true,
				},
			}),
		);

		console.log(`  Deleted ${objectsResponse.Contents.length} objects`);
		totalDeleted++;
	}

	console.log(`\n✅ Cleaned up ${totalDeleted} orphaned test-repo folders`);
}

cleanupOrphanedS3().catch(console.error);
