import { currencyEquals, Trade } from '@sushiswap/sdk'
import React, { useCallback, useMemo } from 'react'
import TransactionConfirmationModal, {
    ConfirmationModalContent,
    TransactionErrorContent
} from '../TransactionConfirmationModal'
import BridgeModalFooter from './‌BridgeModalFooter'
import BridgeModalHeader from './BridgeModalHeader'
import { useActiveWeb3React } from '../../hooks'
import { networkData } from 'pages/Bridge'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
    return (
        tradeA.tradeType !== tradeB.tradeType ||
        !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
        !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
        !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
        !tradeA.outputAmount.equalTo(tradeB.outputAmount)
    )
}

export default function ConfirmBridgeModal({
    trade,
    originalTrade,
    onConfirm,
    onDismiss,
    recipient,
    swapErrorMessage,
    isOpen,
    attemptingTxn,
    txHash
}: {
    isOpen: boolean
    trade: any
    originalTrade: Trade | undefined
    attemptingTxn: boolean
    txHash: string | undefined
    recipient: string | null
    onConfirm: () => void
    swapErrorMessage: string | undefined
    onDismiss: () => void
}) {
    const { chainId } = useActiveWeb3React()

    const modalHeader = useCallback(() => {
        return trade ? <BridgeModalHeader trade={trade} recipient={recipient} /> : null
    }, [recipient, trade])

    const modalBottom = useCallback(() => {
        return trade ? (
            <BridgeModalFooter onConfirm={onConfirm} trade={trade} swapErrorMessage={swapErrorMessage} />
        ) : null
    }, [onConfirm, swapErrorMessage, trade])

    const inputChain = trade.fromChainID
    const outputChain = trade.destChainID
    const inputToken = trade.inputToken.name

    const pendingText = `Bridged ${inputToken} from  ${inputChain} to ${outputChain}`

    const confirmationContent = useCallback(
        () =>
            swapErrorMessage ? (
                <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
            ) : (
                <ConfirmationModalContent
                    title="Confirm ‌Bridge"
                    onDismiss={onDismiss}
                    topContent={modalHeader}
                    bottomContent={modalBottom}
                />
            ),
        [onDismiss, modalBottom, modalHeader, swapErrorMessage]
    )

    return (
        <TransactionConfirmationModal
            isOpen={isOpen}
            onDismiss={onDismiss}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={confirmationContent}
            pendingText={pendingText}
        />
    )
}
