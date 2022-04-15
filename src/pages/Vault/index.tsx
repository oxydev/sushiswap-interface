import React, { useEffect, useMemo, useState } from 'react'
import { Dots } from '../Pool/styleds'
import { ChainId, Currency, CurrencyAmount, Token } from '@sushiswap/sdk'

import { formattedNum, formattedPercent } from '../../utils'
import { Card, CardHeader, Paper, Search, DoubleLogo, TokenLogo } from './components'
import useFuse from 'sushi-hooks/useFuse'
import useSortableData from 'sushi-hooks/useSortableData'
import useDualFarms from 'sushi-hooks/useDualFarms'
import Fraction from '../../constants/Fraction'

import { ChevronUp, ChevronDown } from 'react-feather'
import InputGroup from './InputGroup'
import usePendingSushi, { usePendingDual } from '../../sushi-hooks/usePendingSushi'
import CurrencyLogo from 'components/CurrencyLogo'
import styled from 'styled-components'
import { useMultipleContractSingleData } from '../../state/multicall/hooks'
import { Interface } from '@ethersproject/abi'
import DUAL_ABI from '../../constants/abis/dual-rewards.-staking.json'
import { BigNumber } from '@ethersproject/bignumber'
import { useActiveWeb3React } from '../../hooks'

import Vault1 from '../../assets/images/vault1.svg'
import Vault2 from '../../assets/images/vault2.svg'
import Vault3 from '../../assets/images/vault3.svg'
import Vault4 from '../../assets/images/vault4.svg'

const vaultPlansList = [
    {
        duration: '1 Week',
        multiPlier: '0.83060',
        apr: '293%',
        icon: Vault1
    },
    {
        duration: '6 Months',
        multiPlier: '0.83060',
        apr: '293%',
        icon: Vault2
    },
    {
        duration: '12 Months',
        multiPlier: '0.83060',
        apr: '293%',
        icon: Vault3
    },
    {
        duration: '24 Months',
        multiPlier: '0.83060',
        apr: '293%',
        icon: Vault4
    }
]

