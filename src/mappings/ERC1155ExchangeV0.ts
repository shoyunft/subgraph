import { dataSource, log } from "@graphprotocol/graph-ts";
import { Bid } from "../../generated/ERC1155ExchangeV0/IBaseExchange";
import { Bid as BidType } from "../../generated/schema";

export function handleBid(event: Bid): void {
    const bid = new BidType(event.params.hash.toHex());
    bid.exchange = dataSource.address();
    bid.status = "PENDING";
    bid.bidder = event.params.bidder;
    bid.amount = event.params.amount;
    bid.price = event.params.price;
    bid.recipient = event.params.recipient;
    bid.referrer = event.params.referrer;
    bid.save();
}

export function handleCancel(event: Bid): void {
    const hash = event.params.hash.toHex();
    const bid = BidType.load(hash);
    if (!bid) {
        log.warning("Cannot find a bid with hash: {}", [hash]);
        return;
    }
    bid.status = "CANCELLED";
    bid.save();
}

export function handleExecute(event: Bid): void {
    const hash = event.params.hash.toHex();
    let bid = BidType.load(hash);
    if (!bid) {
        bid = new BidType(hash);
        bid.bidder = event.params.bidder;
        bid.amount = event.params.amount;
        bid.price = event.params.price;
        bid.recipient = event.params.recipient;
        bid.referrer = event.params.referrer;
    }
    bid.status = "EXECUTED";
    bid.save();
}
