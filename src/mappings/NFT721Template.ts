import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
import { Bid, Burn, OwnershipTransferred, Transfer } from "../../generated/templates/NFT721Template/INFT721";
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
        log.warning("No matching NFT721 with address: {}", [address]);
    }
}

export function handleTransfer(event: Transfer): void {
    const tokenId = event.params.tokenId;
    const id = event.address.toHex() + ":" + tokenId.toString();
    let nft = NFT.load(id);
    if (!nft) {
        nft = createNFT(event.address, tokenId);
    }

    const from = event.params.from;
    const to = event.params.to;
    const burn = (id: string, from: Address): void => {
        store.remove("NFTOwner", id + ":" + from.toHex());
    };
    const mint = (id: string, to: Address, nft: NFT): void => {
        const owner = new NFTOwner(id + ":" + to.toHex());
        owner.nft = nft.id;
        owner.owner = to;
        owner.amount = BigInt.fromI32(1);
        owner.save();
    };
    if (from.equals(ADDRESS_ZERO)) {
        mint(id, to, nft!);
    } else if (to.equals(ADDRESS_ZERO)) {
        burn(id, from);
    } else {
        burn(id, from);
        mint(id, to, nft!);
    }
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
    record.amount = BigInt.fromI32(1);
    record.label = event.params.label;
    record.data = event.params.data;
    record.save();
}
