import styled from 'styled-components'
import ZapImg from '../../assets/images/bitcoin.png'
import QuestionHelper from '../../components/QuestionHelper'
import { darken } from 'polished'
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

export function Zap() {
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

    const SmallText = styled.div`
        font-size: 14px;
        margin-bottom: 20px;
    `
    const ZapTitle = styled.div`
        text-align: left;
        font-weight: 500;
        color: #333333
        margin: 0px;
    `
    const Arrowline = styled.div`
        font-weight: 500;
        color: #333333
        margin: 15px auto;
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
        background: ${({ selected, theme }) =>
            selected ? theme.bg1 : 'linear-gradient(177deg, #ED4962 0%, #F98F81 100%)'};
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
            background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
        }
    `

    const StyledTokenName = styled.span<{ active?: boolean }>`
        ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
        font-size:  ${({ active }) => (active ? '20px' : '16px')};

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

    const [input, setInput] = useState<string>('0.0')
    const [output, setOutput] = useState<string>('0.0')

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

    const estimateLp = useEstimateZapInTokenLpAmount(inputToken, pair)
    if (estimateLp) {
        console.log('estimateLp is ', estimateLp, ' estimateLp amount is ', tokenAmountForshow(estimateLp?.raw || 0))
    } else {
        console.log("can't zap because estimatLp is null")
    }

    const [approval, approveCallback] = useApproveCallback(inputToken || undefined, ZOO_ZAP_ADDRESS[DefaultChainId])

    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

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
            setInput('0.0')
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
        estimateLp && estimateLp?.raw && setOutput(String(tokenAmountForshow(estimateLp?.raw || 0)))
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
        <div className="s-zap-body">
            <div className="s-zap-img">
                <h2>ZAP</h2>
                <p>Convert single tokens to LP tokens directly.</p>
                <img style={{ width: '300px', height: '300px' }} src={ZapImg} />
            </div>
            <div className="s-zap-exchange">
                <ZapTitle>ZAP</ZapTitle>
                <div className="s-zap-input" style={{ marginTop: '20px' }}>
                    <Line style={{ marginBottom: '15px' }}>
                        <Text1>From Token</Text1>
                        <Text1>
                            {!!currency && selectedCurrencyBalance ? selectedCurrencyBalance?.toSignificant(6) : ' -'}
                        </Text1>
                    </Line>

                    <div className="s-zap-line">
                        <>
                            {
                                <NumericalInput
                                    className="zap-input"
                                    value={input}
                                    onUserInput={val => {
                                        setInput(val)
                                    }}
                                />
                            }
                            {account && currency && (
                                <StyledBalanceMax style={{ marginTop: 'auto', marginBottom: 'auto' }} onClick={onMax}>
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
                    </div>
                </div>
                <Arrowline>↓</Arrowline>
                <div className="s-zap-input" style={{ marginBottom: '40px' }}>
                    <Line style={{ marginBottom: '15px' }}>
                        <Text1>
                            To LP <QuestionHelper text="Estimated Number of LPT You Will Get" />
                        </Text1>
                        <Text1>{!!pool ? fixFloatFloor(JSBI.toNumber(pool.myLpBalance) / 1e18, 8) : '-'}</Text1>
                    </Line>
                    <Line>
                        <Text2>{output}</Text2>
                        <CurrencySelect
                            selected={!!pool}
                            onClick={() => {
                                SetShowSelectLp(true)
                            }}
                        >
                            <Aligner>
                                <StyledTokenName className="token-symbol-container" active={Boolean(pool)}>
                                    {pool ? pool.token0.symbol + '-' + pool.token1.symbol : 'Select a LP'}
                                </StyledTokenName>
                                <StyledDropDown selected={!!pool} />
                            </Aligner>
                        </CurrencySelect>
                    </Line>
                </div>

                {/*<ButtonPrimary disabled={true}>
                    <TYPE.main mb="4px">{t('invalidassets')}</TYPE.main>
                                </ButtonPrimary>*/}

                {!account ? (
                    <ButtonLight onClick={toggleWalletModal}>{t('connectwallet')}</ButtonLight>
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
                                    console.log('zap submit')
                                },
                                (error: Error) => {
                                    console.log('zap error' + error.message)
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
            </div>
        </div>
    )
}
