import { ChainId, CurrencyAmount, JSBI, Trade } from '@sushiswap/sdk'

import React, { useCallback, useEffect, useState } from 'react'
import BridgeInputPart from '../../components/Bridge/BridgeInputPart'
import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from '../../state/swap/hooks'
import { Text } from 'rebass'
import { Field } from '../../state/swap/actions'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { useExpertModeManager, useUserSingleHopOnly, useUserSlippageTolerance } from '../../state/user/hooks'
import styled from 'styled-components'
import ProgressSteps from '../../components/ProgressSteps'
import BridgePageBody from 'components/Bridge/BridgePageBody'
import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import { TYPE } from '../../theme'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { AutoRow, RowBetween } from '../../components/Row'
import Loader from '../../components/Loader'
import { transparentize } from 'polished'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import { AlertTriangle } from 'react-feather'
import { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink'
import { isTradeBetter } from 'utils/trades'
import chainData from '../../data/statics/bridgeChain.json'
import { RPC } from '../../connectors'

const BottomGrouping = styled.div`
    margin-top: 1rem;
`

const Wrapper = styled.div`
    position: relative;
    padding: 1rem;
`

const SwapCallbackErrorInner = styled.div`
    background-color: ${({ theme }) => transparentize(0.9, theme.red1)};
    border-radius: 1rem;
    display: flex;
    align-items: center;
    font-size: 0.825rem;
    width: 100%;
    padding: 3rem 1.25rem 1rem 1rem;
    margin-top: -2rem;
    color: ${({ theme }) => theme.red1};
    z-index: -1;
    p {
        padding: 0;
        margin: 0;
        font-weight: 500;
    }
`

const SwapCallbackErrorInnerAlertTriangle = styled.div`
    background-color: ${({ theme }) => transparentize(0.9, theme.red1)};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    border-radius: ${({ theme }) => theme.borderRadius};
    min-width: 48px;
    height: 48px;
`

function SwapCallbackError({ error }: { error: string }) {
    return (
        <SwapCallbackErrorInner>
            <SwapCallbackErrorInnerAlertTriangle>
                <AlertTriangle size={24} />
            </SwapCallbackErrorInnerAlertTriangle>
            <p>{error}</p>
        </SwapCallbackErrorInner>
    )
}

export default function Bridge() {
    const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setBridgeState] = useState<{
        showConfirm: boolean
        tradeToConfirm: Trade | undefined
        attemptingTxn: boolean
        swapErrorMessage: string | undefined
        txHash: string | undefined
    }>({
        showConfirm: false,
        tradeToConfirm: undefined,
        attemptingTxn: false,
        swapErrorMessage: undefined,
        txHash: undefined
    })
    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
    const [isExpertMode] = useExpertModeManager()
    const { account, chainId } = useActiveWeb3React()
    console.log(chainId)

    const { independentField, typedValue, recipient } = useSwapState()
    const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
    const {
        v1Trade,
        v2Trade,
        currencyBalances,
        parsedAmount,
        currencies,
        inputError: swapInputError
    } = useDerivedSwapInfo()

    const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
        currencies[Field.INPUT],
        currencies[Field.OUTPUT],
        typedValue
    )

    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
    const toggledVersion = useToggledVersion()
    const tradesByVersion = {
        [Version.v1]: v1Trade,
        [Version.v2]: v2Trade
    }

    const trade = showWrap ? undefined : tradesByVersion[toggledVersion]

    const parsedAmounts = showWrap
        ? {
              [Field.INPUT]: parsedAmount,
              [Field.OUTPUT]: parsedAmount
          }
        : {
              [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
              [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
          }
    const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
    const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: showWrap
            ? parsedAmounts[independentField]?.toExact() ?? ''
            : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
    }
    const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()

    const handleTypeInput = useCallback(
        (value: string) => {
            onUserInput(Field.INPUT, value)
        },
        [onUserInput]
    )
    const handleTypeOutput = useCallback(
        (value: string) => {
            onUserInput(Field.OUTPUT, value)
        },
        [onUserInput]
    )

    const handleMaxInput = useCallback(() => {
        maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
    }, [maxAmountInput, onUserInput])

    const handleInputSelect = useCallback(
        inputCurrency => {
            setApprovalSubmitted(false) // reset 2 step UI for approvals
            onCurrencySelection(Field.INPUT, inputCurrency)
        },
        [onCurrencySelection]
    )
    const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
        onCurrencySelection
    ])

    const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)
    const toggleWalletModal = useWalletModalToggle()

    const route = trade?.route
    const userHasSpecifiedInputOutput = Boolean(
        currencies[Field.INPUT] &&
            currencies[Field.OUTPUT] &&
            parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
    )
    const noRoute = !route

    const [singleHopOnly] = useUserSingleHopOnly()

    const [allowedSlippage] = useUserSlippageTolerance()

    const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

    const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

    const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

    const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

    const showApproveFlow =
        !swapInputError &&
        (approval === ApprovalState.NOT_APPROVED ||
            approval === ApprovalState.PENDING ||
            (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
        !(priceImpactSeverity > 3 && !isExpertMode)

    const handleBridge = useCallback(() => {
        console.log('bridge')
    }, [])

    const isValid = !swapInputError

    const betterTradeLinkV2: Version | undefined =
        toggledVersion === Version.v1 && isTradeBetter(v1Trade, v2Trade) ? Version.v2 : undefined

    const defaultTrade = showWrap ? undefined : tradesByVersion[DEFAULT_VERSION]

    const [chainIndex, setChainIndex] = useState(0)
    const handelChainSelect = useCallback(index => {
        setChainIndex(index)
    }, [])

    console.log(chainIndex)
    const networkData = {
        [ChainId.MAINNET]:{
            chainName: 'Ethereum',
            symbol: 'Ether',
            blockExplorerUrls: 'https://etherscan.io',
        },
        [ChainId.OASISETH_MAIN]:{
            chainName: 'Oasis Emerald',
            symbol: 'Rose',
            blockExplorerUrls: 'https://explorer.emerald.oasis.dev/',
        },
        [ChainId.BSC]:{
            chainName: 'Binance Smart Chain Mainnet',
            symbol: 'BNB',
            blockExplorerUrls: 'https://bscscan.com',
        }
    }
    const switchNetwork = (chainIDRequest:ChainId.MAINNET | ChainId.OASISETH_MAIN | ChainId.BSC) => {
        if (window.ethereum) {
            try {
                const data = [
                    {
                        chainId: '0x' + chainIDRequest.toString(16),
                        chainName: networkData[chainIDRequest].chainName,
                        nativeCurrency: {
                            symbol: networkData[chainIDRequest].symbol,
                            decimals: 18
                        },
                        rpcUrls: [RPC[chainIDRequest]],
                        blockExplorerUrls: [networkData[chainIDRequest].blockExplorerUrls]
                    }
                ]

                try {
                    console.log(data)

                    window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: data
                    })
                    window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x' + chainIDRequest.toString(16), }]
                    })
                } catch (addError) {

                }

            } catch (e) {

            }
        }
    }
    useEffect(() => {
        if (chainIndex !== undefined) {
            const selectedChainId = chainData.bridgeChain[chainIndex].chainid
            // console.log(chainId, selectedChainId)
            if (selectedChainId !== undefined && chainId !== selectedChainId) {
                // @ts-ignore
                switchNetwork(selectedChainId)
            }
        } else {
            console.log(chainId)
        }
    }, [chainIndex])

    return (
        <>
            <h1>Bridge Page</h1>
            <BridgePageBody>
                <Wrapper>
                    <AutoColumn gap={isExpertMode ? 'md' : '6px'}>
                        <BridgeInputPart
                            label={
                                independentField === Field.OUTPUT && !showWrap && trade ? 'From (estimated)' : 'From'
                            }
                            value={formattedAmounts[Field.INPUT]}
                            showMaxButton={!atMaxAmountInput}
                            currency={currencies[Field.INPUT]}
                            chainIndex={chainIndex}
                            onChainSelect={handelChainSelect}
                            onUserInput={handleTypeInput}
                            onMax={handleMaxInput}
                            onCurrencySelect={handleInputSelect}
                            otherCurrency={currencies[Field.OUTPUT]}
                            id="swap-currency-input"
                            cornerRadiusBottomNone={isExpertMode ? false : true}
                        />
                        <BridgeInputPart
                            value={formattedAmounts[Field.OUTPUT]}
                            onUserInput={handleTypeOutput}
                            label={independentField === Field.INPUT && !showWrap && trade ? 'To (estimated)' : 'To'}
                            showMaxButton={false}
                            currency={currencies[Field.OUTPUT]}
                            onCurrencySelect={handleOutputSelect}
                            otherCurrency={currencies[Field.INPUT]}
                            id="swap-currency-output"
                            cornerRadiusTopNone={isExpertMode ? false : true}
                            disableChainSelect={true}
                            disableCurrencySelect={true}
                        />
                    </AutoColumn>
                    <BottomGrouping style={{ paddingBottom: '1rem' }}>
                        {swapIsUnsupported ? (
                            <ButtonPrimary disabled={true}>
                                <TYPE.main mb="4px">Unsupported Asset</TYPE.main>
                            </ButtonPrimary>
                        ) : !account ? (
                            <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
                        ) : showWrap ? (
                            <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                                {wrapInputError ??
                                    (wrapType === WrapType.WRAP
                                        ? 'Wrap'
                                        : wrapType === WrapType.UNWRAP
                                        ? 'Unwrap'
                                        : null)}
                            </ButtonPrimary>
                        ) : noRoute && userHasSpecifiedInputOutput ? (
                            <GreyCard style={{ textAlign: 'center' }}>
                                <TYPE.main mb="4px">Insufficient liquidity for this trade.</TYPE.main>
                                {singleHopOnly && <TYPE.main mb="4px">Try enabling multi-hop trades.</TYPE.main>}
                            </GreyCard>
                        ) : showApproveFlow ? (
                            <RowBetween>
                                <ButtonConfirmed
                                    onClick={approveCallback}
                                    disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                                    width="48%"
                                    altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                                    confirmed={approval === ApprovalState.APPROVED}
                                >
                                    {approval === ApprovalState.PENDING ? (
                                        <AutoRow gap="6px" justify="center">
                                            Approving <Loader stroke="white" />
                                        </AutoRow>
                                    ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                                        'Approved'
                                    ) : (
                                        'Approve ' + currencies[Field.INPUT]?.getSymbol(chainId)
                                    )}
                                </ButtonConfirmed>
                                <ButtonError
                                    onClick={() => {
                                        if (isExpertMode) {
                                            handleBridge()
                                        } else {
                                            setBridgeState({
                                                tradeToConfirm: trade,
                                                attemptingTxn: false,
                                                swapErrorMessage: undefined,
                                                showConfirm: true,
                                                txHash: undefined
                                            })
                                        }
                                    }}
                                    width="48%"
                                    id="swap-button"
                                    disabled={
                                        !isValid ||
                                        approval !== ApprovalState.APPROVED ||
                                        (priceImpactSeverity > 3 && !isExpertMode)
                                    }
                                    error={isValid && priceImpactSeverity > 2}
                                >
                                    <Text fontSize={16} fontWeight={500}>
                                        {priceImpactSeverity > 3 && !isExpertMode
                                            ? `Price Impact High`
                                            : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                                    </Text>
                                </ButtonError>
                            </RowBetween>
                        ) : (
                            <ButtonError
                                onClick={() => {
                                    if (isExpertMode) {
                                        handleBridge()
                                    } else {
                                        setBridgeState({
                                            tradeToConfirm: trade,
                                            attemptingTxn: false,
                                            swapErrorMessage: undefined,
                                            showConfirm: true,
                                            txHash: undefined
                                        })
                                    }
                                }}
                                id="swap-button"
                                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                                error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                            >
                                <Text fontSize={20} fontWeight={500}>
                                    {swapInputError
                                        ? swapInputError
                                        : priceImpactSeverity > 3 && !isExpertMode
                                        ? `Price Impact Too High`
                                        : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                                </Text>
                            </ButtonError>
                        )}
                        {showApproveFlow && (
                            <Column style={{ marginTop: '1rem' }}>
                                <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                            </Column>
                        )}
                        {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                        {betterTradeLinkV2 && !swapIsUnsupported && toggledVersion === Version.v1 ? (
                            <BetterTradeLink version={betterTradeLinkV2} />
                        ) : toggledVersion !== DEFAULT_VERSION && defaultTrade ? (
                            <DefaultVersionLink />
                        ) : null}
                    </BottomGrouping>
                </Wrapper>
            </BridgePageBody>
        </>
    )
}