export default function ValutPage(): JSX.Element {
    const query = useDualFarms()
    const farms = query?.farms
    const userFarms = query?.userFarms
    const { account } = useActiveWeb3React()
    const accountArg = useMemo(() => [account ?? undefined], [account])

    const rewardsAddresses = ['0xaea9Fd93f86970dbB8946c4e45d0C05B3259fb99']
    const balances = useMultipleContractSingleData(rewardsAddresses, new Interface(DUAL_ABI), 'totalSupply', [])
    const balancesPerson = useMultipleContractSingleData(
        rewardsAddresses,
        new Interface(DUAL_ABI),
        'balanceOf',
        accountArg
    )

    // Search Setup
    const options = { keys: ['symbol', 'name', 'pairAddress'], threshold: 0.4 }
    const { result, search, term } = useFuse({
        data: farms && farms.length > 0 ? farms : [],
        options
    })
    const flattenSearchResults = result.map((a: { item: any }) => (a.item ? a.item : a))
    // Sorting Setup
    const { items, requestSort, sortConfig } = useSortableData(flattenSearchResults)
    const switchNetwork = () => {
        if (window.ethereum) {
            try {
                // const data = [
                //     {
                //         chainId: '0xa516',
                //         chainName: 'Oasis Emerald',
                //         nativeCurrency: {
                //             symbol: 'ROSE',
                //             decimals: 18
                //         },
                //         rpcUrls: ['https://emerald.oasis.dev/'],
                //         blockExplorerUrls: ['https://explorer.emerald.oasis.dev/']
                //     }
                // ]
                const data = [
                    {
                        chainId: '0xa515',
                        chainName: 'Oasis Test',
                        nativeCurrency: {
                            symbol: 'tROSE',
                            decimals: 18
                        },
                        rpcUrls: ['https://testnet.emerald.oasis.dev/'],
                        blockExplorerUrls: ['https://testnet.explorer.emerald.oasis.dev/']
                    }
                ]

                try {
                    window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: data
                    })
                    window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xa515' }]
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
    return (
        <div className="container max-w-4xl px-0 mx-auto sm:px-4">
            <Card
                className="h-full bg-dark-900"
                header={
                    <CardHeader className="flex items-center justify-between bg-dark-800">
                        <div className="flex justify-between w-full">
                            <div className="items-center hidden md:flex">
                                {/* <BackButton defaultRoute="/pool" /> */}
                                <div className="mr-2 text-lg whitespace-nowrap">Select Locking Period</div>
                            </div>
                        </div>
                    </CardHeader>
                }
            >
                <div className="grid" style={{ gridTemplateColumns: '2.5fr 1fr' }}>
                    <div>
                        {/* UserFarms */}
                        {userFarms && userFarms.length > 0 && (
                            <>
                                <div className="pb-4">
                                    <div className="grid grid-cols-3 px-4 pb-4 text-sm text-secondary">
                                        <div className="flex items-center">
                                            <div>Your Yields</div>
                                        </div>
                                        <div className="flex items-center justify-end" style={{ paddingRight: '50%' }}>
                                            <div>Deposited</div>
                                        </div>
                                        <div className="flex items-center justify-start" style={{ paddingLeft: '30%' }}>
                                            <div>Claimable</div>
                                        </div>
                                    </div>
                                    <div className="flex-col space-y-2">
                                        {vaultPlansList.map(item => {
                                            return (
                                                <UserVault
                                                    key={item.duration}
                                                    duration={item.duration}
                                                    multiplier={item.multiPlier}
                                                    apr={item.apr}
                                                />
                                            )
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                        {/* All Farms */}
                        <div className="grid pb-4 text-sm text-secondary" style={{ gridTemplateColumns: '1fr 5fr' }}>
                            <div></div>
                            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                                <div className="cursor-pointer hover:text-secondary" onClick={() => requestSort('tvl')}>
                                    <div className="flex items-center justify-start">
                                        <div>Duration</div>
                                    </div>
                                </div>
                                <div
                                    className="cursor-pointer hover:text-secondary"
                                    onClick={() => requestSort('roiPerYear')}
                                >
                                    <div className="flex items-center justify-end">
                                        <div>Multiplier</div>
                                    </div>
                                </div>
                                <div className="cursor-pointer hover:text-secondary">
                                    <div className="flex items-center justify-end" style={{ paddingRight: '20%' }}>
                                        <div>APR</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-col space-y-2">
                            {vaultPlansList && vaultPlansList.length > 0 ? (
                                vaultPlansList.map(item => {
                                    return (
                                        <VaultPlan
                                            key={item.duration}
                                            duration={item.duration}
                                            multiplier={item.multiPlier}
                                            apr={item.apr}
                                            icon={item.icon}
                                        />
                                    )
                                })
                            ) : (
                                <>
                                    {term ? (
                                        <div className="w-full py-6 text-center">No Results.</div>
                                    ) : (
                                        <div className="w-full py-6 text-center">
                                            <Dots>Fetching Instruments</Dots>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <VaultDesc>
                        <p className="text-sm font-normal text-secondary">
                            Your deposit will be held for the duration of the locking period. After the period ends you
                            will be able to withdraw your funds.
                        </p>
                        <p className="mt-auto text-sm font-normal text-secondary">
                            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula
                        </p>
                        <a className="text-base text-center" href="/#/stake">
                            Stake xBling
                        </a>
                    </VaultDesc>
                </div>
            </Card>
        </div>
    )
}

const VaultDesc = styled.div`
    display: flex;
    flex-direction: column;
    padding-top: 66px;
    padding: 66px 0 0 36px;

    & > a {
        background: linear-gradient(106.19deg, #daab62 25.43%, #3e8ed7 83.19%);
        line-height: 45px !important;
        display: block;
        color: #fff;
        width: 100%;
        border-radius: 6px;
        margin-top: 10px;
    }
`

const RewardRate = styled.div`
    width: 130px;
    background: linear-gradient(91.11deg, #39a894 -80.82%, #3e8ed7 90.23%);
    line-height: 22px;
    border-radius: 11px;
    padding: 0 10px;
    color: #fff;
    font-size: 12px;
    margin-left: 12px;
    text-align: left;
    font-weight: normal;
`

const VaultPlan = ({ farm, duration, multiplier, apr, icon }: any) => {
    const [expand, setExpand] = useState<boolean>(false)

    return (
        <>
            <Paper className="grid" style={{ gridTemplateColumns: '1fr 5fr' }}>
                <div className="flex items-center">
                    <div className="mr-4">
                        <img src={icon} alt={duration} />
                    </div>
                </div>
                <div
                    className="grid px-4 py-4 text-sm rounded cursor-pointer select-none bg-dark-800"
                    style={{ gridTemplateColumns: '2fr 1fr 1fr' }}
                    onClick={() => setExpand(!expand)}
                >
                    <div className="flex items-center justify-start">
                        <div>
                            <div className="font-normal text-right text-secondary">{duration}</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <div className="text-base text-right ">
                            <p className="font-normal ">$ 824,098</p>
                            <p className="font-thin text-secondary">{multiplier}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <div className="text-lg font-normal text-right">{apr}</div>
                    </div>
                </div>
                {expand && (
                    <InputGroup
                        pid={farm.pid}
                        poolAddress={farm.poolAddress}
                        pairAddress={farm.pairAddress}
                        pairSymbol={farm.symbol}
                        token0Address={farm.token0.address}
                        token1Address={farm.token1.address}
                        rewardA={farm.rewardName0}
                        rewardB={farm.rewardName1}
                        type={'DLP'}
                    />
                )}
            </Paper>
        </>
    )
}

const UserVault = ({ farm, deposited }: any) => {
    const [expand, setExpand] = useState<boolean>(false)
    const [pendingA, pendingB] = usePendingDual(farm.poolAddress)
    //todo hamid

    return (
        <>
            {farm.type === 'DLP' && (
                <Paper className="bg-dark-800">
                    <div
                        className="grid grid-cols-3 px-4 py-4 text-sm rounded cursor-pointer select-none"
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="flex items-center">
                            <div className="mr-4">
                                <DoubleLogo a0={farm.token0.address} a1={farm.token1.address} size={26} margin={true} />
                            </div>
                            <div className="hidden sm:block">
                                {farm && farm.token0.symbol + '-' + farm.token1.symbol}
                            </div>
                        </div>
                        <div className="flex items-center justify-end" style={{ paddingRight: '50%' }}>
                            <div>
                                <div className="text-right">{formattedNum(farm.depositedUSD, true)} </div>
                                <div className="text-right text-secondary">
                                    {deposited
                                        ? formattedNum(
                                              Fraction.from(deposited, BigNumber.from(10).pow(18)).toString(18),
                                              false
                                          )
                                        : 0}{' '}
                                    GLP
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-start justify-end" style={{ paddingLeft: '30%' }}>
                            <div className="flex self-stretch justify-between pb-2 pr-6">
                                <CurrencyLogo
                                    currency={
                                        new Token(
                                            ChainId.OASISETH_MAIN,
                                            farm.rewardAddress0,
                                            18,
                                            'ETH(MULTI)',
                                            'Ethereum'
                                        )
                                    }
                                />
                                <div className="ml-3 mr-3 text-left text-secondary">{farm.rewardName0}</div>
                                <div className="text-left">{formattedNum(pendingA)} </div>
                            </div>
                            <div className="flex self-stretch justify-between pr-6">
                                <CurrencyLogo
                                    currency={
                                        new Token(
                                            ChainId.OASISETH_MAIN,
                                            farm.rewardAddress1,
                                            18,
                                            'ETH(MULTI)',
                                            'Ethereum'
                                        )
                                    }
                                />
                                <div className="ml-3 mr-3 text-right text-secondary">{farm.rewardName1}</div>
                                <div className="text-right">{formattedNum(pendingB)} </div>
                            </div>
                        </div>
                    </div>
                    {expand && (
                        <InputGroup
                            pid={farm.pid}
                            poolAddress={farm.poolAddress}
                            pairAddress={farm.pairAddress}
                            pairSymbol={farm.symbol}
                            token0Address={farm.token0.address}
                            token1Address={farm.token1.address}
                            rewardA={farm.rewardName0}
                            rewardB={farm.rewardName1}
                            type={'DLP'}
                        />
                    )}
                </Paper>
            )}
        </>
    )
}
