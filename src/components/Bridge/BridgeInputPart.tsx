import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { RowBetween } from 'components/Row'
import { useActiveWeb3React } from '../../hooks'
import { TYPE } from '../../theme'
import { Currency, Pair, ChainId, ETHER } from '@sushiswap/sdk'
import { darken } from 'polished'
import { Input as NumericalInput } from '../NumericalInput'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import CurrencyLogo from 'components/CurrencyLogo'
import { useTranslation } from 'react-i18next'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import ChainListModal from 'components/SearchModal/ChainListModal'
import { networkData } from '../../pages/Bridge/index'

interface bridgeInputProps {
    value: string
    onUserInput: (value: string) => void
    onMax?: () => void
    showMaxButton: boolean
    label?: string
    onCurrencySelect?: (currency: Currency) => void
    onChainSelect?: (chain: number) => void
    chain?: number | undefined
    currency?: Currency | null
    currencyList?: any
    disableCurrencySelect?: boolean
    disableChainSelect?: boolean
    disableInput?: boolean
    hideBalance?: boolean
    pair?: Pair | null
    hideInput?: boolean
    otherCurrency?: Currency | null
    id: string
    showCommonBases?: boolean
    customBalanceText?: string
    cornerRadiusBottomNone?: boolean
    cornerRadiusTopNone?: boolean
    containerBackground?: string
}

const LabelRow = styled.div`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
    color: ${({ theme }) => theme.text1};
    font-size: 0.75rem;
    line-height: 1rem;
    padding: 1.5rem 1.5rem 0;
    span:hover {
        cursor: pointer;
        color: ${({ theme }) => darken(0.2, theme.text2)};
    }
`

const InputRow = styled.div<{ selected: boolean }>`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
    padding: 1rem 1.5rem;
    display: flex;

    @media (max-width: 720px) {
        flex-direction: column;
        & > input {
            width: 100%;
        }
    }
`

const InputButtonContainer = styled.div`

    display: flex;
    align-items: flex-start;

    @media (max-width: 720px) {
        margin-top: 20px;
        width: 100%
        flex-direction: column;
        & > button {
            margin-bottom: 10px;
            & > span > span {
                font-size: 15px;
            }
        }
    }
`

const StyledBalanceMax = styled.button`
    height: 28px;
    padding-right: 8px;
    padding-left: 8px;
    background-color: ${({ theme }) => theme.primary5};
    border: 1px solid ${({ theme }) => theme.primary5};
    border-radius: ${({ theme }) => theme.borderRadius};
    font-size: 0.875rem;
    margin-top: 0.5rem;

    font-weight: 500;
    cursor: pointer;
    margin-right: 15px;
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

const CurrencySelect = styled.button<{ selected: boolean }>`
    align-items: center;
    min-height: 2.7rem;
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
    padding: 0.5rem;

    :focus,
    :hover {
        // background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
        background-color: ${({ selected, theme }) => (selected ? theme.bg2 : '#4de269')};
    }
`

const ChainSelect = styled(CurrencySelect)<{ selected: boolean }>``

const Aligner = styled.span`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
    margin: 0 0.25rem 0 0.5rem;
    height: 24px;

    path {
        stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
        stroke-width: 1.5px;
    }
`

const Container = styled.div<{
    hideInput: boolean
    cornerRadiusTopNone?: boolean
    cornerRadiusBottomNone?: boolean
    containerBackground?: string
}>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '12px')};
  border-radius: ${({ cornerRadiusTopNone }) => cornerRadiusTopNone && '0 0 12px 12px'};
  border-radius: ${({ cornerRadiusBottomNone }) => cornerRadiusBottomNone && '12px 12px 0 0'};
  /*border: 1px solid ${({ theme }) => theme.bg2};*/
  background-color: ${({ theme }) => theme.bg1};
  background-color: ${({ containerBackground }) => containerBackground};
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
    ${({ theme }) => theme.flexColumnNoWrap}
    position: relative;
    border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
    // background-color: ${({ theme }) => theme.bg2};
    background-color: rgba(16,14,28,0.85);
    z-index: 1;
`

const chainList = {
    1: 'Ethereum',
    56: 'BNB',
    42262: 'OASISETH'
}

