import React, { useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { BAR_ADDRESS, ChainId, SUSHI, ZERO } from '@sushiswap/sdk'

import useTokenBalance from 'sushi-hooks/useTokenBalance'
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
import MainBling from '../../assets/images/xBling.png'
import XBling from '../../assets/images/mainStakeLogo.png'

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
    transition: background 0.3s ease-in;
    &:hover {
        background: linear-gradient(94.57deg, rgba(62, 142, 215, 0.5) 51.36%, #b276d9 94.83%);
        mix-blend-mode: multiply;
    }

    ${({ theme }) => theme.mediaWidth.upToSmall`
            flex-direction: column;
        `};
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

    transition: 0.3s ease-in;
    &:hover {
        background: #000;
    }

    ${({ theme }) => theme.mediaWidth.upToSmall`
            flex-direction: row;

            & > div {
                width: 100%;
                flex-direction: column;
                align-items: center;
                text-align: center;

                &:last-child {
                    align-items: center;
                }
                h2 {
                    margin: 10px 0 0;
                }

                button {
                    margin: 10px 0 0;
                }

        `};
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
    transition: 0.3s ease-in;
    &:hover {
        background: linear-gradient(150.02deg, #39a894 -32.47%, #daab62 91.61%);
        mix-blend-mode: multiply;
    }
    &:last-child {
        &:hover {
            background: linear-gradient(352.44deg, #39a894 -51.92%, #b276d9 109.77%);
        }
    }
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

const StakeBalancePart = styled.div`
    width: 33.33%;
    align-self: stretch;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 100%;
        margin-top: 10px;
        text-align: center;
`};
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

    ${({ theme }) => theme.mediaWidth.upToSmall`
        justify-content: center;
        text-align: left;;
`};
`
const StakeBoddy = styled.div`
    display: flex;
    padding-bottm: 10px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
            flex-direction: column;
        `};
`
const StakeAppBody = styled.div`
    position: relative;
    width: 66.66%;
    // background: ${({ theme }) => transparentize(0.25, theme.bg1)};
    background: ${CardBG};
    border-radius: 10px;
    padding: 1.5rem 0.75rem;
    margin-right: 10px;

    ${({ theme }) => theme.mediaWidth.upToSmall`
            width: 100%;
        `};
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

    const bar = useBar()
    // const [xSushiPrice] = [xSushi?.derivedETH * ethPrice, xSushi?.derivedETH * ethPrice * bar?.totalSupply]
    const [xSushiPrice] = [0.3, 0.3 * bar?.totalSupply]
    // console.log(bar?.totalSupply, xSushiPrice)
    // console.log(exchange?.volumeUSD - exchange1d?.volumeUSD)
    const APY1d = aprToApy(
        (((exchange?.volumeUSD - exchange1d?.volumeUSD) * 0.0005 * 365.25) / (bar?.totalSupply * xSushiPrice)) * 100 ??
            0
    )

    const { t } = useTranslation()
    //const darkMode = useDarkModeManager()
    const sushiBalanceBigInt = useTokenBalance('0x72Ad551af3c884d02e864B182aD9A34EE414C36C')

    const sushiBalanceFormat = formatFromBalance(sushiBalanceBigInt?.value, sushiBalanceBigInt?.decimals)

    const xSushiBalance = useTokenBalance(XSUSHI.address)
    const xSushiBalanceFormat = formatFromBalance(xSushiBalance?.value, xSushiBalance?.decimals)

    const [activeTab, setActiveTab] = useState(0)
    const [input, setInput] = useState<string>('')

    const balance = activeTab === 0 ? sushiBalanceFormat : xSushiBalanceFormat

    const [usingBalance, setUsingBalance] = useState(false)

    const parsedAmount = balance


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
                                        GemKeeper Spell: Maximize yield by staking BLING for xBLING
                                    </TYPE.white>
                                </RowBetween>
                                <RowBetween>
                                    <div>
                                        <TYPE.white fontSize={14} color={theme.text2} style={{ paddingBottom: '10px' }}>
                                            {`For every swap on the exchange, 0.05% of the swap fees are distributed as BLING proportional to your share of the GemKeeper Spell. When your BLING is staked into the GemKeeper Spell, you receive xBLING in return for voting rights and a fully composable token that can interact with other protocols. `}
                                        </TYPE.white>
                                        <TYPE.white fontSize={14} color={theme.text2} style={{ paddingBottom: '10px' }}>
                                            {`Your xBLING is continuously compounding, when you unstake you will receive all the originally deposited BLING and any additional from fees. Happy casting spells!`}
                                        </TYPE.white>
                                    </div>
                                </RowBetween>

                                {/*{account && (*/}
                                {/*    <ExternalLink*/}
                                {/*        style={{ color: 'white' }}*/}
                                {/*        target="_blank"*/}
                                {/*        href={'http://analytics.sushi.com/users/' + account}*/}
                                {/*    >*/}
                                {/*        <PortfolioButton>View Portfolio</PortfolioButton>*/}
                                {/*    </ExternalLink>*/}
                                {/*)}*/}
                            </AutoColumn>
                        </CardSection>
                    </StakeHeader>
                    <StakeAPR>
                        <div>
                            <Text color={'#fff'} fontSize={18} fontWeight={700}>
                                Staking APR
                            </Text>
                            <ExternalLink
                                disabled={true}
                                style={{ color: 'white' }}
                                // target="_blank"
                                href="#"
                            >
                                <StatsButton>View Stats</StatsButton>
                            </ExternalLink>
                        </div>
                        <div>
                            <p>Yesterday&apos;s APR</p>
                            {/*<h2>Coming soon!</h2>*/}
                            <h2>{`${APY1d ? APY1d.toFixed(2) + '%' : t('Loading')}`}</h2>
                        </div>
                    </StakeAPR>
                    <StakeBoddy>
                        <StakeAppBody>
                            {/* <SaaveHeader /> */}
                            <SushiTab>
                                <Tab
                                    onClick={() => {
                                        if (activeTab !== 0) setActiveTab(0)
                                    }}
                                    selected={activeTab === 0}
                                >
                                    BLING
                                </Tab>
                                <Tab
                                    onClick={() => {
                                        if (activeTab !== 1) setActiveTab(1)
                                    }}
                                    selected={activeTab === 1}
                                >
                                    xBLING
                                </Tab>
                            </SushiTab>

                            <SushiRate>
                                <p>{activeTab === 0 ? 'Stake BLING' : 'Unstake'}</p>
                                <div>1 xBLING = {Number(bar?.ratio ?? 0)?.toFixed(4)} BLING</div>
                                {/*<div>1 xBLING = {Number(1)?.toFixed(4)} BLING</div>*/}
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
                        <StakeBalancePart>
                            <AutoColumn gap="md" style={{ height: '100%' }}>
                                <StakeBalance>
                                    <Text color={'#fff'} fontSize={18} style={{ marginBottom: '15px' }}>
                                        Balance
                                    </Text>
                                    <BalanceBox>
                                        <img src={XBling} alt="xBling" />
                                        <div>
                                            <Text color={'#fff'} fontSize={18}>
                                                {account
                                                    ? xSushiBalanceFormat
                                                    : '-'}
                                            </Text>
                                            <Text color={'#fff'} fontSize={18}>
                                                xBLING
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
                                                    ? sushiBalanceFormat
                                                    : '-'}
                                            </Text>
                                            <Text color={'#fff'} fontSize={18}>
                                                BLING
                                            </Text>
                                        </div>
                                    </BalanceBox>
                                </StakeBalance>
                            </AutoColumn>
                        </StakeBalancePart>
                    </StakeBoddy>
                </AutoColumn>
            </PageWrapper>
        </>
    )
}
