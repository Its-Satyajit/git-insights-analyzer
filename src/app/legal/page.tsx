"use client";

import { ArrowLeft, Database, FileCode, Scale, Shield } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.06 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 16 },
	visible: { opacity: 1, y: 0 },
};

export default function LegalPage() {
	return (
		<main className="blueprint-grid min-h-screen bg-background pt-14">
			<motion.div
				animate="visible"
				className="mx-auto max-w-3xl px-6 py-16"
				initial="hidden"
				variants={containerVariants}
			>
				{/* Back link */}
				<motion.div variants={itemVariants}>
					<Link
						className="group mb-8 inline-flex items-center gap-2 font-mono text-muted-foreground text-xs uppercase tracking-widest transition-colors hover:text-foreground"
						href="/"
					>
						<ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
						Back
					</Link>
				</motion.div>

				{/* Title */}
				<motion.div className="mb-16" variants={itemVariants}>
					<h1 className="font-(family-name:--font-display) text-5xl text-foreground tracking-tight">
						Legal
					</h1>
					<p className="mt-3 font-mono text-muted-foreground text-xs uppercase tracking-widest">
						Privacy, data handling, and licensing
					</p>
				</motion.div>

				{/* Content sections */}
				<div className="space-y-16">
					{/* Data Storage */}
					<motion.section variants={itemVariants}>
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center bg-secondary">
								<Database className="h-4 w-4 text-muted-foreground" />
							</div>
							<h2 className="font-(family-name:--font-display) text-2xl text-foreground">
								Data Storage
							</h2>
						</div>
						<div className="border-border border-l pl-11">
							<p className="mb-4 font-sans text-muted-foreground text-sm leading-relaxed">
								We do not store any repository source code or file contents on
								our servers. All file content is fetched directly from GitHub
								on-demand and displayed temporarily in your browser session
								only.
							</p>
							<p className="font-sans text-muted-foreground text-sm leading-relaxed">
								The following public metadata is cached in our database for
								performance and display purposes:
							</p>
							<ul className="mt-4 space-y-2">
								{[
									"Repository name and description",
									"Star and fork counts",
									"Primary programming language",
									"Contributor count",
								].map((item) => (
									<li
										className="flex items-center gap-2 font-mono text-muted-foreground text-xs"
										key={item}
									>
										<span className="h-1 w-1 bg-accent" />
										{item}
									</li>
								))}
							</ul>
						</div>
					</motion.section>

					{/* Licensing */}
					<motion.section variants={itemVariants}>
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center bg-secondary">
								<Scale className="h-4 w-4 text-muted-foreground" />
							</div>
							<h2 className="font-(family-name:--font-display) text-2xl text-foreground">
								Licensing
							</h2>
						</div>
						<div className="border-border border-l pl-11">
							<p className="mb-4 font-sans text-muted-foreground text-sm leading-relaxed">
								This tool does not relicense, redistribute, or modify any source
								code. All copyrights and license terms remain with their
								respective owners and original authors.
							</p>
							<p className="font-sans text-muted-foreground text-sm leading-relaxed">
								When viewing repository contents, you are subject to the
								original repository's license terms. We display license
								information when available from the GitHub API.
							</p>
						</div>
					</motion.section>

					{/* How It Works */}
					<motion.section variants={itemVariants}>
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center bg-secondary">
								<FileCode className="h-4 w-4 text-muted-foreground" />
							</div>
							<h2 className="font-(family-name:--font-display) text-2xl text-foreground">
								How It Works
							</h2>
						</div>
						<div className="border-border border-l pl-11">
							<p className="mb-4 font-sans text-muted-foreground text-sm leading-relaxed">
								When you analyze a repository, we:
							</p>
							<ol className="space-y-3">
								{[
									"Fetch the repository structure via the GitHub API",
									"Clone a shallow copy (depth=1) temporarily for dependency analysis",
									"Store only the analysis results and metadata",
									"Delete the temporary clone after analysis completes",
								].map((step, i) => (
									<li
										className="flex items-start gap-3 font-mono text-muted-foreground text-xs"
										key={step}
									>
										<span className="flex h-5 w-5 shrink-0 items-center justify-center border border-border text-[10px] text-muted-foreground">
											{i + 1}
										</span>
										<span className="pt-0.5">{step}</span>
									</li>
								))}
							</ol>
							<p className="mt-4 font-sans text-muted-foreground text-sm leading-relaxed">
								File contents are never stored — they are fetched live from
								GitHub when you click on a file in the viewer.
							</p>
						</div>
					</motion.section>

					{/* Privacy */}
					<motion.section variants={itemVariants}>
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center bg-secondary">
								<Shield className="h-4 w-4 text-muted-foreground" />
							</div>
							<h2 className="font-(family-name:--font-display) text-2xl text-foreground">
								Privacy
							</h2>
						</div>
						<div className="border-border border-l pl-11">
							<p className="mb-4 font-sans text-muted-foreground text-sm leading-relaxed">
								We do not collect personal information beyond what is required
								for authentication via GitHub OAuth. We do not track your
								browsing activity or sell data to third parties.
							</p>
							<div className="mt-6 border border-border bg-card p-4">
								<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
									Contact
								</p>
								<p className="mt-2 font-sans text-muted-foreground text-sm">
									For questions about data handling or to request deletion of
									cached data, open an issue on{" "}
									<a
										className="text-foreground underline underline-offset-2 hover:text-accent"
										href="https://github.com/Its-Satyajit/git-insights-analyzer/issues"
										rel="noopener noreferrer"
										target="_blank"
									>
										GitHub
									</a>
									.
								</p>
							</div>
						</div>
					</motion.section>
				</div>

				{/* Footer */}
				<div className="mt-20 border-border border-t pt-8">
					<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
						Last updated March 2026
					</p>
				</div>
			</motion.div>
		</main>
	);
}
