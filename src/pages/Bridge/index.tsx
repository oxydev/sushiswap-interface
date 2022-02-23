import { ChainId, Currency, CurrencyAmount, JSBI, Token, Trade } from '@sushiswap/sdk'

import React, { useCallback, useEffect, useState } from 'react'
import BridgeInputPart from '../../components/Bridge/BridgeInputPart'
import { tryParseAmount, useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from '../../state/swap/hooks'
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
import { useBridgeCallback, useSwapCallback } from '../../hooks/useSwapCallback'
import { AlertTriangle } from 'react-feather'
import { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink'
import { isTradeBetter } from 'utils/trades'
import { RPC } from '../../connectors'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { ethers } from 'ethers'
import { getSigner } from 'utils'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import ConfirmBridgeModal from '../../components/Bridge/Confirm‌BridgeModal'

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

type tNetworkData = {
    [key: number]: any
}

export const networkData: tNetworkData = {
    [ChainId.MAINNET]: {
        chainName: 'Ethereum',
        symbol: 'Ether',
        chainHex: '0x1',
        blockExplorerUrls: 'https://etherscan.io',
        tokenList: [
            {
                src: new Token(
                    ChainId.MAINNET,
                    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                    18,
                    'DAI',
                    'DAI Stablecoin'
                ),
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c',
                    18,
                    'DAI',
                    'DAI Stablecoin'
                ),
                destChain: ChainId.OASISETH_MAIN
            },
            {
                src: Currency.NATIVE[ChainId.MAINNET],
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
                    18,
                    'ETH(MULTI)',
                    'Ethereum'
                ),
                destChain: ChainId.OASISETH_MAIN
            },
            {
                src: new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin'),
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',
                    6,
                    'USDC',
                    'USD Coin'
                ),
                destChain: ChainId.OASISETH_MAIN
            },
            {
                src: new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC'),
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818',
                    8,
                    'WBTC',
                    'Wrapped BTC'
                ),
                destChain: ChainId.OASISETH_MAIN
            },
            {
                src: new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD'),
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',
                    6,
                    'USDT',
                    'Tether USD'
                ),
                destChain: ChainId.OASISETH_MAIN
            }
        ]
    },
    [ChainId.OASISETH_MAIN]: {
        chainName: 'Oasis Emerald',
        symbol: 'Rose',
        chainHex: '0xa516',
        blockExplorerUrls: 'https://explorer.emerald.oasis.dev/',
        tokenList: [
            {
                src: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C',
                    18,
                    'BUSD',
                    'Binance-Peg BUSD Token'
                ),
                destToken: new Token(
                    ChainId.BSC,
                    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
                    18,
                    'BUSD',
                    'Binance-Peg BUSD Token'
                ),
                destChain: ChainId.BSC
            },
            {
                src: new Token(
                    ChainId.OASISETH_MAIN,
                    '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
                    18,
                    'BNB',
                    'Binance'
                ),
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
                    18,
                    'BNB',
                    'Binance'
                ),
                destChain: ChainId.BSC
            },
            {
                src: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c',
                    18,
                    'DAI',
                    'DAI Stablecoin'
                ),
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c',
                    18,
                    'DAI',
                    'DAI Stablecoin'
                ),
                destChain: ChainId.MAINNET
            },
            {
                src: new Token(
                    ChainId.OASISETH_MAIN,
                    '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
                    18,
                    'ETH(MULTI)',
                    'Ethereum'
                ),
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
                    18,
                    'ETH(MULTI)',
                    'Ethereum'
                ),
                destChain: ChainId.MAINNET
            },
            {
                src: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',
                    6,
                    'USDC',
                    'USD Coin'
                ),
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',
                    6,
                    'USDC',
                    'USD Coin'
                ),
                destChain: ChainId.MAINNET
            },
            {
                src: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818',
                    8,
                    'WBTC',
                    'Wrapped BTC'
                ),
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818',
                    8,
                    'WBTC',
                    'Wrapped BTC'
                ),
                destChain: ChainId.MAINNET
            },
            {
                src: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',
                    6,
                    'USDT',
                    'Tether USD'
                ),
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',
                    6,
                    'USDT',
                    'Tether USD'
                ),
                destChain: ChainId.MAINNET
            }
        ]
    },
    [ChainId.BSC]: {
        chainName: 'Binance Smart Chain Mainnet',
        symbol: 'BNB',
        chainHex: '0x38',
        blockExplorerUrls: 'https://bscscan.com',
        tokenList: [
            {
                src: Currency.NATIVE[ChainId.BSC],
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
                    18,
                    'BNB',
                    'Binance'
                ),
                destChain: ChainId.OASISETH_MAIN
            },
            {
                src: new Token(
                    ChainId.BSC,
                    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
                    18,
                    'BUSD',
                    'Binance-Peg BUSD Token'
                ),
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C',
                    18,
                    'BUSD',
                    'Binance-Peg BUSD Token'
                ),
                destChain: ChainId.OASISETH_MAIN
            }
        ]
    }
}