export default function BridgeInputPart({
    value,
    onUserInput,
    onMax,
    showMaxButton,
    label = 'Input',
    onCurrencySelect,
    onChainSelect,
    currency,
    currencyList,
    chain,
    disableCurrencySelect = false,
    disableChainSelect = false,
    disableInput = false,
    hideBalance = false,
    pair = null, // used for double token logo
    hideInput = false,
    otherCurrency,
    id,
    showCommonBases,
    customBalanceText,
    cornerRadiusBottomNone,
    cornerRadiusTopNone,
    containerBackground
}: bridgeInputProps) {
    const { account, chainId } = useActiveWeb3React()
    const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
    const [modalOpen, setModalOpen] = useState(false)
    const [chainModalOpen, setChainModalOpen] = useState(false)
    const { t } = useTranslation()

    const handleDismissSearch = useCallback(() => {
        setModalOpen(false)
    }, [setModalOpen])

    return (
        <>
            <InputPanel>
                <Container
                    hideInput={hideInput}
                    cornerRadiusBottomNone={cornerRadiusBottomNone}
                    cornerRadiusTopNone={cornerRadiusTopNone}
                    containerBackground={containerBackground}
                >
                    <LabelRow>
                        <RowBetween>
                            <TYPE.body color={'#fff'} fontWeight={500} fontSize={16}>
                                {label}
                            </TYPE.body>
                            {account && (
                                <TYPE.body
                                    onClick={onMax}
                                    color={'#fff'}
                                    fontWeight={500}
                                    fontSize={16}
                                    style={{ display: 'inline', cursor: 'pointer' }}
                                >
                                    {!hideBalance && !!currency && selectedCurrencyBalance
                                        ? (customBalanceText ?? 'Balance: ') + selectedCurrencyBalance?.toSignificant(6)
                                        : ' -'}
                                </TYPE.body>
                            )}
                        </RowBetween>
                    </LabelRow>
                    <InputRow
                        style={hideInput ? { padding: '0', borderRadius: '8px' } : {}}
                        selected={disableCurrencySelect}
                    >
                        {!hideInput && (
                            <>
                                <NumericalInput
                                    fontSize="20px"
                                    className="token-amount-input"
                                    value={value}
                                    disabled={disableInput}
                                    onUserInput={(val: any) => {
                                        onUserInput(val)
                                    }}
                                />
                            </>
                        )}
                        <InputButtonContainer>
                            {account && currency && showMaxButton && label !== 'To' && (
                                <StyledBalanceMax onClick={onMax}>MAX</StyledBalanceMax>
                            )}
                            <CurrencySelect
                                selected={!!currency}
                                className="open-currency-select-button"
                                style={{ marginRight: '10px', width: '130px' }}
                                onClick={() => {
                                    if (!disableCurrencySelect) {
                                        setModalOpen(true)
                                    }
                                }}
                            >
                                <Aligner>
                                    {pair ? (
                                        <DoubleCurrencyLogo
                                            currency0={pair.token0}
                                            currency1={pair.token1}
                                            size={24}
                                            margin={true}
                                        />
                                    ) : currency ? (
                                        <CurrencyLogo
                                            currency={currency}
                                            chain={currency === ETHER ? 1 : 56}
                                            size={'24px'}
                                        />
                                    ) : null}
                                    {pair ? (
                                        <StyledTokenName className="pair-name-container">
                                            {pair?.token0.symbol}:{pair?.token1.symbol}
                                        </StyledTokenName>
                                    ) : (
                                        <StyledTokenName
                                            className="token-symbol-container"
                                            active={Boolean(currency && currency.symbol)}
                                            style={{ fontSize: '16px', textAlign: 'left' }}
                                        >
                                            {(currency && currency.symbol && currency.symbol.length > 20
                                                ? currency.symbol.slice(0, 4) +
                                                  '...' +
                                                  currency.symbol.slice(
                                                      currency.symbol.length - 5,
                                                      currency.symbol.length
                                                  )
                                                : currency?.getSymbol(chainId)) || t('selectToken')}
                                        </StyledTokenName>
                                    )}
                                    {!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
                                </Aligner>
                            </CurrencySelect>
                            <ChainSelect
                                selected={!!currency}
                                className="open-currency-select-button"
                                onClick={() => {
                                    if (!disableChainSelect) {
                                        setChainModalOpen(true)
                                    }
                                }}
                                style={{ width: '150px' }}
                            >
                                <Aligner>
                                    {chain !== undefined ? (
                                        <>
                                            <CurrencyLogo chain={chain} size={'24px'} />
                                            <StyledTokenName
                                                style={{ fontSize: '16px', textAlign: 'left' }}
                                                className="token-symbol-container"
                                                active={Boolean(chain)}
                                            >
                                                {networkData[chain].chainName}
                                            </StyledTokenName>
                                        </>
                                    ) : (
                                        t('selectChain')
                                    )}
                                    {!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
                                </Aligner>
                            </ChainSelect>
                        </InputButtonContainer>
                    </InputRow>
                </Container>

                {!disableCurrencySelect && onCurrencySelect && (
                    <CurrencySearchModal
                        isOpen={modalOpen}
                        onDismiss={handleDismissSearch}
                        onCurrencySelect={onCurrencySelect}
                        selectedCurrency={currency}
                        otherSelectedCurrency={otherCurrency}
                        showCommonBases={showCommonBases}
                        currencyList={currencyList}
                    />
                )}
                {!disableChainSelect && onChainSelect && (
                    <ChainListModal
                        isOpen={chainModalOpen}
                        onDismiss={() => {
                            setChainModalOpen(false)
                        }}
                        onChainSelect={onChainSelect}
                        selectedChain={chain}
                    />
                )}
            </InputPanel>
        </>
    )
}
