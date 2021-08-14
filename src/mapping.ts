import { BigInt, Bytes, store } from "@graphprotocol/graph-ts";
import { DeployNFT721, DeployNFT1155, DeploySocialToken, Tag } from "../generated/TokenFactory/ITokenFactory";
import { NFT, NFTContract, NFTTag, SocialToken } from "../generated/schema";

// eslint-disable-next-line
export function handleDeployNFT721(event: DeployNFT721) {
    const contract = new NFTContract(event.params.proxy.toHex());
    contract.owner = event.params.owner;
    contract.name = event.params.name;
    contract.symbol = event.params.symbol;
    contract.royaltyFeeRecipient = event.params.royaltyFeeRecipient;
    contract.royaltyFee = event.params.royaltyFee;
    contract.save();
}

export function handleDeployNFT1155(event: DeployNFT1155) {
    const contract = new NFTContract(event.params.proxy.toHex());
    contract.owner = event.params.owner;
    contract.royaltyFeeRecipient = event.params.royaltyFeeRecipient;
    contract.royaltyFee = event.params.royaltyFee;
    contract.save();
}

export function handleDeploySocialToken(event: DeploySocialToken) {
    const token = new SocialToken(event.params.proxy.toHex());
    token.owner = event.params.owner;
    token.name = event.params.name;
    token.symbol = event.params.symbol;
    token.dividendToken = event.params.dividendToken;
    token.save();
}

export function handleTag(event: Tag) {
    const tag = event.params.tag.toString().trim();
    if (tag.length > 0) {
        const nftId = event.params.nft.toHex() + ":" + event.params.tokenId.toString();
        let nft = NFT.load(nftId);
        if (nft) {
            // remove previous tags
            const nonce = event.params.tagNonce;
            if (nonce.gt(BigInt.fromI32(0))) {
                const prevNonce = nonce.minus(BigInt.fromI32(1));
                if (prevNonce.equals(nft.tagNonce)) {
                    for (let i = 0; i < nft.tagCount; i++) {
                        const tagId = nftId + ":" + prevNonce + ":" + i;
                        store.remove("NFTTag", tagId);
                    }
                }
            }
        } else {
            nft = initNFT(event.params.nft, event.params.tokenId);
        }

        // register new tag
        const tag = new NFTTag(nftId + ":" + event.params.tagNonce + ":" + nft.tagCount);
        tag.content = event.params.tag.toString();
        tag.save();

        nft.tagCount += 1;
        nft.tagNonce = event.params.tagNonce;
        nft.save();
    }
}

function initNFT(address: Bytes, tokenId: BigInt) {
    const contract = NFTContract.load(address.toHex());

    const nftId = address.toHex() + ":" + tokenId.toString();
    const nft = new NFT(nftId);
    nft.contract = contract?.id || null;
    nft.address = address;
    nft.tokenId = tokenId;
    nft.tagNonce = BigInt.fromI32(0);
    nft.tagCount = 0;
    nft.save();
    return nft;
}
