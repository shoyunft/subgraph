import { BigInt, log } from "@graphprotocol/graph-ts";
import { SocialToken, SocialTokenSyncRecord, SocialTokenWithdrawal } from "../../generated/schema";
import { OwnershipTransferredParams, transferOwnership } from "./helpers/ownership-transfer-helpers";
import {
    Burn,
    DividendWithdrawn,
    OwnershipTransferred,
    Sync,
} from "../../generated/templates/SocialTokenTemplate/ISocialToken";
import { createBurnRecord } from "./helpers/helpers";

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    transferOwnership(event.address, event.params as OwnershipTransferredParams);
}

export function handleBurn(event: Burn): void {
    createBurnRecord(
        event.transaction.hash,
        event.logIndex,
        event.address,
        BigInt.fromI32(0),
        event.params.amount,
        event.params.label,
        event.params.data
    );
}

export function handleSync(event: Sync): void {
    let address = event.address.toHex();
    let token = SocialToken.load(address);
    if (token) {
        let record = new SocialTokenSyncRecord(event.transaction.hash.toHex() + ":" + event.logIndex.toString());
        record.token = token.id;
        record.increased = event.params.increased;
        record.save();
    } else {
        log.warning("No matching SocialToken with address: {}", [address]);
    }
}

export function handleDividendWithdrawn(event: DividendWithdrawn): void {
    let address = event.address.toHex();
    let token = SocialToken.load(address);
    if (token) {
        let record = new SocialTokenWithdrawal(event.transaction.hash.toHex() + ":" + event.logIndex.toString());
        record.token = token.id;
        record.to = event.params.to;
        record.amount = event.params.amount;
        record.save();
    } else {
        log.warning("No matching SocialToken with address: {}", [address]);
    }
}
