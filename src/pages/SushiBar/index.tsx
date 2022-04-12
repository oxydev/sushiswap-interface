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

import Bling from '../../assets/images/main_logo.png'
import XBling from '../../assets/images/xBling.png'
import MainBling from '../../assets/images/mainStakeLogo.png'

const CardBG = '#000'
const yellowBG = '#daab62'
const greenBG = '#3CCA5D'

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
    background: ${CardBG};
    opacity: 1;
    padding: 16px;
`

const PortfolioButton = styled.button`
    font-size: 14px;
    font-weight: 500;
    padding: 8px 20px;
    background: transparent;
    border: 1px solid #fff;
    border-radius: 6px;
`

const StakeAPR = styled(StakeHeader)`
    background: linear-gradient(88.16deg, #3cca5d 9.82%, #2655c2 30.96%, #9f67f3 85.3%);
    border-radius: 10px;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    & > div {
        display: flex;
        align-items: center;

        &:last-child {
            align-items: flex-start;
        }

        p {
            font-size: 14px;
            font-weight: 700;
            color: #fff;
            margin: 0;
        }
        h2 {
            font-size: 36px;
            color: #fff;
            margin: 0 0 0 12px;
            line-height: 36px;
        }
    }
`

const StatsButton = styled(PortfolioButton)`
    background: ${yellowBG};
    color: #000;
    border: none;
    font-size: 14px;
    font-weight: 600;
    margin-left: 19px;
`

const StakeBalance = styled(DataCard)`
    background: ${CardBG};
    width: 100%;
    padding: 1rem 1.5rem;
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
        object-position: top;
    }
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

const StakeAppBody = styled.div`
    position: relative;
    width: 66.66%;
    // background: ${({ theme }) => transparentize(0.25, theme.bg1)};
    background: ${CardBG};
    border-radius: 10px;
    padding: 1.5rem 0.75rem;
    margin-right: 10px;
`

const SushiTab = styled.div`
    display: flex;
    width: 100%;
    background: #262626;
    border-radius: 5px;
    padding: 2px;
    margin-bottom: 1.5rem;
`

const Tab = styled.div<{ selected: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${({ selected }) => (selected ? '#000' : 'none')};
    color: #fff;
    cursor: pointer;
    width: 50%;
    padding: 10px;
    border-radius: 3px;
`

const SushiRate = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    align-items: center;
    padding-left: 0.75rem;

    & > div {
        line-height: 28px;
        border-radius: 25px;
        background: ${greenBG};
        font-size: 14px;
        font-weight: 700;
        text-align: center;
        padding: 5px 12px;
        color: #000;
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
                            <img src={MainBling} alt="bling token" />
                        </LogoBox>
                        <CardSection>
                            <AutoColumn gap="md">
                                <RowBetween>
                                    <TYPE.white fontSize={20} fontWeight={600} color={theme.text1}>
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

                                {account && (
                                    <ExternalLink
                                        style={{ color: 'white' }}
                                        target="_blank"
                                        href={'http://analytics.sushi.com/users/' + account}
                                    >
                                        <PortfolioButton>View Portfolio</PortfolioButton>
                                    </ExternalLink>
                                )}
                            </AutoColumn>
                        </CardSection>
                    </StakeHeader>
                    <StakeAPR>
                        <div>
                            <Text color={'#fff'} fontSize={18} fontWeight={700}>
                                Staking APR
                            </Text>
                            <ExternalLink
                                style={{ color: 'white' }}
                                target="_blank"
                                href="https://analytics.sushi.com/bar"
                            >
                                <StatsButton>View Stats</StatsButton>
                            </ExternalLink>
                        </div>
                        <div>
                            <p>Yesterday&apos;s APR</p>
                            <h2>{`${APY1d ? APY1d.toFixed(2) + '%' : t('Loading')}`}</h2>
                        </div>
                    </StakeAPR>
                    <FlexBox>
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
                                <AutoColumn>
                                    {activeTab === 0 && (
                                        <SushiDepositPanel
                                            label={''}
                                            disableCurrencySelect={true}
                                            customBalanceText={'Available to deposit: '}
                                            id="stake-liquidity-token"
                                            buttonText="Deposit"
                                        />
                                    )}
                                    {activeTab === 1 && (
                                        <XSushiWithdrawlPanel
                                            label={''}
                                            disableCurrencySelect={true}
                                            customBalanceText={'Available to withdraw: '}
                                            id="withdraw-liquidity-token"
                                            buttonText="Withdraw"
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
                        <AutoColumn gap="md" style={{ width: '33.33%' }}>
                            <StakeBalance>
                                <Text color={'#fff'} fontSize={18} style={{ marginBottom: '15px' }}>
                                    Balance
                                </Text>
                                <BalanceBox>
                                    <img src={XBling} alt="xBling" />
                                    <div>
                                        <Text color={'#fff'} fontSize={18}>
                                            {account
                                                ? xSushiBalance && parseInt(xSushiBalance?.toFixed(8)) !== 0
                                                    ? xSushiBalance?.toFixed(8)
                                                    : '0.0'
                                                : '-'}
                                        </Text>
                                        <Text color={'#fff'} fontSize={18}>
                                            xSushi
                                        </Text>
                                    </div>
                                </BalanceBox>
                            </StakeBalance>
                            <StakeBalance>
                                <Text color={'#fff'} fontSize={18} style={{ marginBottom: '15px' }}>
                                    UnStaked
                                </Text>

                                <BalanceBox>
                                    <img src={Bling} alt="Bling" />
                                    <div>
                                        <Text color={'#fff'} fontSize={18}>
                                            {account
                                                ? sushiBalance && parseInt(sushiBalance?.toFixed(8)) !== 0
                                                    ? sushiBalance?.toFixed(8)
                                                    : '0.0'
                                                : '-'}
                                        </Text>
                                        <Text color={'#fff'} fontSize={18}>
                                            Sushi
                                        </Text>
                                    </div>
                                </BalanceBox>
                            </StakeBalance>
                        </AutoColumn>
                    </FlexBox>
                </AutoColumn>
            </PageWrapper>
        </>
    )
}
