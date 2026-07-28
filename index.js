import { spawn } from "child_process";

function startProject() {
	const child = spawn("node", ["Hinata.js"], {
		cwd: process.cwd(),
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code === 2) {
			console.log("Restarting Project...");
			startProject();
		}
	});
}

startProject();
