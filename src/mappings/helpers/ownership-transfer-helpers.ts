import { log } from "@graphprotocol/graph-ts/index";
import { Address } from "@graphprotocol/graph-ts";
import { NFTContract } from "../../../generated/schema";

export class OwnershipTransferredParams {
    newOwner!: Address;
}

export function transferOwnership(address: Address, params: OwnershipTransferredParams): void {
    let token = NFTContract.load(address.toHex());
    if (token) {
        token.owner = params.newOwner;
        token.save();
    } else {
        log.warning("No matching NFTContract with address: {}", [address.toHex()]);
    }
}
