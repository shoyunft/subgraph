import { Bid, Bid1Call, BidCall, Cancel, Execute } from "../../generated/ERC1155ExchangeV0/IBaseExchange";

import {
    createOrder,
    updateOrderOnCancel,
    updateOrderOnBid,
    updateOrderOnExecute,
    BidParams,
    AskOrderParams,
    CancelParams,
    ExecuteParams,
} from "./helpers/exchange-helpers";

export function handleBid1Call(call: Bid1Call): void {
    createOrder(call.inputs.askOrder as AskOrderParams);
}

export function handleBidCall(call: BidCall): void {
    createOrder(call.inputs.askOrder as AskOrderParams);
}

export function handleBid(event: Bid): void {
    updateOrderOnBid(event.params as BidParams);
}

export function handleCancel(event: Cancel): void {
    updateOrderOnCancel(event.params as CancelParams);
}

export function handleExecute(event: Execute): void {
    updateOrderOnExecute(event.params as ExecuteParams);
}
