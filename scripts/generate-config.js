const OptionParser = require("option-parser");
const fs = require("fs");

const parser = new OptionParser();
parser.addOption("h", "help", "Display this help message").action(parser.helpAction());
parser.addOption("n", "network", "Specify network name", "network").argument("NETWORK");
parser.parse();

const network = parser.network.value();
if (network) {
    const TokenFactory = JSON.parse(
        fs
            .readFileSync("node_modules/@shoyunft/contracts/deployments/" + network + "/TokenFactory.json")
            .toString("utf8")
    );
    const config = {
        network,
        tokenFactory: TokenFactory.address,
        startBlock: TokenFactory.receipt.blockNumber,
    };
    fs.writeFileSync("config/" + network + ".json", JSON.stringify(config, null, 2), "utf8");
} else {
    console.log(parser.help());
}
