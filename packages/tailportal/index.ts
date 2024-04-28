import dotenv from "dotenv";
import { InstanceManager } from "./src/instance-manager";
import { regions } from "vultr-types";

dotenv.config();

const args = process.argv.slice(2);
const commands = [
  "destroy",
  "create",
  "list",
  "remove",
  "region",
  "help",
  "sync",
];

let command: null | string = null;

if (args.length > 0 && commands.includes(args[0])) {
  command = args[0];
}

async function main() {
  const config = {
    tsAuthKey: process.env.TS_AUTH_KEY!,
    vultrApiKey: process.env.VULTR_API_KEY!,
    pulumiPassphrase: process.env.PULUMI_CONFIG_PASSPHRASE!,
  };

  const stackName = "dev";
  const projectName = "tailportal";

  const instanceManager = new InstanceManager(config, stackName, projectName);
  await instanceManager.initializeStack();

  switch (command) {
    case "destroy": {
      await instanceManager.destroyStack();
      return process.exit(0);
    }
    case "create": {
      const provider = "vultr";
      const region = "sgp" || args[1];
      await instanceManager.createInstance(provider, region);
      return process.exit(0);
    }
    case "region": {
      const regionStrings = regions.map(
        (region) =>
          `${region.id} : ${region.city}, ${region.country} (${region.continent})`,
      );
      console.log(regionStrings.join("\n"));
      break;
    }
    case "list": {
      const instances = instanceManager.currentInstances;
      console.log(instances);
      return;
    }
    case "remove": {
      const name = args[1];
      await instanceManager.removeInstance(name);
      return;
    }
    case "help": {
      displayHelp();
      return;
    }
    case "sync": {
      await instanceManager.upStack();
      return;
    }
    default: {
      displayHelp();
      return;
    }
  }
}

function displayHelp() {
  console.log("Usage: npm start [command] [options]");
  console.log("");
  console.log("Commands:");
  console.log(
    "  create [region]   Create a new instance (default region: sgp)",
  );
  console.log("  destroy           Destroy the stack");
  console.log("  list              List current instances");
  console.log("  remove [name]     Remove an instance by name");
  console.log("  region            List available regions");
  console.log(
    "  sync              Synchronize the stack with the current state",
  );
  console.log("  help              Display this help message");
  console.log("");
  console.log(
    "Running the command without any arguments will display this help message.",
  );
}

main().catch((err) => console.error(err));
