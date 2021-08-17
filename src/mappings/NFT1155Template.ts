import { Address, BigInt, store } from "@graphprotocol/graph-ts";
import {
    Bid,
    Bid1Call,
    BidCall,
    Burn,
    OwnershipTransferred,
    TransferBatch,
    TransferSingle,
} from "../../generated/templates/NFT1155Template/INFT1155";
import { NFT, NFTOwner } from "../../generated/schema";
import { createBurnRecord, createNFT } from "./helpers/helpers";
import { ADDRESS_ZERO } from "./constants";
import {
    AskOrderParams,
    BidParams,
    CancelParams,
    createOrder,
    ExecuteParams,
    updateOrderOnBid,
    updateOrderOnCancel,
    updateOrderOnExecute,
} from "./helpers/exchange-helpers";
import { OwnershipTransferredParams, transferOwnership } from "./helpers/ownership-transfer-helpers";

export function handleBid1Call(call: Bid1Call): void {
    createOrder(call.to, call.inputs.askOrder as AskOrderParams);
}

export function handleBidCall(call: BidCall): void {
    createOrder(call.to, call.inputs.askOrder as AskOrderParams);
}

export function handleBid(event: Bid): void {
    updateOrderOnBid(event.params as BidParams);
}

export function handleCancel(event: Bid): void {
    updateOrderOnCancel(event.params as CancelParams);
}

export function handleExecute(event: Bid): void {
    updateOrderOnExecute(event.params as ExecuteParams);
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    transferOwnership(event.address, event.params as OwnershipTransferredParams);
}

export function handleBurn(event: Burn): void {
    createBurnRecord(
        event.transaction.hash,
        event.logIndex,
        event.address,
        event.params.tokenId,
        event.params.amount,
        event.params.label,
        event.params.data
    );
}

export function handleTransferSingle(event: TransferSingle): void {
    let tokenId = event.params.id;
    let id = event.address.toHex() + ":" + tokenId.toString();
    let nft = NFT.load(id);
    if (!nft) {
        nft = createNFT(event.address, tokenId, false);
    }
    transfer(event.params.from, event.params.to, id, event.params.value, nft!);
}

export function handleTransferBatch(event: TransferBatch): void {
    let ids = event.params.ids;
    let values = event.params.values;
    for (let i = 0; i < ids.length; i++) {
        let tokenId = ids[i];
        let id = event.address.toHex() + ":" + tokenId.toString();
        let nft = NFT.load(id);
        if (!nft) {
            nft = createNFT(event.address, tokenId, false);
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

export function burn(nftId: string, from: Address, amount: BigInt): void {
    let ownerId = nftId + ":" + from.toHex();
    let owner = NFTOwner.load(ownerId);
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

export function mint(nftId: string, to: Address, amount: BigInt, nft: NFT): void {
    let ownerId = nftId + ":" + to.toHex();
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
