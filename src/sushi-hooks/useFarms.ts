import { useCallback, useEffect, useState } from 'react'
import { useActiveWeb3React } from 'hooks'

import { exchange, masterchef } from 'sushi-hooks/apollo/client'
import { getAverageBlockTime } from 'sushi-hooks/apollo/getAverageBlockTime'
import { liquidityPositionSubsetQuery, pairSubsetQuery, poolsQuery } from 'sushi-hooks/apollo/queries'

import sushiData from '@sushiswap/sushi-data'
import _ from 'lodash'

import { useBoringHelperContract } from 'hooks/useContract'
import { BigNumber } from '@ethersproject/bignumber'
import Fraction from '../constants/Fraction'

import { POOL_DENY } from '../constants'

// Todo: Rewrite in terms of web3 as opposed to subgraph
const useFarms = () => {
    const [farms, setFarms] = useState<any | undefined>()
    const { account } = useActiveWeb3React()
    const boringHelperContract = useBoringHelperContract()

    const fetchAllFarms = useCallback(async () => {

        const pools = [{}]
        const pairAddresses = ['0x689F78AD285d6332A7885D5e44C5B5e698a3cf54']
            .sort()

        const averageBlockTime = 8
        const sushiPrice = 1
        // const kashiPairs = results[4].filter(result => result !== undefined) // filter out undefined (not in onsen) from all kashiPairs

        //console.log('kashiPairs:', kashiPairs)

        // const KASHI_PAIRS = _.range(190, 230, 1) // kashiPair pids 189-229
        //console.log('kashiPairs:', KASHI_PAIRS, kashiPairs, pools)

        const farms = pools
            .map((pool: any) => {

                    const blocksPerHour = 3600 / averageBlockTime
                //todo pool.balance pair.totalSupply pair.reserveUSD pool.allocPoint pool.owner.totalAllocPoint pool.owner.sushiPerBlock
                    pool.balance = 1
                    pool.allocPoint = 100
                    pool.owner = {}
                    pool.owner.totalAllocPoint = 100
                    pool.owner.sushiPerBlock = 1000000000
                    pool.token0 = {}
                    pool.token1 = {}
                    pool.token0.symbol = "A"
                    pool.token0.name = "AA"
                    pool.token0.address = "0x007906a1f7f34865d6bAc41eeD4Ea3ffF4eE7cf4"
                    pool.token1.symbol = "B"
                    pool.token1.name = "BB"
                    pool.token1.address = "0x77E44D943267014F936299d4a69a2C379A46504b"
                    pool.id = 0
                    pool.lpAddress = pairAddresses[pool.id]
                    const balance = Number(pool.balance / 1e18) > 0 ? Number(pool.balance / 1e18) : 0.1
                    const totalSupply = 0.1
                    const reserveUSD = 0.1
                    const balanceUSD = (balance / Number(totalSupply)) * Number(reserveUSD)
                    const rewardPerBlock =
                        ((pool.allocPoint / pool.owner.totalAllocPoint) * pool.owner.sushiPerBlock) / 1e18
                    const roiPerBlock = (rewardPerBlock * sushiPrice) / balanceUSD
                    const roiPerHour = roiPerBlock * blocksPerHour
                    const roiPerDay = roiPerHour * 24
                    const roiPerMonth = roiPerDay * 30
                    const roiPerYear = roiPerMonth * 12

                    return {
                        ...pool,
                        type: 'SLP',
                        symbol: pool.token0.symbol + '-' + pool.token1.symbol,
                        name: pool.token0.name + ' ' + pool.token1.name,
                        pid: Number(pool.id),
                        pairAddress: pool.lpAddress,
                        slpBalance: pool.balance,
                        liquidityPair: pool.lpAddress,
                        roiPerBlock,
                        roiPerHour,
                        roiPerDay,
                        roiPerMonth,
                        roiPerYear,
                        rewardPerThousand: 1 * roiPerDay * (1000 / sushiPrice),
                        tvlL :1
                        // tvl: liquidityPosition?.liquidityTokenBalance
                        //     ? (pair.reserveUSD / pair.totalSupply) * liquidityPosition.liquidityTokenBalance
                        //     : 0.1
                    }
            })

        console.log('farms:', farms)
        const sorted = _.orderBy(farms, ['pid'], ['desc'])

        const pids = sorted.map(pool => {
            return pool.pid
        })

        if (account) {
          console.log(account, pids)
            const userFarmDetails = await boringHelperContract?.pollPools(account, pids)
            console.log('userFarmDetails:', userFarmDetails)
            const userFarms = userFarmDetails
                .filter((farm: any) => {
                    return farm.balance.gt(BigNumber.from(0)) || farm.pending.gt(BigNumber.from(0))
                })
                .map((farm: any) => {
                    //console.log('userFarm:', farm.pid.toNumber(), farm)

                    const pid = farm.pid.toNumber()
                    const farmDetails = sorted.find((pair: any) => pair.pid === pid)

                    console.log('farmDetails:', farmDetails)
                    let deposited
                    let depositedUSD
                    deposited = Fraction.from(farm.balance, BigNumber.from(10).pow(18)).toString(18)
                    depositedUSD =
                        farmDetails.slpBalance && Number(farmDetails.slpBalance / 1e18) > 0
                            ? (Number(deposited) * Number(farmDetails.tvl)) / (farmDetails.slpBalance / 1e18)
                            : 0

                    const pending = Fraction.from(farm.pending, BigNumber.from(10).pow(18)).toString(18)

                    return {
                        ...farmDetails,
                        type: farmDetails.type, // KMP or SLP
                        depositedLP: deposited,
                        depositedUSD: depositedUSD,
                        pendingBling: pending
                    }
                })
            setFarms({ farms: sorted, userFarms: userFarms })
            console.log('userFarms:', userFarms)
        } else {
            setFarms({ farms: sorted, userFarms: [] })
        }
    }, [account, boringHelperContract])

    useEffect(() => {
        fetchAllFarms()
    }, [fetchAllFarms])

    return farms
}

export default useFarms
