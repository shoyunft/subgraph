import { BigInt, Bytes } from "@graphprotocol/graph-ts/index";
import { NFT, NFTContract } from "../../generated/schema";

export function createNFT(address: Bytes, tokenId: BigInt): NFT {
    const contract = NFTContract.load(address.toHex());

    const nftId = address.toHex() + ":" + tokenId.toString();
    const nft = new NFT(nftId);
    if (contract) nft.contract = contract.id;
    nft.address = address;
    nft.tokenId = tokenId;
    nft.tagNonce = BigInt.fromI32(0);
    nft.tagCount = 0;
    nft.save();

    return nft;
}
