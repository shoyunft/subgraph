import { hashOrder } from "./helpers";
import { Order } from "../../../generated/schema";
import { log } from "@graphprotocol/graph-ts/index";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

export class AskOrderParams {
    signer!: Address;
    token!: Address;
    tokenId!: BigInt;
    amount!: BigInt;
    strategy!: Address;
    currency!: Address;
    recipient!: Address;
    deadline!: BigInt;
    params!: Bytes;
}

export class CancelParams {
    hash!: Bytes;
}

export class BidParams {
    hash!: Bytes;
    bidder!: Address;
    amount!: BigInt;
    price!: BigInt;
    recipient!: Address;
    referrer!: Address;
}
export type ExecuteParams = BidParams;

export function createOrder(address: Bytes, params: AskOrderParams): void {
    let hash = hashOrder(
        params.signer,
        params.token,
        params.tokenId,
        params.amount,
        params.strategy,
        params.currency,
        params.recipient,
        params.deadline,
        params.params
    );
    let order = new Order(hash.toHex());
    order.exchange = address;
    order.status = "INVALID";
    order.maker = params.signer;
    order.token = params.token;
    order.tokenId = params.tokenId;
    order.amount = params.amount;
    order.strategy = params.strategy;
    order.currency = params.currency;
    order.recipient = params.recipient;
    order.deadline = params.deadline;
    order.params = params.params;
    order.save();
}

export function updateOrderOnCancel(params: CancelParams): void {
    let hash = params.hash.toHex();
    let order = Order.load(hash);
    if (!order) {
        log.warning("Cannot find a bid with hash: {}", [hash]);
        return;
    }
    order.status = "CANCELLED";
    order.save();
}

export function updateOrderOnBid(params: BidParams): void {
    let hash = params.hash.toHex();
    let order = Order.load(hash);
    if (!order) {
        log.warning("Cannot find a bid with hash: {}", [hash]);
        return;
    }
    order.status = "PENDING";
    order.bidder = params.bidder;
    order.bidAmount = params.amount;
    order.bidPrice = params.price;
    order.bidRecipient = params.recipient;
    order.bidReferrer = params.referrer;
    order.save();
}

export function updateOrderOnExecute(params: ExecuteParams): void {
    let hash = params.hash.toHex();
    let order = Order.load(hash);
    if (!order) {
        log.warning("Cannot find a bid with hash: {}", [hash]);
        return;
    }
    order.status = "EXECUTED";
    order.bidder = params.bidder;
    order.bidAmount = params.amount;
    order.bidPrice = params.price;
    order.bidRecipient = params.recipient;
    order.bidReferrer = params.referrer;
    order.save();
}
