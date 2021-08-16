import { ethereum, crypto, BigInt, Bytes, ByteArray } from "@graphprotocol/graph-ts/index";
import { BurnRecord, NFT, NFTContract } from "../../../generated/schema";
import { Address } from "@graphprotocol/graph-ts";

let ORDER_TYPEHASH = Bytes.fromHexString("0x17fdf8831f8bd77353b30f42ba9bc64e7144545a42a890389f298feeb45dec88");

export function createNFT(address: Bytes, tokenId: BigInt): NFT {
    let contract = NFTContract.load(address.toHex());

    let nftId = address.toHex() + ":" + tokenId.toString();
    let nft = new NFT(nftId);
    if (contract) nft.contract = contract.id;
    nft.address = address;
    nft.tokenId = tokenId;
    nft.tagNonce = BigInt.fromI32(0);
    nft.tagCount = 0;
    nft.save();

    return nft;
}

export function createBurnRecord(
    txHash: Bytes,
    logIndex: BigInt,
    address: Bytes,
    tokenId: BigInt,
    amount: BigInt,
    label: BigInt,
    data: Bytes
): BurnRecord {
    let record = new BurnRecord(txHash.toHex() + ":" + logIndex.toString());
    record.contract = address;
    record.tokenId = tokenId;
    record.amount = amount;
    record.label = label;
    record.data = data;
    record.save();
    return record;
}

export function hashOrder(
    signer: Bytes,
    token: Bytes,
    tokenId: BigInt,
    amount: BigInt,
    strategy: Bytes,
    currency: Bytes,
    recipient: Bytes,
    deadline: BigInt,
    params: Bytes
): ByteArray {
    let paramsHash = crypto.keccak256(params);

    let tupleArray: Array<ethereum.Value> = [
        ethereum.Value.fromBytes(ORDER_TYPEHASH as Bytes),
        ethereum.Value.fromAddress(signer as Address),
        ethereum.Value.fromAddress(token as Address),
        ethereum.Value.fromUnsignedBigInt(tokenId),
        ethereum.Value.fromUnsignedBigInt(amount),
        ethereum.Value.fromAddress(strategy as Address),
        ethereum.Value.fromAddress(currency as Address),
        ethereum.Value.fromAddress(recipient as Address),
        ethereum.Value.fromUnsignedBigInt(deadline),
        ethereum.Value.fromBytes(paramsHash as Bytes),
    ];
    return ethereum.encode(ethereum.Value.fromTuple(tupleArray as ethereum.Tuple))!;
}
