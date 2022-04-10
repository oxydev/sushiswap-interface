import React, { useEffect, useState } from 'react'
import { Dots } from '../Pool/styleds'

import { formattedNum, formattedPercent } from '../../utils'
import { Card, CardHeader, Paper, Search, DoubleLogo, TokenLogo } from './components'
import useFuse from 'sushi-hooks/useFuse'
import useSortableData from 'sushi-hooks/useSortableData'
import useDualFarms from 'sushi-hooks/useDualFarms'

import { ChevronUp, ChevronDown } from 'react-feather'
import InputGroup from './InputGroup'
import usePendingSushi, { usePendingDual } from '../../sushi-hooks/usePendingSushi'


export default function BentoBalances(): JSX.Element {
    const query = useDualFarms()
    const farms = query?.farms

    const userFarms = query?.userFarms
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

            } catch (e) {

            }

        }
    }
    useEffect(()=>{
        switchNetwork()
    },[])
    return (
        <div className="container max-w-2xl mx-auto px-0 sm:px-4">
            <Card
                className="h-full bg-dark-900"
                header={
                    <CardHeader className="flex justify-between items-center bg-dark-800">
                        <div className="flex w-full justify-between">
                            <div className="hidden md:flex items-center">
                                {/* <BackButton defaultRoute="/pool" /> */}
                                <div className="text-lg mr-2 whitespace-nowrap">Dual Yield Mines</div>
                            </div>
                            <Search search={search} term={term} />
                        </div>
                    </CardHeader>
                }
            >
                {/* UserFarms */}
                {userFarms && userFarms.length > 0 && (
                    <>
                        <div className="pb-4">
                            <div className="grid grid-cols-3 pb-4 px-4 text-sm  text-secondary">
                                <div className="flex items-center">
                                    <div>Your Yields</div>
                                </div>
                                <div className="flex items-center justify-end">
                                    <div>Deposited</div>
                                </div>
                                <div className="flex items-center justify-end">
                                    <div>Claimable</div>
                                </div>
                            </div>
                            <div className="flex-col space-y-2">
                                {userFarms.map((farm: any, i: number) => {
                                    return <UserBalance key={farm.address + '_' + i} farm={farm} />
                                })}
                            </div>
                        </div>
                    </>
                )}
                {/* All Farms */}
                <div className="grid grid-cols-3 pb-4 px-4 text-sm  text-secondary">
                    <div
                        className="flex items-center cursor-pointer hover:text-secondary"
                        onClick={() => requestSort('symbol')}
                    >
                        <div>Mines</div>
                        {sortConfig &&
                            sortConfig.key === 'symbol' &&
                            ((sortConfig.direction === 'ascending' && <ChevronUp size={12} />) ||
                                (sortConfig.direction === 'descending' && <ChevronDown size={12} />))}
                    </div>
                    <div className="hover:text-secondary cursor-pointer" onClick={() => requestSort('tvl')}>
                        <div className="flex items-center justify-end">
                            <div>TVL</div>
                            {sortConfig &&
                                sortConfig.key === 'tvl' &&
                                ((sortConfig.direction === 'ascending' && <ChevronUp size={12} />) ||
                                    (sortConfig.direction === 'descending' && <ChevronDown size={12} />))}
                        </div>
                    </div>
                    <div className="hover:text-secondary cursor-pointer" onClick={() => requestSort('roiPerYear')}>
                        <div className="flex items-center justify-end">
                            <div>APR</div>
                            {sortConfig &&
                                sortConfig.key === 'roiPerYear' &&
                                ((sortConfig.direction === 'ascending' && <ChevronUp size={12} />) ||
                                    (sortConfig.direction === 'descending' && <ChevronDown size={12} />))}
                        </div>
                    </div>
                </div>
                <div className="flex-col space-y-2">
                    {items && items.length > 0 ? (
                        items.map((farm: any, i: number) => {
                            return <TokenBalance key={farm.address + '_' + i} farm={farm}/>
                        })
                    ) : (
                        <>
                            {term ? (
                                <div className="w-full text-center py-6">No Results.</div>
                            ) : (
                                <div className="w-full text-center py-6">
                                    <Dots>Fetching Instruments</Dots>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Card>
        </div>
    )
}

const TokenBalance = ({ farm  }: any) => {
    const [expand, setExpand] = useState<boolean>(false)
    return (
        <>
            {farm.type === 'DLP' && (
                <Paper className="bg-dark-800">
                    <div
                        className="grid grid-cols-3 py-4 px-4 cursor-pointer select-none rounded text-sm"
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="flex items-center">
                            <div className="mr-4">
                                <DoubleLogo a0={farm.token0.address} a1={farm.token1.address} size={32} margin={true} />
                            </div>
                            <div className="hidden sm:block">
                                {farm && farm.token0.symbol + '-' + farm.token1.symbol}
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                            <div>
                                <div className="text-right">{formattedNum(farm.tvl, true)} </div>
                                <div className="text-secondary text-right">
                                    {/*{formattedNum(balance, false)} GLP*/}

                                    {formattedNum(farm.balance, false)} GLP
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                            <div className="text-right font-semibold text-xl">
                                {formattedPercent(farm.roiPerYear * 100)}{' '}
                                {/*{formattedPercent(1 * 100)}{' '}*/}
                                {/*Coming Soon...*/}
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

const UserBalance = ({ farm }: any) => {
    const [expand, setExpand] = useState<boolean>(false)
    const [pendingA, pendingB] = usePendingDual(farm.poolAddress)
    //todo hamid

    return (
        <>
            {farm.type === 'DLP' && (
                <Paper className="bg-dark-800">
                    <div
                        className="grid grid-cols-3 py-4 px-4 cursor-pointer select-none rounded text-sm"
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
                        <div className="flex justify-end items-center">
                            <div>
                                <div className="text-right">{formattedNum(farm.depositedUSD, true)} </div>
                                <div className="text-secondary text-right">
                                    {formattedNum(farm.depositedLP, false)} GLP
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                            <div>
                                <div className="text-right">{formattedNum(pendingA)} </div>
                                <div className="text-secondary text-right">{farm.rewardName0}</div>
                            </div>
                            <div>
                                <div className="text-right">{formattedNum(pendingB)} </div>
                                <div className="text-secondary text-right">{farm.rewardName1}</div>
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
