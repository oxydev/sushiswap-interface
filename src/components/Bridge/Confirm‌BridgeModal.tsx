import { currencyEquals, Trade } from '@sushiswap/sdk'
import React, { useCallback, useMemo } from 'react'
import TransactionConfirmationModal, {
    ConfirmationModalContent,
    TransactionErrorContent
} from '../TransactionConfirmationModal'
import BridgeModalFooter from './‌BridgeModalFooter'
import BridgeModalHeader from './BridgeModalHeader'
import { useActiveWeb3React } from '../../hooks'

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
    onAcceptChanges,
    allowedSlippage,
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
    allowedSlippage: number
    onAcceptChanges: () => void
    onConfirm: () => void
    swapErrorMessage: string | undefined
    onDismiss: () => void
}) {
    const { chainId } = useActiveWeb3React()

    const showAcceptChanges = useMemo(
        () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
        [originalTrade, trade]
    )

    const modalHeader = useCallback(() => {
        return trade ? (
            <BridgeModalHeader
                trade={trade}
                allowedSlippage={allowedSlippage}
                recipient={recipient}
                showAcceptChanges={showAcceptChanges}
                onAcceptChanges={onAcceptChanges}
            />
        ) : null
    }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade])

    const modalBottom = useCallback(() => {
        return trade ? (
            <BridgeModalFooter
                onConfirm={onConfirm}
                trade={trade}
                disabledConfirm={showAcceptChanges}
                swapErrorMessage={swapErrorMessage}
                allowedSlippage={allowedSlippage}
            />
        ) : null
    }, [allowedSlippage, onConfirm, showAcceptChanges, swapErrorMessage, trade])

    // text to show while loading
    const pendingText = `Swapping ${trade?.inputAmount?.toSignificant(6)} ${trade?.inputAmount?.currency?.getSymbol(
        chainId
    )} for ${trade?.outputAmount?.toSignificant(6)} ${trade?.outputAmount?.currency?.getSymbol(chainId)}`

    const confirmationContent = useCallback(
        () =>
            swapErrorMessage ? (
                <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
            ) : (
                <ConfirmationModalContent
                    title="Confirm Swap"
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