export default function Bridge() {
    const [bridgeType, setBridgeType] = useState<string>('swapOut')
    const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setBridgeState] = useState<{
        showConfirm: boolean
        tradeToConfirm: any | undefined
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
    const [isExpertMode] = useExpertModeManager()
    const { account, chainId, library } = useActiveWeb3React()

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
    const [chainInput, setChainInput] = useState<ChainId.MAINNET | ChainId.OASISETH_MAIN | ChainId.BSC>(
        ChainId.OASISETH_MAIN
    )
    const initialImportList: Token[] = []
    networkData[ChainId.OASISETH_MAIN].tokenList.forEach((item: any) => {
        initialImportList.push(item.src)
    })
    const [currencyListInput, setCurrencyListInput] = useState<Token[]>([...initialImportList])

    const [chainOutput, setChainOutput] = useState<ChainId.MAINNET | ChainId.OASISETH_MAIN | ChainId.BSC>()
    const [currencyInput, setCurrencyInput] = useState<Token>(currencyListInput[0])
    const [currencyOutput, setCurrencyOutput] = useState<Token>()
    const [bridgeRecipient, setBridgeRecipient] = useState('saber')

    const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
        currencies[Field.INPUT],
        currencies[Field.OUTPUT],
        typedValue
    )


    // const trade = showWrap ? undefined : tradesByVersion[toggledVersion]

    const parsedAmounts = {
              [Field.INPUT]: parsedAmount,
              [Field.OUTPUT]: parsedAmount
          }
    const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
    const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? ''
    }
    const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()

    const [transferData, setTransferData] = useState<tTransferData>({})

    const handleTypeInput = useCallback(
        (value: string) => {
            onUserInput(Field.INPUT, value)
            checkTransactionStatus(parseFloat(value))
        },
        [onUserInput, transferData]
    )
    const handleMaxInput = useCallback(() => {
        maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
    }, [maxAmountInput, onUserInput])

    const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
        onCurrencySelection
    ])

    const toggleWalletModal = useWalletModalToggle()
    const [outPutValue, setOutPutValue] = useState<number>(0)

    const bridgeTrade: {
        type: string
        inputToken: Token
        inputAmount: CurrencyAmount | undefined
        outputAmount: CurrencyAmount | undefined
        fromChainID: ChainId
        destChainID: ChainId | undefined
    } = {
        type: bridgeType,
        inputToken: currencyInput,
        inputAmount: tryParseAmount(formattedAmounts[Field.INPUT], currencyInput),
        outputAmount: tryParseAmount(outPutValue.toString(), currencyOutput),
        fromChainID: chainInput,
        destChainID: chainOutput
    }

    const { callback: swapCallback, error: swapCallbackError } = useBridgeCallback(bridgeTrade, bridgeRecipient)


    const handelChainSelect = useCallback(index => {
        setChainInput(index)
    }, [])

    const handleInputSelect = useCallback(
        inputCurrency => {
            // onCurrencySelection(Field.INPUT, inputCurrency)
            setCurrencyInput(inputCurrency)
        },
        [onCurrencySelection]
    )

    type tTransferData = {
        [key: string]: any
    }
    // console.log('shit', transferData)
    useEffect(() => {
        if (chainInput && chainOutput && currencyInput && currencyOutput) {
            fetch('https://bridgeapi.anyswap.exchange/merge/tokenlist/42262')
                .then(function(response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status)
                        return
                    }

                    // Examine the text in the response
                    response
                        .json()
                        .then(function(data) {
                            // console.log(data)
                            // console.log('shit', currencyOutput.address, chainInput, currencyInput.address, chainOutput)
                            if (chainOutput === ChainId.OASISETH_MAIN)
                                data =
                                    data[currencyOutput.address.toLowerCase()]['destChains'][chainInput][
                                        currencyInput.address
                                            ? currencyInput.address.toLowerCase()
                                            : chainInput === ChainId.MAINNET
                                            ? 'ETH'
                                            : 'BNB'
                                    ]
                            else
                                data =
                                    data[currencyInput.address.toLowerCase()]['destChains'][chainOutput][
                                        currencyOutput.address
                                            ? currencyOutput.address.toLowerCase()
                                            : chainOutput === ChainId.MAINNET
                                            ? 'ETH'
                                            : 'BNB'
                                    ]

                            // console.log(data)
                            setTransferData(data)
                        })
                        .catch(err => {
                            console.log(err, currencyOutput, currencyInput)
                        })
                })
                .catch(function(err) {
                    console.log('Fetch Error :-S', err)
                })
        }
        //todo Saber
    }, [chainInput, chainOutput, currencyInput, currencyOutput])

    useEffect(() => {
        console.log(transferData)
    }, [transferData])

    const [bridgeStatus, setBridgeStatus] = useState('ok')

    const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currencyInput ?? undefined)

    const checkTransactionStatus = (value: number) => {
        //check the amount with balance

        if (selectedCurrencyBalance !== undefined && value > parseFloat(selectedCurrencyBalance.toSignificant(6))) {
            setBridgeStatus('notBalance')
            setOutPutValue(0)
        } else if (value > transferData.MaximumSwap) {
            setBridgeStatus('maxLimit')
            setOutPutValue(0)
        } else if (value < transferData.MinimumSwap) {
            setBridgeStatus('minLimit')
            setOutPutValue(0)
        } else {
            setBridgeStatus('ok')
            let fee = value * transferData.SwapFeeRatePerMillion * 0.01
            if (fee > transferData.MaximumSwapFee) {
                fee = transferData.MaximumSwapFee
            } else if (fee < transferData.MinimumSwapFee) {
                fee = transferData.MinimumSwapFee
            }

            const outPut = value - fee
            console.log(outPut)
            // onUserInput(Field.OUTPUT, outPutValue.toString())
            setOutPutValue(outPut)
        }
    }

    const switchNetwork = (chainIDRequest: ChainId.MAINNET | ChainId.OASISETH_MAIN | ChainId.BSC) => {
        if (window.ethereum) {
            try {
                const data = [
                    {
                        chainId: networkData[chainIDRequest].chainHex,
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
                    // console.log(data)

                    window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: data
                    })
                    window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: networkData[chainIDRequest].chainHex }]
                    })
                } catch (addError) {}
            } catch (e) {}
        }
    }
    useEffect(() => {
        if (chainInput !== undefined) {
            // console.log(chainId, selectedChainId)
            if (chainInput !== undefined && chainId !== chainInput) {
                switchNetwork(chainInput)
                let inputTokenList: Token[] = []
                for (const item of networkData[chainInput].tokenList) {
                    inputTokenList.push(item.src)
                }
                setCurrencyListInput(inputTokenList)
                const tokenIndex = 0
                const importData = networkData[chainInput].tokenList[tokenIndex]
                // console.log(importData)
                setChainOutput(importData.destChain)
                setCurrencyOutput(importData.destToken)
            }
        } else {
            console.log(chainId)
        }
    }, [chainInput])

    useEffect(() => {
        if (chainInput === ChainId.OASISETH_MAIN) {
            setBridgeType('swapOut')
            if (account) {
                setBridgeRecipient(account)
            }
        } else if (!currencyInput.address) {
            setBridgeType('transferNative')
            setBridgeRecipient(transferData.DepositAddress)
        } else {
            setBridgeType('transferToken')
            setBridgeRecipient(transferData.DepositAddress)
        }
    }, [chainInput, currencyInput, account])

    useEffect(() => {
        console.log(currencyInput)
        const tokenIndex = currencyListInput.indexOf(currencyInput)
        const importData = networkData[chainInput].tokenList[tokenIndex]
        // console.log(importData)
        setChainOutput(importData.destChain)
        setCurrencyOutput(importData.destToken)
    }, [currencyInput])

    useEffect(() => {
        setCurrencyInput(currencyListInput[0])
    }, [currencyListInput])

    useEffect(() => {
        if (chainInput !== undefined && chainId !== undefined) {
            // console.log(chainId, selectedChainId)
            if (chainInput !== chainId) {
                if (chainId === ChainId.MAINNET || chainId === ChainId.OASISETH_MAIN || chainId === ChainId.BSC) {
                    setChainInput(chainId)
                }
            }
        } else {
            console.log(chainId)
        }
    }, [chainId])

    const handleBridge = async () => {
        console.log(currencyInput)

        if (!currencyInput.address) {
            //native token
            // web3.sendTransaction({ to: receiver, from: sender, value: web3.toWei('0.5', 'ether') })

            if (library && account) {
                const signer = getSigner(library, account)
                await signer.sendTransaction({
                    to: transferData.DepositAddress,
                    value: ethers.utils.parseEther(formattedAmounts[Field.INPUT]) // 1 ether
                })
            }
        }
    }
    const handleConfirmDismiss = useCallback(() => {
        setBridgeState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
        // if there was a tx hash, we want to clear the input
        if (txHash) {
            onUserInput(Field.INPUT, '')
        }
    }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

    return (
        <>
            <BridgePageBody>
                {/*<h1></h1>*/}

                <Wrapper>
                    <TYPE.black fontWeight={500} color={'#ffd545'}>
                        Bridge Page
                    </TYPE.black>
                    <ConfirmBridgeModal
                        isOpen={showConfirm}
                        trade={bridgeTrade}
                        originalTrade={tradeToConfirm}
                        attemptingTxn={attemptingTxn}
                        txHash={txHash}
                        recipient={recipient}
                        onConfirm={handleBridge}
                        swapErrorMessage={swapErrorMessage}
                        onDismiss={handleConfirmDismiss}
                    />
                    <AutoColumn gap={isExpertMode ? 'md' : '6px'}>
                        <BridgeInputPart
                            label={
                                independentField === Field.OUTPUT && bridgeTrade ? 'From (estimated)' : 'From'
                            }
                            value={formattedAmounts[Field.INPUT]}
                            showMaxButton={!atMaxAmountInput}
                            currency={currencyInput}
                            chain={chainInput}
                            onChainSelect={handelChainSelect}
                            currencyList={currencyListInput}
                            onUserInput={handleTypeInput}
                            onMax={handleMaxInput}
                            onCurrencySelect={handleInputSelect}
                            otherCurrency={currencies[Field.OUTPUT]}
                            id="swap-currency-input"
                            cornerRadiusBottomNone={isExpertMode ? false : true}
                        />
                        <BridgeInputPart
                            value={outPutValue.toString()}
                            onUserInput={() => {
                                console.log('outPut')
                            }}
                            label={independentField === Field.INPUT && bridgeTrade ? 'To (estimated)' : 'To'}
                            showMaxButton={false}
                            chain={chainOutput}
                            currency={currencyOutput}
                            onCurrencySelect={handleOutputSelect}
                            otherCurrency={currencies[Field.INPUT]}
                            id="swap-currency-output"
                            cornerRadiusTopNone={isExpertMode ? false : true}
                            disableChainSelect={true}
                            disableCurrencySelect={true}
                            disableInput={true}
                        />
                    </AutoColumn>
                    <BottomGrouping style={{ paddingBottom: '1rem' }}>
                        {!account ? (
                            <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
                        ) : formattedAmounts[Field.INPUT] !== '' && bridgeStatus === 'ok' ? (
                            <>
                                <ButtonConfirmed
                                    onClick={() => {
                                        setBridgeState({
                                            tradeToConfirm: bridgeTrade,
                                            attemptingTxn: false,
                                            swapErrorMessage: undefined,
                                            showConfirm: true,
                                            txHash: undefined
                                        })
                                    }}
                                    width="100%"
                                    confirmed={true}
                                >
                                    Bridge
                                </ButtonConfirmed>
                            </>
                        ) : (
                            <ButtonError
                                onClick={() => {
                                    if (isExpertMode) {
                                        handleBridge()
                                    } else {
                                        setBridgeState({
                                            tradeToConfirm: bridgeTrade,
                                            attemptingTxn: false,
                                            swapErrorMessage: undefined,
                                            showConfirm: true,
                                            txHash: undefined
                                        })
                                    }
                                }}
                                id="swap-button"
                            >
                                <Text fontSize={20} fontWeight={500}>
                                    {bridgeStatus === 'notBalance'
                                        ? 'Not Enough Balance'
                                        : bridgeStatus === 'maxLimit'
                                        ? `Trnafer not supporting for amount more than ${transferData.MaximumSwap}`
                                        : bridgeStatus === 'minLimit'
                                        ? `Trnafer not supporting for amount less than ${transferData.MinimumSwap}`
                                        : 'Got an error'}
                                </Text>
                            </ButtonError>
                        )}

                        {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                    </BottomGrouping>
                    {transferData && (
                        <AutoColumn gap={'6px'}>
                            <Text fontSize={20} fontWeight={500} style={{ marginBottom: '15px' }}>
                                Reminder:
                            </Text>
                            <Text fontSize={16} fontWeight={400}>
                                Crosschain Fee is{' '}
                                {transferData.SwapFeeRatePerMillion ? transferData.SwapFeeRatePerMillion : 0} %, Minimum
                                Crosschain Fee is {transferData.MinimumSwapFee ? transferData.MinimumSwapFee : 0}{' '}
                                {transferData.symbol}, Maximum Crosschain Fee is{' '}
                                {transferData.MaximumSwapFee ? transferData.MaximumSwapFee : 0} {transferData.symbol}
                            </Text>
                            <Text fontSize={16} fontWeight={400}>
                                Minimum Crosschain Amount is {transferData.MinimumSwap ? transferData.MinimumSwap : 0}{' '}
                                {transferData.symbol}
                            </Text>
                            <Text fontSize={16} fontWeight={400}>
                                Minimum Crosschain Amount is {transferData.MaximumSwap ? transferData.MaximumSwap : 0}{' '}
                                {transferData.symbol}
                            </Text>
                            <Text fontSize={16} fontWeight={400}>
                                Estimated Time of Crosschain Arrival is 10-30 min
                            </Text>
                            <Text fontSize={16} fontWeight={400}>
                                Crosschain amount larger than{' '}
                                {transferData.BigValueThreshold ? transferData.BigValueThreshold : 0}{' '}
                                {transferData.symbol} could take up to 12 hours
                            </Text>
                        </AutoColumn>
                    )}
                </Wrapper>
            </BridgePageBody>
        </>
    )
}
