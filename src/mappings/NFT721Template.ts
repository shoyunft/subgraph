import { Address, BigInt, store } from "@graphprotocol/graph-ts";
import {
    Bid,
    Bid1Call,
    BidCall,
    Burn,
    OwnershipTransferred,
    ParkTokenIds,
    Transfer,
} from "../../generated/templates/NFT721Template/INFT721";
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
        BigInt.fromI32(1),
        event.params.label,
        event.params.data
    );
}

export function handleParkTokenIds(event: ParkTokenIds): void {
    let to = event.params.toTokenId;
    for (let id = BigInt.fromI32(0); id.lt(to); id = id.plus(BigInt.fromI32(1))) {
        createNFT(event.address, id, true);
    }
}

export function handleTransfer(event: Transfer): void {
    let tokenId = event.params.tokenId;
    let id = event.address.toHex() + ":" + tokenId.toString();
    let nft = NFT.load(id);
    if (!nft) {
        nft = createNFT(event.address, tokenId, false);
    } else if (nft.parked) {
        nft.parked = false;
        nft.save();
    }

    let from = event.params.from;
    let to = event.params.to;
    let burn = (id: string, from: Address): void => {
        store.remove("NFTOwner", id + ":" + from.toHex());
    };
    let mint = (id: string, to: Address, nft: NFT): void => {
        let owner = new NFTOwner(id + ":" + to.toHex());
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
