import { ChainId, Currency, CurrencyAmount, Token } from '@sushiswap/sdk'
import { AlertTriangle, ArrowDown } from 'react-feather'
import React, { useCallback, useEffect, useState } from 'react'
import BridgeInputPart from '../../components/Bridge/BridgeInputPart'
import { tryParseAmount, useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from '../../state/swap/hooks'
import { Text } from 'rebass'
import { Field } from '../../state/swap/actions'
import useWrapCallback from '../../hooks/useWrapCallback'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { useExpertModeManager } from '../../state/user/hooks'
import styled from 'styled-components'
import BridgePageBody from 'components/Bridge/BridgePageBody'
import { ButtonConfirmed, ButtonError, ButtonLight } from 'components/Button'
import { TYPE } from '../../theme'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { AutoRow, RowBetween } from '../../components/Row'
import { transparentize } from 'polished'
import { useBridgeCallback } from '../../hooks/useSwapCallback'
import Column, { AutoColumn } from '../../components/Column'
import { RPC } from '../../connectors'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import ConfirmBridgeModal from '../../components/Bridge/Confirm‌BridgeModal'
import {
    ApprovalState,
    useApproveCallbackFromBridge,
    useApproveCallbackFromTrade
} from '../../hooks/useApproveCallback'
import Loader from '../../components/Loader'
import ProgressSteps from '../../components/ProgressSteps'
import DownArrow from '../../assets/images/downArrow.svg'

const ArrowWrapper = styled.div<{ clickable: boolean }>`
    padding: 2px;
`

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

const ReplaceBridgeSide = styled.img`
    position: absolute;
    margin: auto;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 5;
    width: 30px;
    height: 30px;
    cursor: pointer;
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
                    '0x514910771AF9Ca656af840dff83E8264EcF986CA',
                    18,
                    'LINK',
                    'ChainLink Token'
                ),
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055',
                    18,
                    'LINK',
                    'ChainLink Token'
                ),
                destChain: ChainId.OASISETH_MAIN
            },
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
                    '0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055',
                    18,
                    'LINK',
                    'ChainLink Token'
                ),
                destToken: new Token(
                    ChainId.MAINNET,
                    '0x514910771AF9Ca656af840dff83E8264EcF986CA',
                    18,
                    'LINK',
                    'ChainLink Token'
                ),
                destChain: ChainId.MAINNET
            },
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
                destToken: Currency.NATIVE[ChainId.BSC],
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
                    ChainId.MAINNET,
                    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
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
                destToken: Currency.NATIVE[ChainId.MAINNET],
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
                    ChainId.MAINNET,
                    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
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
                    ChainId.MAINNET,
                    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
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
                    ChainId.MAINNET,
                    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                    6,
                    'USDT',
                    'Tether USD'
                ),
                destChain: ChainId.MAINNET
            }
        ]
    },
    [ChainId.BSC]: {
        chainName: 'Binance Smart Chain',
        symbol: 'BNB',
        chainHex: '0x38',
        blockExplorerUrls: 'https://bscscan.com',
        tokenList: [
            {
                src: new Token(
                    ChainId.BSC,
                    '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
                    18,
                    'LINK',
                    'Binance-Peg ChainLink Token'
                ),
                destToken: new Token(
                    ChainId.OASISETH_MAIN,
                    '0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055',
                    18,
                    'LINK',
                    'ChainLink Token'
                ),
                destChain: ChainId.OASISETH_MAIN
            },
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
    const [chainInput, setChainInput] = useState<ChainId>(chainId ? chainId : 1)
    const initialImportList: Token[] = []
    networkData[chainId ? chainId : 1].tokenList.forEach((item: any) => {
        initialImportList.push(item.src)
    })
    const [currencyListInput, setCurrencyListInput] = useState<Token[]>([...initialImportList])

    const [chainOutput, setChainOutput] = useState<ChainId>()
    const [currencyInput, setCurrencyInput] = useState<Token>(currencyListInput[0])
    const [currencyOutput, setCurrencyOutput] = useState<Token>()
    const [bridgeRecipient, setBridgeRecipient] = useState('')

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
    const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currencyInput ?? undefined)

    const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(selectedCurrencyBalance)
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
        [onUserInput, chainInput, transferData, selectedCurrencyBalance]
    )
    const handleMaxInput = useCallback(() => {
        if (maxAmountInput) handleTypeInput(maxAmountInput?.toExact().toString())
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
        fromChainID: string
        destChainID: string | undefined
        destChain: ChainId | undefined
        fromChain: ChainId
    } = {
        type: bridgeType,
        inputToken: currencyInput,
        inputAmount: tryParseAmount(formattedAmounts[Field.INPUT], currencyInput),
        outputAmount: tryParseAmount(outPutValue.toString(), currencyOutput),
        fromChainID: chainInput === 1 ? 'Ethereum' : chainInput === ChainId.BSC ? 'Binance Smart Chain' : 'Oasis',
        destChainID: chainOutput === 1 ? 'Ethereum' : chainOutput === ChainId.BSC ? 'Binance Smart Chain' : 'Oasis',
        destChain: chainOutput,
        fromChain: chainInput
    }
    const [approval, approveCallback] = useApproveCallbackFromBridge(bridgeTrade)
    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
    useEffect(() => {
        if (approval === ApprovalState.PENDING) {
            setApprovalSubmitted(true)
        }
    }, [approval, approvalSubmitted])
    const showApproveFlow = bridgeTrade.type === "UNDERLYINGV2" && (
        approval === ApprovalState.NOT_APPROVED ||
        approval === ApprovalState.PENDING ||
        (approvalSubmitted && approval === ApprovalState.APPROVED))

    const { callback: swapCallback, error: swapCallbackError } = useBridgeCallback(bridgeTrade, bridgeRecipient)

    const handelChainSelect = useCallback(index => {
        setChainInput(index)
    }, [])

    const handleInputSelect = useCallback(
        inputCurrency => {
            setApprovalSubmitted(false) // reset 2 step UI for approvals

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
            // console.log(chainInput , chainOutput , currencyInput , currencyOutput)
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
                            // console.log(currencyInput)
                            // console.log(chainInput)
                            // console.log(data)
                            // // console.log(data)
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
                            console.log(transferData, err, currencyOutput, currencyInput)
                        })
                })
                .catch(function(err) {
                    console.log('Fetch Error :-S', err)
                })
        }
    }, [chainInput, chainOutput, currencyInput, currencyOutput])

    useEffect(() => {
        // console.log(transferData)
    }, [transferData])

    const [bridgeStatus, setBridgeStatus] = useState('ok')
    const checkTransactionStatus = (value: number) => {
        if (transferData) {
            //check the amount with balance
            // console.log(value, selectedCurrencyBalance, maxAmountInput, selectedCurrencyBalance ? parseFloat(selectedCurrencyBalance?.toSignificant(6)) : 0)
            if (selectedCurrencyBalance !== undefined && value > parseFloat(selectedCurrencyBalance.toExact())) {
                setBridgeStatus('notBalance')
                // setOutPutValue(0)
            } else if (value > transferData.MaximumSwap) {
                setBridgeStatus('maxLimit')
                // setOutPutValue(0)
            } else if (value < transferData.MinimumSwap) {
                setBridgeStatus('minLimit')
                // setOutPutValue(0)
            } else if (selectedCurrencyBalance) {
                setBridgeStatus('ok')
            }
            let fee = value * transferData.SwapFeeRatePerMillion * 0.01
            if (fee > transferData.MaximumSwapFee) {
                fee = transferData.MaximumSwapFee
            } else if (fee < transferData.MinimumSwapFee) {
                fee = transferData.MinimumSwapFee
            }

            const outPut = value - fee
            // console.log(outPut)
            // onUserInput(Field.OUTPUT, outPutValue.toString())
            setOutPutValue(outPut >= 0 ? outPut : 0)
        }
    }

    const switchNetwork = (chainIDRequest: ChainId) => {
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
                    handleTypeInput('')
                    window.ethereum
                        .request({
                            method: 'wallet_addEthereumChain',
                            params: data
                        })
                        .catch(() => {
                            // console.log('shit')
                        })
                    window.ethereum
                        .request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: networkData[chainIDRequest].chainHex }]
                        })
                        .catch(() => {
                            // console.log('shit')
                        })
                } catch (addError) {}
            } catch (e) {
                // console.log('shit')
            }
        }
    }
    useEffect(() => {
        // console.log(chainId, selectedChainId)
        // console.log(chainId)
        if (chainInput !== undefined && chainId !== chainInput) {
            // if (typeof chainInput === 'string') switchNetwork(chainInput)
            // else if (chainId) {
            //     console.log('here')

            //     setChainInput(chainId)
            // }
            switchNetwork(chainInput)

            let inputTokenList: Token[] = []
            for (const item of networkData[chainInput].tokenList) {
                inputTokenList.push(item.src)
            }
            setCurrencyListInput(inputTokenList)
            const tokenIndex = 0
            const importData =
                networkData[chainId && typeof chainInput !== 'string' ? chainId : chainInput].tokenList[tokenIndex]
            // console.log(importData)
            setChainOutput(importData.destChain)
            setCurrencyOutput(importData.destToken)
            // console.log(chainId, chainInput,chainOutput,inputTokenList,importData)
        }
    }, [chainInput])

    useEffect(() => {
        if (transferData) {
            if (transferData.type === 'UNDERLYINGV2') {
                setBridgeType('UNDERLYINGV2')
                if (account) {
                    setBridgeRecipient(account)
                }
            } else {
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
            }
        }
    }, [chainInput, currencyInput, account, transferData])

    useEffect(() => {
        const tokenIndex = currencyListInput.indexOf(currencyInput)

        // console.log(currencyListInput, currencyInput, networkData, chainInput, tokenIndex)
        const importData = networkData[chainInput].tokenList[tokenIndex]
        // console.log(importData)
        if (importData) {
            setChainOutput(importData.destChain)
            setCurrencyOutput(importData.destToken)
        }
    }, [currencyInput, currencyListInput])

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
            // console.log(chainId)
        }
    }, [chainId])

    const handleBridge = async () => {
        // console.log(currencyInput)
        if (swapCallback) {
            swapCallback()
                .then(hash => {
                    setBridgeState({
                        attemptingTxn: false,
                        tradeToConfirm,
                        showConfirm,
                        swapErrorMessage: undefined,
                        txHash: hash
                    })
                })
                .catch(error => {
                    setBridgeState({
                        attemptingTxn: false,
                        tradeToConfirm,
                        showConfirm,
                        swapErrorMessage: error.message,
                        txHash: undefined
                    })
                })
        }
        // if (!currencyInput.address) {
        //     //native token
        //     // web3.sendTransaction({ to: receiver, from: sender, value: web3.toWei('0.5', 'ether') })
        //
        //     if (library && account) {
        //         const signer = getSigner(library, account)
        //         await signer.sendTransaction({
        //             to: transferData.DepositAddress,
        //             value: ethers.utils.parseEther(formattedAmounts[Field.INPUT]) // 1 ether
        //         })
        //     }
        // }
    }
    const handleConfirmDismiss = useCallback(() => {
        setBridgeState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
        // if there was a tx hash, we want to clear the input
        if (txHash) {
            onUserInput(Field.INPUT, '')
        }
    }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

    const replaceBridgeSides = () => {
        const newInputChain = chainOutput
        const newCurrencyInpput = currencyOutput

        if (newInputChain) {
            setChainInput(newInputChain)
        }

        if (newCurrencyInpput) {
            setCurrencyInput(newCurrencyInpput)
        }
    }

    return (
        <>
            <BridgePageBody>
                {/*<h1></h1>*/}

                <Wrapper>
                    <TYPE.black fontWeight={500} color={'#ffd545'} style={{ marginBottom: '15px' }}>
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
                            label={independentField === Field.OUTPUT && bridgeTrade ? 'From (estimated)' : 'From'}
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
                        <AutoColumn justify="space-between">
                            <AutoRow
                                justify={isExpertMode ? 'space-between' : 'center'}
                                style={{ padding: '0 1rem', position: 'relative' }}
                            >
                                <ReplaceBridgeSide
                                    src={DownArrow}
                                    alt="replace"
                                    onClick={replaceBridgeSides}
                                ></ReplaceBridgeSide>
                            </AutoRow>
                        </AutoColumn>
                        <BridgeInputPart
                            value={outPutValue ? outPutValue.toString() : '0'}
                            onUserInput={() => {
                                // console.log('outPut')
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
                            hideBalance={true}
                        />
                    </AutoColumn>
                    <BottomGrouping style={{ paddingBottom: '1rem' }}>
                        <RowBetween>
                            {account && showApproveFlow ? (
                                <ButtonConfirmed
                                    onClick={approveCallback}
                                    disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                                    width="48%"
                                    altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                                    confirmed={approval === ApprovalState.APPROVED}
                                    style={{ flexShrink: 0 }}
                                >
                                    {approval === ApprovalState.PENDING ? (
                                        <AutoRow gap="6px" justify="center">
                                            Approving <Loader stroke="white" />
                                        </AutoRow>
                                    ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                                        'Approved'
                                    ) : (
                                        'Approve ' + currencyInput.getSymbol(chainId)
                                    )}
                                </ButtonConfirmed>
                            ) : null}

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
                                        width={showApproveFlow ? '48%' : '100%'}
                                        style={{ maxWidth: showApproveFlow ? '48%' : '100%', flexShrink: 0 }}
                                        disabled={showApproveFlow && approval !== ApprovalState.APPROVED ? true : false}
                                    >
                                        Bridge
                                    </ButtonConfirmed>
                                </>
                            ) : (
                                <ButtonError
                                    onClick={() => {
                                        // if (isExpertMode) {
                                        //     handleBridge()
                                        // } else {
                                        //     setBridgeState({
                                        //         tradeToConfirm: bridgeTrade,
                                        //         attemptingTxn: false,
                                        //         swapErrorMessage: undefined,
                                        //         showConfirm: true,
                                        //         txHash: undefined
                                        //     })
                                        // }
                                    }}
                                    disabled={true}
                                    id="swap-button"
                                >
                                    <Text fontSize={20} fontWeight={500}>
                                        {!transferData
                                            ? 'Loading'
                                            : bridgeStatus === 'notBalance'
                                            ? 'Not Enough Balance'
                                            : bridgeStatus === 'maxLimit'
                                            ? `Exceeds Max Limit`
                                            : bridgeStatus === 'minLimit'
                                            ? `Exceeds Min Limit`
                                            : 'Enter an amount'}
                                    </Text>
                                </ButtonError>
                            )}
                        </RowBetween>

                        {showApproveFlow && (
                            <Column style={{ marginTop: '1rem' }}>
                                <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                            </Column>
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
                                Maximum Crosschain Amount is {transferData.MaximumSwap ? transferData.MaximumSwap : 0}{' '}
                                {transferData.symbol}
                            </Text>
                            <Text fontSize={16} fontWeight={400}>
                                Estimated Time of Crosschain Arrival is 3-30 min
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
            <TYPE.black fontWeight={500} color={'#ffd545'} style={{ marginTop: '15px' }}>
                Powered by MultiChain
            </TYPE.black>
        </>
    )
}
