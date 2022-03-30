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

const PageWrapper = styled(AutoColumn)`
    width: 100%;
    justify-content: center;
`
const FlexBox = styled.div`
    display: flex;
    padding-bottm: 10px;
`
const VoteCard = styled(DataCard)`
    background: ${({ theme }) => transparentize(0.5, theme.bg1)};
    overflow: hidden;
`

const StakeBody = styled.div`
    width: 66.66%;
    max-width: 420px;
`

const StakeInfoBody = styled.div`
    width: 33.33%;
    max-width: 280px;
    margin-left: 1rem;

    align-self: stretch;
`
const LogoBox = styled(DataCard)`
    background: ${({ theme }) => transparentize(0.5, theme.bg1)};
    overflow: hidden;
    margin-bottom: 10px;
    padding: 2rem;
    height: 100%;
`

const StatusBox = styled(LogoBox)``

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
    background-color: rgba(255, 209, 102, 0.4);
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

const ViewLink = styled.a`
    color: #000;
    font-size: 16px;
    background-color: rgb(255, 209, 102);
    padding: 5px 15px;
    border-radius: 15px;
    margin-top: 10px;
    display: block;
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
    const [xSushiPrice] = [xSushi?.derivedETH * ethPrice, xSushi?.derivedETH * ethPrice * bar?.totalSupply]

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
                    <FlexBox>
                        <StakeBody>
                            <VoteCard>
                                <CardSection>
                                    <AutoColumn gap="md">
                                        <RowBetween>
                                            <TYPE.white fontWeight={600} color={theme.text1}>
                                                SushiBar: Make SUSHI work for you
                                            </TYPE.white>
                                        </RowBetween>
                                        <RowBetween>
                                            <div>
                                                <TYPE.white
                                                    fontSize={14}
                                                    color={theme.text2}
                                                    style={{ paddingBottom: '10px' }}
                                                >
                                                    {`Stake your SUSHI into xSUSHI for ~5% APY. No impermanent loss, no loss of governance rights. Continuously compounding.`}
                                                </TYPE.white>
                                                <TYPE.white
                                                    fontSize={14}
                                                    color={theme.text2}
                                                    style={{ paddingBottom: '10px' }}
                                                >
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
                                                    View your SushiBar Portfolio{' '}
                                                    <span style={{ fontSize: '11px' }}>↗</span>
                                                </TYPE.white>
                                            </ExternalLink>
                                        )}
                                    </AutoColumn>
                                </CardSection>
                            </VoteCard>
                        </StakeBody>
                        <StakeInfoBody>
                            <LogoBox>
                                <img src="https://app.sushi.com/images/xsushi-sign.png" />
                            </LogoBox>
                        </StakeInfoBody>
                    </FlexBox>

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
                            <AppBody>
                                <SaaveHeader />
                                <Wrapper id="swap-page">
                                    <AutoColumn style={{ paddingBottom: '10px' }}>
                                        <SushiDepositPanel
                                            label={''}
                                            disableCurrencySelect={true}
                                            customBalanceText={'Available to deposit: '}
                                            id="stake-liquidity-token"
                                            buttonText="Deposit"
                                            cornerRadiusBottomNone={true}
                                        />
                                        <XSushiWithdrawlPanel
                                            label={''}
                                            disableCurrencySelect={true}
                                            customBalanceText={'Available to withdraw: '}
                                            id="withdraw-liquidity-token"
                                            buttonText="Withdraw"
                                            cornerRadiusTopNone={true}
                                        />
                                    </AutoColumn>
                                </Wrapper>
                            </AppBody>
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
                                                    0
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
                                                    0
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
