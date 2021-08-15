import { log } from "@graphprotocol/graph-ts";
import {
    Sync,
    DividendWithdrawn,
    Burn,
    OwnershipTransferred,
} from "../../generated/templates/SocialTokenTemplate/ISocialToken";
import { BurnRecord, SocialToken, SocialTokenSyncRecord, SocialTokenWithdrawal } from "../../generated/schema";

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    const address = event.address.toHex();
    const token = SocialToken.load(address);
    if (token) {
        token.owner = event.params.newOwner;
        token.save();
    } else {
        log.warning("No matching SocialToken with address: {}", [address]);
    }
}

export function handleSync(event: Sync): void {
    const address = event.address.toHex();
    const token = SocialToken.load(address);
    if (token) {
        const record = new SocialTokenSyncRecord(event.transaction.hash.toHex() + ":" + event.logIndex.toString());
        record.token = token.id;
        record.increased = event.params.increased;
        record.save();
    } else {
        log.warning("No matching SocialToken with address: {}", [address]);
    }
}

export function handleDividendWithdrawn(event: DividendWithdrawn): void {
    const address = event.address.toHex();
    const token = SocialToken.load(address);
    if (token) {
        const record = new SocialTokenWithdrawal(event.transaction.hash.toHex() + ":" + event.logIndex.toString());
        record.token = token.id;
        record.to = event.params.to;
        record.amount = event.params.amount;
        record.save();
    } else {
        log.warning("No matching SocialToken with address: {}", [address]);
    }
}

export function handleBurn(event: Burn): void {
    const record = new BurnRecord(event.transaction.hash.toHex() + ":" + event.logIndex.toString());
    record.contract = event.address;
    record.amount = event.params.amount;
    record.label = event.params.label;
    record.data = event.params.data;
    record.save();
}
