import React, { useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { BAR_ADDRESS, ChainId, SUSHI, ZERO } from '@sushiswap/sdk'

import { useTokenBalance } from '../../state/wallet/hooks'
import { tryParseAmount } from '../../functions/parse'

//import { WrapperNoPadding } from '../../components/swap/styleds'
//import { useDarkModeManager } from '../../state/user/hooks'
import AppBody from '../AppBody'
import SaaveHeader from './SushiBarHeader'
import { Wrapper } from '../../components/swap/styleds'
import { useBar } from '../../services/graph/hooks/bar'

import SushiDepositPanel from './SushiDepositPanel'
import XSushiWithdrawlPanel from './XSushiWithdrawlPanel'

import { CardSection, DataCard } from '../../components/earn/styled'
import { RowBetween } from '../../components/Row'
import { AutoColumn } from '../../components/Column'
import { TYPE, ExternalLink } from '../../theme'
import { transparentize } from 'polished'

import { useActiveWeb3React } from '../../hooks'
import { Text } from 'rebass'

import { aprToApy } from '../../functions/convert/apyApr'

import { useFactory, useNativePrice, useTokens } from '../../services/graph/hooks/exchange'
import { useOneDayBlock } from '../../services/graph/hooks/blocks'

import { XSUSHI } from '../../config/tokens/ethereum'
import { useTranslation } from 'react-i18next'

import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { formatFromBalance } from '../../utils'

const PageWrapper = styled(AutoColumn)`
    width: 100%;
    justify-content: center;
    max-width: 756px;
`

const FlexBox = styled.div`
    display: flex;
    padding-bottm: 10px;
`

const StakeHeader = styled(DataCard)`
    display: flex;
    align-items: center;
    margin-bottom: 0px;
    background: #000326;
    opacity: 1;
`
const StakeBody = styled.div`
    width: 66.66%;
`

const StakeInfoBody = styled.div`
    width: 33.33%;
    margin-left: 1rem;

    align-self: stretch;
`
const LogoBox = styled(DataCard)`
    background: transparent;
    overflow: hidden;
    margin-bottom: 10px;
    padding: 2rem;
    height: 100%;
    width: 40%;
    & > img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
`

const StatusBox = styled(LogoBox)`
    background: #000326;
    opacity: 1;
    width: 100%;
`

const BalanceBox = styled.div`
    display: flex;

    & > img {
        width: 60px;
        height: 60px;
        border-radius: 10px;
        object-fit: contain;
    }

    & > div {
        margin-left: 20px;
    }
`

const APRBox = styled.div`
    background-color: #35179a;
    border-radius: 10px;
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    & > div {
        display: flex;
        flex-direction: column;
        align-items: center;

        &:last-child {
            align-items: flex-end;
        }
    }
`

const StakeAppBody = styled.div`
    position: relative;
    width: 100%;
    // background: ${({ theme }) => transparentize(0.25, theme.bg1)};
    background: #000326;
    border-radius: 10px;
    padding: 1.5rem;
`

const ViewLink = styled.a`
    color: #000;
    font-size: 16px;
    background-color: #ffd166;
    padding: 5px 15px;
    border-radius: 8px;
    margin-top: 10px;
    display: block;
`

const SushiTab = styled.div`
    display: flex;
    width: 100%;
    background: #2f3353;
    border-radius: 5px;
    padding: 2px;
    margin-bottom: 1rem;
`

const Tab = styled.div<{ selected: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${({ selected }) => (selected ? '#000326' : 'none')};
    color: #fff;
    cursor: pointer;
    width: 50%;
    padding: 10px;
    border-radius: 3px;
`

const BalanceText = styled.p`
    text-align: right;
    font-size: 14px;
`

const SushiRate = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    align-items: center;

    & > div {
        line-height: 28px;
        border: 1px solid #b4ffc5;
        border-radius: 25px;
        background: #2bc14e;
        font-size: 14px;
        font-weight: 500;
        text-align: center;
        padding: 0 12px;
    }
`

export default function Saave() {
    const theme = useContext(ThemeContext)
    const { account, chainId } = useActiveWeb3React()

    const block1d = useOneDayBlock({ chainId: ChainId.MAINNET })
    const exchange = useFactory({ chainId: ChainId.MAINNET })
    const exchange1d = useFactory({
        chainId: ChainId.MAINNET,
        variables: {
            block: block1d
        },
        shouldFetch: !!block1d
    })

    const xSushi = useTokens({
        chainId: ChainId.MAINNET,
        variables: { where: { id: XSUSHI.address.toLowerCase() } }
    })?.[0]

    const ethPrice = useNativePrice({ chainId: ChainId.MAINNET })

    const bar = useBar()
    // const [xSushiPrice] = [xSushi?.derivedETH * ethPrice, xSushi?.derivedETH * ethPrice * bar?.totalSupply]
    const [xSushiPrice] = [0.3, 0.3 * bar?.totalSupply]
    console.log(bar?.totalSupply)
    // console.log(xSushi)
    const APY1d = aprToApy(
        (((exchange?.volumeUSD - exchange1d?.volumeUSD) * 0.0005 * 365.25) / (bar?.totalSupply * xSushiPrice)) * 100 ??
            0
    )

    const { t } = useTranslation()
    //const darkMode = useDarkModeManager()
    const sushiBalance = useTokenBalance(account ?? undefined, SUSHI[ChainId.MAINNET].BLING)
    const xSushiBalance = useTokenBalance(account ?? undefined, XSUSHI)
    const [activeTab, setActiveTab] = useState(0)
    const [input, setInput] = useState<string>('')

    const balance = activeTab === 0 ? sushiBalance : xSushiBalance

    const [usingBalance, setUsingBalance] = useState(false)

    const parsedAmount = usingBalance ? balance : tryParseAmount(input, balance?.currency)

    const [approvalState, approve] = useApproveCallback(parsedAmount, BAR_ADDRESS[ChainId.MAINNET])

    return (
        <>
            <PageWrapper>
                <AutoColumn gap="md">
                    <StakeHeader>
                        <LogoBox>
                            <img src="https://app.sushi.com/images/xsushi-sign.png" />
                        </LogoBox>
                        <CardSection>
                            <AutoColumn gap="md">
                                <RowBetween>
                                    <TYPE.white fontWeight={600} color={theme.text1}>
                                        SushiBar: Make SUSHI work for you
                                    </TYPE.white>
                                </RowBetween>
                                <RowBetween>
                                    <div>
                                        <TYPE.white fontSize={14} color={theme.text2} style={{ paddingBottom: '10px' }}>
                                            {`Stake your SUSHI into xSUSHI for ~5% APY. No impermanent loss, no loss of governance rights. Continuously compounding.`}
                                        </TYPE.white>
                                        <TYPE.white fontSize={14} color={theme.text2} style={{ paddingBottom: '10px' }}>
                                            {`xSUSHI automatically earn fees (0.05% of all swaps, including multichain swaps) proportional to your share of the SushiBar.`}
                                        </TYPE.white>
                                    </div>
                                </RowBetween>
                                <ExternalLink
                                    style={{ color: 'white', textDecoration: 'underline' }}
                                    target="_blank"
                                    href="https://analytics.sushi.com/bar"
                                >
                                    <TYPE.white fontSize={14} color={theme.text1}>
                                        View SushiBar Stats <span style={{ fontSize: '11px' }}>↗</span>
                                    </TYPE.white>
                                </ExternalLink>
                                {account && (
                                    <ExternalLink
                                        style={{ color: 'white', textDecoration: 'underline' }}
                                        target="_blank"
                                        href={'http://analytics.sushi.com/users/' + account}
                                    >
                                        <TYPE.white fontSize={14} color={theme.text1}>
                                            View your SushiBar Portfolio <span style={{ fontSize: '11px' }}>↗</span>
                                        </TYPE.white>
                                    </ExternalLink>
                                )}
                            </AutoColumn>
                        </CardSection>
                    </StakeHeader>
                    <FlexBox>
                        <StakeBody>
                            <APRBox>
                                <div>
                                    <Text color={'#fff'} fontSize={20}>
                                        Staking APR
                                    </Text>
                                    <ViewLink target="_blank" href="https://analytics.sushi.com/bar">
                                        View Stats
                                    </ViewLink>
                                </div>
                                <div>
                                    <Text color={'#fff'} fontSize={30}>
                                        {`${APY1d ? APY1d.toFixed(2) + '%' : t('Loading')}`}
                                    </Text>
                                    <Text color={'#fff'} fontSize={20} style={{ marginTop: '5px' }}>
                                        {"Yesterday's APR"}
                                    </Text>
                                </div>
                            </APRBox>
                            <StakeAppBody>
                                {/* <SaaveHeader /> */}
                                <SushiTab>
                                    <Tab
                                        onClick={() => {
                                            if (activeTab !== 0) setActiveTab(0)
                                        }}
                                        selected={activeTab === 0}
                                    >
                                        SUSHI
                                    </Tab>
                                    <Tab
                                        onClick={() => {
                                            if (activeTab !== 1) setActiveTab(1)
                                        }}
                                        selected={activeTab === 1}
                                    >
                                        xSUSHI
                                    </Tab>
                                </SushiTab>

                                <SushiRate>
                                    <p>{activeTab === 0 ? 'Stake SUSHI' : 'Unstake'}</p>
                                    <div>1 xSUSHI = {Number(bar?.ratio ?? 0)?.toFixed(4)} SUSHI</div>
                                </SushiRate>

                                <Wrapper style={{ padding: '0px' }} id="swap-page">
                                    <AutoColumn style={{ paddingBottom: '10px' }}>
                                        {activeTab === 0 && (
                                            <SushiDepositPanel
                                                label={''}
                                                disableCurrencySelect={true}
                                                customBalanceText={'Available to deposit: '}
                                                id="stake-liquidity-token"
                                                buttonText="Deposit"
                                                cornerRadiusBottomNone={true}
                                            />
                                        )}
                                        {activeTab === 1 && (
                                            <XSushiWithdrawlPanel
                                                label={''}
                                                disableCurrencySelect={true}
                                                customBalanceText={'Available to withdraw: '}
                                                id="withdraw-liquidity-token"
                                                buttonText="Withdraw"
                                                cornerRadiusBottomNone={true}
                                            />
                                        )}
                                    </AutoColumn>
                                </Wrapper>

                                {/* <BalanceText>
                                    {activeTab === 0
                                        ? 'xSUSHI Balance: ' + xSushiBalance?.toFixed(8)
                                        : 'SUSHI Balance: ' + sushiBalance?.toFixed(8)}
                                </BalanceText> */}
                            </StakeAppBody>
                        </StakeBody>
                        <StakeInfoBody>
                            <StatusBox>
                                <AutoColumn gap="md">
                                    <div>
                                        <Text color={'#fff'} fontSize={18} style={{ marginBottom: '15px' }}>
                                            Balance
                                        </Text>
                                        <BalanceBox>
                                            <img src="https://app.sushi.com/images/tokens/xsushi-square.jpg" />
                                            <div>
                                                <Text color={'#fff'} fontSize={18}>
                                                    {account ? xSushiBalance?.toFixed(8) : '-'}
                                                </Text>
                                                <Text color={'#fff'} fontSize={18}>
                                                    xSushi
                                                </Text>
                                            </div>
                                        </BalanceBox>
                                    </div>
                                    <div>
                                        <Text color={'#fff'} fontSize={18} style={{ marginBottom: '15px' }}>
                                            UnStaked
                                        </Text>

                                        <BalanceBox>
                                            <img src="https://app.sushi.com/images/tokens/sushi-square.jpg" />
                                            <div>
                                                <Text color={'#fff'} fontSize={18}>
                                                    {account ? sushiBalance?.toFixed(8) : '-'}
                                                </Text>
                                                <Text color={'#fff'} fontSize={18}>
                                                    Sushi
                                                </Text>
                                            </div>
                                        </BalanceBox>
                                    </div>
                                </AutoColumn>
                            </StatusBox>
                        </StakeInfoBody>
                    </FlexBox>
                </AutoColumn>
            </PageWrapper>
        </>
    )
}
