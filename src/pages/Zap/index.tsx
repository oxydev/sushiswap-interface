import styled from 'styled-components'
import ZapImg from '../../assets/images/zapp.png'
import QuestionHelper from '../../components/QuestionHelper'
import { darken, margin } from 'polished'
import React, { useCallback, useContext, useRef, useEffect, useMemo, useState } from 'react'
import { CurrencyAmount, JSBI, Token, TokenAmount, ZOO_ZAP_ADDRESS, Currency, StakePool } from '@sushiswap/sdk'
import { useTranslation } from 'react-i18next'
import { ButtonError, ButtonLight, ButtonPrimary, ButtonConfirmed } from '../../components/Button'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { useActiveWeb3React } from '../../hooks'
import CurrencyListModal from '../../components/SearchModal/CurrencySearchModal'
import CurrencyLogo from '../../components/CurrencyLogo'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { fixFloatFloor } from 'utils/fixFloat'
import { useEstimateZapInTokenLpAmount, useZapInTokenLpAmount } from 'sushi-hooks/useZooZap'
import { usePair } from 'data/Reserves'
import { tokenAmountForshow } from 'utils/BlingSwap'
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback'
import { DefaultChainId } from '../../constants/index'
import { Input as NumericalInput } from '../../components/NumericalInput'
import { useCurrencyBalances } from '../../state/wallet/hooks'
import Decimal from 'decimal.js'
import { AutoRow, RowBetween } from '../../components/Row'
import Loader from '../../components/Loader'
import LpTokenListModal from '../../components/SearchModal/LpTokenListModal'
import { transparentize } from 'polished'
import { TYPE } from 'theme'
import { DoubleLogo } from '../Yield/components'
import { LPMenuItem } from '../../components/SearchModal/styleds'

type tLimitObject = {
    [key: string]: string
}
const limitObject: tLimitObject = {
    BNB: '13',
    ETH: '22000',
    BUSD: '5000',
    DAI: '0',
    weUSDT: '5000',
    DUNE: '0',
    'ETH(MC)': '0',
    LINK: '70',
    OAPE: '0',
    PETAL: '0',
    TULIP: '0',
    USDC: '5000',
    WBTC: '0',
    wETH: '2',
    wROSE: '22000',
    YUZU: '10'
}

