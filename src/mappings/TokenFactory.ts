import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
import { DeployNFT721, DeployNFT1155, DeploySocialToken, Tag } from "../../generated/TokenFactory/ITokenFactory";
import { NFT721Template, NFT1155Template, SocialTokenTemplate } from "../../generated/templates";
import { NFT, NFTContract, NFTTag, SocialToken } from "../../generated/schema";

export function handleDeployNFT721(event: DeployNFT721): void {
    const address = event.params.proxy.toHex();
    const contract = new NFTContract(address);
    contract.standard = "ERC721";
    contract.owner = event.params.owner;
    contract.name = event.params.name;
    contract.symbol = event.params.symbol;
    contract.royaltyFeeRecipient = event.params.royaltyFeeRecipient;
    contract.royaltyFee = BigInt.fromI32(event.params.royaltyFee);
    contract.save();

    NFT721Template.create(Address.fromString(address));
}

export function handleDeployNFT1155(event: DeployNFT1155): void {
    const address = event.params.proxy.toHex();
    const contract = new NFTContract(address);
    contract.standard = "ERC1155";
    contract.owner = event.params.owner;
    contract.owner = event.params.owner;
    contract.royaltyFeeRecipient = event.params.royaltyFeeRecipient;
    contract.royaltyFee = BigInt.fromI32(event.params.royaltyFee);
    contract.save();

    NFT1155Template.create(Address.fromString(address));
}

export function handleDeploySocialToken(event: DeploySocialToken): void {
    const address = event.params.proxy.toHex();
    const token = new SocialToken(address);
    token.owner = event.params.owner;
    token.name = event.params.name;
    token.symbol = event.params.symbol;
    token.dividendToken = event.params.dividendToken;
    token.save();

    SocialTokenTemplate.create(Address.fromString(address));
}

export function handleTag(event: Tag): void {
    const tag = event.params.tag.toString().trim();
    if (tag.length > 0) {
        const nftId = event.params.nft.toHex() + ":" + event.params.tokenId.toString();
        const nft = NFT.load(nftId);
        if (!nft) {
            log.warning("No matching NFT with id: {}", [nftId]);
            return;
        }
        // remove previous tags
        const nonce = event.params.tagNonce;
        if (nonce.gt(BigInt.fromI32(0))) {
            const prevNonce = nonce.minus(BigInt.fromI32(1));
            if (prevNonce.equals(nft.tagNonce)) {
                for (let i = 0; i < nft.tagCount; i++) {
                    const tagId = nftId.toString() + ":" + prevNonce.toString() + ":" + i.toString();
                    store.remove("NFTTag", tagId);
                }
            }
        }

        // register new tag
        const index = nft.tagCount;
        const tag = new NFTTag(nftId + ":" + event.params.tagNonce.toString() + ":" + index.toString());
        tag.content = event.params.tag.toString();
        tag.save();

        nft.tagCount += 1;
        nft.tagNonce = event.params.tagNonce;
        nft.save();
    }
}
