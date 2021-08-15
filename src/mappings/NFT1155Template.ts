import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
import {
    Bid,
    Burn,
    OwnershipTransferred,
    TransferBatch,
    TransferSingle,
} from "../../generated/templates/NFT1155Template/INFT1155";
import { Bid as BidType, BurnRecord, NFT, NFTContract, NFTOwner } from "../../generated/schema";
import { createNFT } from "./helpers";
import { ADDRESS_ZERO } from "./constants";

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    const address = event.address.toHex();
    const token = NFTContract.load(address);
    if (token) {
        token.owner = event.params.newOwner;
        token.save();
    } else {
        log.warning("No matching NFT1155 with address: {}", [address]);
    }
}

export function handleTransferSingle(event: TransferSingle): void {
    const tokenId = event.params.id;
    const id = event.address.toHex() + ":" + tokenId.toString();
    let nft = NFT.load(id);
    if (!nft) {
        nft = createNFT(event.address, tokenId);
    }
    transfer(event.params.from, event.params.to, id, event.params.value, nft!);
}

export function handleTransferBatch(event: TransferBatch): void {
    const ids = event.params.ids;
    const values = event.params.values;
    for (let i = 0; i < ids.length; i++) {
        const tokenId = ids[i];
        const id = event.address.toHex() + ":" + tokenId.toString();
        let nft = NFT.load(id);
        if (!nft) {
            nft = createNFT(event.address, tokenId);
        }
        transfer(event.params.from, event.params.to, id, values[i], nft!);
    }
}

function transfer(from: Address, to: Address, id: string, amount: BigInt, nft: NFT): void {
    if (from.equals(ADDRESS_ZERO)) {
        mint(id, to, amount, nft);
    } else if (to.equals(ADDRESS_ZERO)) {
        burn(id, from, amount);
    } else {
        burn(id, from, amount);
        mint(id, to, amount, nft);
    }
}

function burn(id: string, from: Address, amount: BigInt): void {
    const ownerId = id + ":" + from.toHex();
    const owner = NFTOwner.load(ownerId);
    if (!owner) {
        return;
    }
    owner.amount = owner.amount.minus(amount);
    if (owner.amount.isZero()) {
        store.remove("NFTOwner", ownerId);
    } else {
        owner.save();
    }
}

function mint(id: string, to: Address, amount: BigInt, nft: NFT): void {
    const ownerId = id + ":" + to.toHex();
    let owner = NFTOwner.load(ownerId);
    if (!owner) {
        owner = new NFTOwner(ownerId);
        owner.nft = nft.id;
        owner.owner = to;
        owner.amount = amount;
    } else {
        owner.amount = owner.amount.plus(amount);
    }
    owner.save();
}

export function handleBid(event: Bid): void {
    const bid = new BidType(event.params.hash.toHex());
    bid.exchange = event.address;
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

export function handleBurn(event: Burn): void {
    const record = new BurnRecord(event.transaction.hash.toHex() + ":" + event.logIndex.toString());
    record.contract = event.address;
    record.tokenId = event.params.tokenId;
    record.amount = event.params.amount;
    record.label = event.params.label;
    record.data = event.params.data;
    record.save();
}
