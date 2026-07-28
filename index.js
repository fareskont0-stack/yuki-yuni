import { spawn } from "child_process";
import log from "./logger/log.js";

function startProject() {
	const child = spawn("node", ["Hinata.js"], {
		cwd: process.cwd(),
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code == 2) {
			log.info("Restarting Project...");
			startProject();
		}
	});
}

startProject();