export default function Zap(): JSX.Element {
    const ZapPage = styled.div`
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        @media (max-width: 720px) {
            flex-direction: column;
        }
    `

    const ZapImage = styled.div`
        width: 420px;
        height: 420px;
        margin-left: 3rem;
        display: flex;
        @media (max-width: 720px) {
            display: none;
        }
    `

    const ZapImageMobile = styled(ZapImage)`
        width: 30vw;
        height: 30vw;
        margin: 10px auto;
        display: none;
        text-align: center;
        @media (max-width: 720px) {
            display: block;
        }
    `

    const BodyWrapper = styled.div`
    padding: 1rem;
    padding-bottom: 3rem;
    position: relative;
    max-width: 420px;
    width: 100%;
    // background: ${({ theme }) => transparentize(0.25, theme.bg1)};
    background: rgba(61,63,90,0.76);
    box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.33), 0px 4px 8px rgba(0, 0, 0, 0.33), 0px 16px 24px rgba(0, 0, 0, 0.33),
        0px 24px 32px rgba(0, 0, 0, 0.33);
    border-radius: 0 20px 0 40px;
    border: 1px solid #75818f;
    
    `

    const StyledZapHeader = styled.div`
        padding: 12px 1rem 0px 1.5rem;
        margin-bottom: -4px;
        width: 100%;
        max-width: 420px;
        color: ${({ theme }) => theme.text2};
    `

    const StyledBalanceMax = styled.button`
        height: 28px;
        padding-right: 8px;
        padding-left: 8px;
        background-color: ${({ theme }) => theme.primary5};
        border: 1px solid ${({ theme }) => theme.primary5};
        font-size: 0.8rem;

        width: 44px;
        height: 24px;
        background: ${({ theme }) => theme.bg1};
        border-radius: 4px;
        border: 1px solid #ed4962;

        font-weight: 500;
        cursor: pointer;
        margin-right: 0.5rem;
        color: ${({ theme }) => theme.primaryText1};
        :hover {
            border: 1px solid ${({ theme }) => theme.primary1};
        }
        :focus {
            border: 1px solid ${({ theme }) => theme.primary1};
            outline: none;
        }

        ${({ theme }) => theme.mediaWidth.upToExtraSmall`
            margin-right: 0.5rem;
        `};
    `

    const InputPanel = styled.div<{ hideInput?: boolean }>`
        ${({ theme }) => theme.flexColumnNoWrap}
        position: relative;
        border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
        // background-color: ${({ theme }) => theme.bg2};
        z-index: 1;
    `

    const ZapTopInput = styled.div`
        padding: 20px;
        border-radius: 12px 12px 0 0;
        background-color: ${({ theme }) => theme.bg1};
        margin-bottom: 10px;
        margin-top: 20px;
    `

    const ZapBottomInput = styled.div`
        padding: 20px;
        border-radius: 0 0 12px 12px;
        background-color: ${({ theme }) => theme.bg1};
        margin-bottom: 20px;
    `

    const ZapInputLine = styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
    `

    const ArrowContainer = styled.div`
        position: relative;
    `
    const Arrowline = styled.div`
        position: absolute;
        right: 0;
        left: 0;
        margin: auto;
        font-weight: 500;
        color: #fff;
        text-align: center;
        margin-top: -20px;
    `
    const Line = styled.div`
        display: flex;
        justify-content: space-between;
    `

    const Text1 = styled.div`
        font-size: 14px;
        font-weight: 500;
        color: #666666;
        line-height: 20px;
    `

    const Text2 = styled.div`
        font-size: 24px;
        font-weight: bold;
        font-family: DINPro-Bold, DINPro;
        color: ${({ theme }) => theme.text1};
        line-height: 31px;
        text-overflow: ellipsis;
        flex: 1 1 auto;
        text-align: left;
        display: inline-block;
        width: 0;
        overflow: hidden;
    `
    const Aligner = styled.span`
        display: flex;
        align-items: center;
        justify-content: space-between;
    `

    const CurrencySelect = styled.button<{ selected: boolean }>`
    align-items: center;
    height: 2.2rem;
    font-size: 20px;
    font-weight: 500;
    background-color: ${({ selected, theme }) => (selected ? theme.bg1 : '#3da555')};
    color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    border-radius: ${({ theme }) => theme.borderRadius};
    box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
    outline: none;
    cursor: pointer;
    user-select: none;
    border: none;
    padding: 0 0.5rem;

    :focus,
    :hover {
        // background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
        background-color: ${({ selected, theme }) => (selected ? theme.bg2 : '#4de269')};
    }
    `

    const StyledTokenName = styled.span<{ active?: boolean }>`
        ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
        font-size:  ${({ active }) => (active ? '20px' : '16px')};
        display: flex;
        align-items: center;
        & > div {
            margin-right: 25px;
        }

    `

    const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
        margin: 0 0.25rem 0 0.5rem;
        height: 35%;

        path {
            stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
            stroke-width: 1.5px;
        }
    `
    const toggleWalletModal = useWalletModalToggle()
    const { account, chainId } = useActiveWeb3React()

    const [currency, setCurrency] = useState<Currency | undefined>()

    const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [currency ?? undefined])

    const [input, setInput] = useState<string>('')
    const [output, setOutput] = useState<string>('0.0')

    useEffect(() => {
        console.log(input, currency)
        if (currency?.symbol && parseFloat(input) > parseFloat(limitObject[currency?.symbol])) {
            setInput(limitObject[currency?.symbol])
        }
    }, [input])

    const onMax = useCallback(() => {
        setInput(relevantTokenBalances[0]?.toExact() ?? '0.0')
    }, [currency])

    const [test, SetTest] = useState<string>('0.0')

    const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
    const [showSelectCurreny, SetShowSelectCurreny] = useState(false)

    const [showSelectLp, SetShowSelectLp] = useState(false)
    const [pool, SetPool] = useState<StakePool | undefined>()

    //fake amount, should be changed by input
    const tokenAmount = '1000000000000000000'
    const [_, pair] = usePair(pool?.token0, pool?.token1)
    const inputToken = useMemo(() => {
        const bigintAmount = new Decimal(
            parseFloat(input == '' ? '0' : input) * Math.pow(10, currency?.decimals || 18)
        ).toFixed(0)
        return currency instanceof Token
            ? new TokenAmount(currency, bigintAmount)
            : currency
            ? new CurrencyAmount(currency, bigintAmount)
            : null
    }, [currency, input])

    // console.log(Number(input))
    const estimateLp = useEstimateZapInTokenLpAmount(inputToken, pair)
    // if (estimateLp) {
    //     console.log('estimateLp is ', estimateLp, ' estimateLp amount is ', tokenAmountForshow(estimateLp?.raw || 0))
    // } else {
    //     console.log("can't zap because estimatLp is null")
    // }

    const [approval, approveCallback] = useApproveCallback(inputToken || undefined, ZOO_ZAP_ADDRESS[DefaultChainId])
    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
    const switchNetwork = () => {
        if (window.ethereum) {
            try {
                const data = [
                    {
                        chainId: '0xa516',
                        chainName: 'Oasis Emerald',
                        nativeCurrency: {
                            symbol: 'ROSE',
                            decimals: 18
                        },
                        rpcUrls: ['https://emerald.oasis.dev/'],
                        blockExplorerUrls: ['https://explorer.emerald.oasis.dev/']
                    }
                ]

                try {
                    window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: data
                    })
                    window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xa516' }]
                    })
                } catch (addError) {
                    // handle "add" error
                }
            } catch (e) {}
        }
    }
    useEffect(() => {
        switchNetwork()
    }, [])

    // mark when a user has submitted an approval, reset onTokenSelection for input field
    useEffect(() => {
        if (approval === ApprovalState.PENDING) {
            setApprovalSubmitted(true)
        }
    }, [approval, approvalSubmitted])

    const handleInputSelect = useCallback(
        inputCurrency => {
            setApprovalSubmitted(false) // reset 2 step UI for approvals
            setCurrency(inputCurrency)
            setOutput('0.0')
            setInput('')
        },
        [setCurrency]
    )

    const handleOutputSelect = useCallback(
        pool => {
            SetPool(pool)
            setOutput('0.0')
        },
        [setOutput, SetPool]
    )

    const inputCheck = useMemo(() => {
        return parseFloat(input) > parseFloat(relevantTokenBalances[0]?.toExact() || '0') ? false : true
    }, [input])

    const lastAp = useRef(approval)

    useEffect(() => {
        if (lastAp.current == ApprovalState.PENDING && approval == ApprovalState.APPROVED) {
            console.log('approve ok')
        }
        if (approval == ApprovalState.PENDING || approval == ApprovalState.APPROVED) {
            lastAp.current = approval
        }
    }, [approval])
    useEffect(() => {
        // console.log(tokenAmountForshow(estimateLp?.raw || 0).toFixed(18))
        estimateLp && estimateLp?.raw && setOutput(tokenAmountForshow(estimateLp?.raw || 0).toFixed(18))
    }, [estimateLp])
    const doZap = useZapInTokenLpAmount(inputToken, pair)
    const doZapWrapper = useCallback(
        async (onSuccess: any, onFailed: any): Promise<void> => {
            if (approval == ApprovalState.NOT_APPROVED) {
                approveCallback().then(res => {
                    doZap(onSuccess, onFailed)
                })
            } else if (approval == ApprovalState.APPROVED) {
                await doZap(onSuccess, onFailed)
            }
        },
        [approval, inputToken, pair]
    )

    const { t } = useTranslation()
    return (
        <ZapPage>
            <BodyWrapper>
                <StyledZapHeader>
                    <TYPE.black fontWeight={500} color={'#ffd545'}>
                        ZAP
                    </TYPE.black>
                    <TYPE.black fontWeight={400}>
                        Convert single tokens to LP tokens directly.{' '}
                        <QuestionHelper text=" WARNING: Zap can cause slippage. Please do not Zap large amounts. All slippages will be used to buy Back $BLING" />
                    </TYPE.black>
                </StyledZapHeader>
                <ZapImageMobile>
                    <img
                        style={{ width: '100%', height: '100%', objectFit: 'contain', margin: 'auto' }}
                        src={ZapImg}
                        alt="ZapLogo"
                    />
                </ZapImageMobile>

                <InputPanel>
                    <ZapTopInput>
                        <Line style={{ marginBottom: '15px' }}>
                            <TYPE.black fontWeight={500} color={'#fff'} fontSize={14}>
                                From
                            </TYPE.black>
                            <TYPE.black fontWeight={500} color={'#fff'} fontSize={14}>
                                {!!currency && selectedCurrencyBalance
                                    ? selectedCurrencyBalance?.toSignificant(6)
                                    : ' -'}
                            </TYPE.black>
                        </Line>
                        <ZapInputLine>
                            <>
                                {
                                    <NumericalInput
                                        className="zap-input"
                                        value={input}
                                        autoFocus
                                        onUserInput={val => {
                                            setInput(val)
                                        }}
                                    />
                                }
                                {account && currency && (
                                    <StyledBalanceMax
                                        style={{ marginTop: 'auto', marginBottom: 'auto' }}
                                        onClick={onMax}
                                    >
                                        Max
                                    </StyledBalanceMax>
                                )}
                            </>
                            <CurrencySelect
                                selected={!!currency}
                                onClick={() => {
                                    SetShowSelectCurreny(true)
                                }}
                            >
                                <Aligner>
                                    {currency ? <CurrencyLogo currency={currency} size={'24px'} /> : null}

                                    <StyledTokenName
                                        className="token-symbol-container"
                                        active={Boolean(currency && currency.symbol)}
                                    >
                                        {(currency && currency.symbol && currency.symbol.length > 20
                                            ? currency.symbol.slice(0, 4) +
                                              '...' +
                                              currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                                            : currency?.getSymbol(chainId)) ||
                                            t('selectToken') ||
                                            t('selectToken')}
                                    </StyledTokenName>
                                    <StyledDropDown selected={!!currency} />
                                </Aligner>
                            </CurrencySelect>
                        </ZapInputLine>
                    </ZapTopInput>

                    <ZapBottomInput>
                        <Line style={{ marginBottom: '15px' }}>
                            <TYPE.black fontWeight={500} color={'#fff'} fontSize={14}>
                                To LP <QuestionHelper text="Estimated Number of GLP You Will Recieve" />
                            </TYPE.black>
                            <TYPE.black fontWeight={500} color={'#fff'} fontSize={14}>
                                {!!pool
                                    ? JSBI.toNumber(pool.myLpBalance) / 1e18 === 0
                                        ? '0.000'
                                        : fixFloatFloor(JSBI.toNumber(pool.myLpBalance) / 1e18, 18)
                                    : '-'}
                            </TYPE.black>
                        </Line>
                        <Line>
                            <NumericalInput
                                className="zap-input"
                                value={output}
                                disabled={true}
                                onUserInput={val => {
                                    // console.log(val)
                                }}
                            />
                            <CurrencySelect
                                selected={!!pool}
                                onClick={() => {
                                    SetShowSelectLp(true)
                                }}
                            >
                                <Aligner>
                                    <StyledTokenName className="token-symbol-container" active={Boolean(pool)}>
                                        {pool ? (
                                            <DoubleLogo
                                                a0={pool.token0.address}
                                                a1={pool.token1.address}
                                                size={20}
                                                margin={true}
                                            />
                                        ) : null}
                                        {pool ? pool.token0.symbol + '-' + pool.token1.symbol : 'Select a LP'}
                                    </StyledTokenName>
                                    <StyledDropDown selected={!!pool} />
                                </Aligner>
                            </CurrencySelect>
                        </Line>
                    </ZapBottomInput>

                    {/*<ButtonPrimary disabled={true}>
                    <TYPE.main mb="4px">{t('invalidassets')}</TYPE.main>
                                </ButtonPrimary>*/}

                    {!account ? (
                        <ButtonLight onClick={toggleWalletModal}>{t('Connect to a Wallet')}</ButtonLight>
                    ) : !currency || !pool ? (
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        <ButtonPrimary disabled={true} onClick={() => {}}>
                            Select Token
                        </ButtonPrimary>
                    ) : approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.PENDING ? (
                        <ButtonConfirmed
                            onClick={approveCallback}
                            disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                            altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                        >
                            {approval === ApprovalState.PENDING ? (
                                <AutoRow gap="6px" justify="center">
                                    Approving <Loader stroke="white" />
                                </AutoRow>
                            ) : (
                                'Approve ' + currency.symbol
                            )}
                        </ButtonConfirmed>
                    ) : estimateLp ? (
                        <ButtonPrimary
                            disabled={!inputCheck}
                            onClick={() =>
                                doZapWrapper(
                                    () => {
                                        // console.log('zap submit')
                                    },
                                    (error: Error) => {
                                        // console.log('zap error' + error.message)
                                    }
                                )
                            }
                        >
                            ZAP
                        </ButtonPrimary>
                    ) : (
                        <ButtonPrimary disabled={true}>Route Not Available</ButtonPrimary>
                    )}
                    <CurrencyListModal
                        isOpen={showSelectCurreny}
                        onDismiss={() => {
                            SetShowSelectCurreny(false)
                        }}
                        onCurrencySelect={handleInputSelect}
                        selectedCurrency={currency}
                        otherSelectedCurrency={null}
                    />

                    <LpTokenListModal
                        isOpen={showSelectLp}
                        onDismiss={() => {
                            SetShowSelectLp(false)
                        }}
                        onPoolSelect={handleOutputSelect}
                        selectedPool={pool}
                    />
                </InputPanel>
            </BodyWrapper>
            <ZapImage>
                <img
                    style={{ width: '100%', height: '100%', objectFit: 'contain', margin: 'auto' }}
                    src={ZapImg}
                    alt="ZapLogo"
                />
            </ZapImage>
        </ZapPage>
    )
}
