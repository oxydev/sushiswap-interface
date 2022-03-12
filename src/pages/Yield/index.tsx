import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { RowBetween } from '../../components/Row'
import { Dots } from '../Pool/styleds'

//import { useActiveWeb3React } from 'hooks'
import { formattedNum, formattedPercent } from '../../utils'
import { Card, CardHeader, Paper, Search, DoubleLogo, TokenLogo } from './components'
import useFuse from 'sushi-hooks/useFuse'
import useSortableData from 'sushi-hooks/useSortableData'
import useFarms from 'sushi-hooks/useFarms'

import { ChevronUp, ChevronDown } from 'react-feather'
import InputGroup from './InputGroup'
import usePendingSushi from '../../sushi-hooks/usePendingSushi'
import { useTranslation } from 'react-i18next'

export const FixedHeightRow = styled(RowBetween)`
    height: 24px;
`

export default function BentoBalances(): JSX.Element {
    const { t } = useTranslation()
    const query = useFarms()
    const farms = query?.farms
    const userFarms = query?.userFarms
    // console.log(farms)
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
            } catch (e) {}
        }
    }
    useEffect(() => {
        switchNetwork()
    }, [])
    return (
        <div className="container max-w-2xl px-0 mx-auto sm:px-4">
            <Card
                className="h-full bg-dark-900"
                header={
                    <CardHeader className="flex items-center justify-between bg-dark-800">
                        <div className="flex justify-between w-full">
                            <div className="items-center hidden md:flex">
                                {/* <BackButton defaultRoute="/pool" /> */}
                                <div className="mr-2 text-lg whitespace-nowrap">{t('Yield Mines')}</div>
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
                            <div className="grid grid-cols-3 px-4 pb-4 text-sm text-secondary">
                                <div className="flex items-center">
                                    <div>{t('Your Yields')}</div>
                                </div>
                                <div className="flex items-center justify-end">
                                    <div>{t('Deposited')}</div>
                                </div>
                                <div className="flex items-center justify-end">
                                    <div>{t('Claimable')}</div>
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
                <div className="grid grid-cols-3 px-4 pb-4 text-sm text-secondary">
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
                    <div className="cursor-pointer hover:text-secondary" onClick={() => requestSort('tvl')}>
                        <div className="flex items-center justify-end">
                            <div>TVL</div>
                            {sortConfig &&
                                sortConfig.key === 'tvl' &&
                                ((sortConfig.direction === 'ascending' && <ChevronUp size={12} />) ||
                                    (sortConfig.direction === 'descending' && <ChevronDown size={12} />))}
                        </div>
                    </div>
                    <div className="cursor-pointer hover:text-secondary" onClick={() => requestSort('roiPerYear')}>
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
                            return <TokenBalance key={farm.address + '_' + i} farm={farm} />
                        })
                    ) : (
                        <>
                            {term ? (
                                <div className="w-full py-6 text-center">{t('No Results.')}</div>
                            ) : (
                                <div className="w-full py-6 text-center">
                                    <Dots>{t('Fetching Instruments')}</Dots>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Card>
        </div>
    )
}

const TokenBalance = ({ farm }: any) => {
    const [expand, setExpand] = useState<boolean>(false)
    return (
        <>
            {farm.type === 'SLP' && (
                <Paper className="bg-dark-800">
                    <div
                        className="grid grid-cols-3 px-4 py-4 text-sm rounded cursor-pointer select-none"
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
                        <div className="flex items-center justify-end">
                            <div>
                                <div className="text-right">{formattedNum(farm.tvl, true)} </div>
                                <div className="text-right text-secondary">
                                    {/*{formattedNum(balance, false)} GLP*/}
                                    {formattedNum(farm.balance, false)} GLP
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end">
                            <div className="text-xl font-semibold text-right">
                                {formattedPercent(farm.roiPerYear * 100)} {/*{formattedPercent(1 * 100)}{' '}*/}
                                {/*Coming Soon...*/}
                            </div>
                        </div>
                    </div>
                    {expand && (
                        <InputGroup
                            pid={farm.pid}
                            pairAddress={farm.pairAddress}
                            pairSymbol={farm.symbol}
                            token0Address={farm.token0.address}
                            token1Address={farm.token1.address}
                            type={'LP'}
                        />
                    )}
                </Paper>
            )}
        </>
    )
}

const UserBalance = ({ farm }: any) => {
    const [expand, setExpand] = useState<boolean>(false)
    const pending = usePendingSushi(farm.pid)

    return (
        <>
            {farm.type === 'SLP' && (
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
                        <div className="flex items-center justify-end">
                            <div>
                                <div className="text-right">{formattedNum(farm.depositedUSD, true)} </div>
                                <div className="text-right text-secondary">
                                    {formattedNum(farm.depositedLP, false)} GLP
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end">
                            <div>
                                <div className="text-right">{formattedNum(pending)} </div>
                                <div className="text-right text-secondary">BLING</div>
                            </div>
                        </div>
                    </div>
                    {expand && (
                        <InputGroup
                            pid={farm.pid}
                            pairAddress={farm.pairAddress}
                            pairSymbol={farm.symbol}
                            token0Address={farm.token0.address}
                            token1Address={farm.token1.address}
                            type={'LP'}
                        />
                    )}
                </Paper>
            )}
        </>
    )
}
