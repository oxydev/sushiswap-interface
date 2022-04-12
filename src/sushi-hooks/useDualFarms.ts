import { useCallback, useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from 'hooks'

import _ from 'lodash'

import { useBoringHelperContract } from 'hooks/useContract'
import { BigNumber } from '@ethersproject/bignumber'
import Fraction from '../constants/Fraction'
import { Pair } from '@uniswap/sdk'
import DUAL_ABI from '../constants/abis/dual-rewards.-staking.json'

import { NEVER_RELOAD, useMultipleContractSingleData } from '../state/multicall/hooks'
import { Interface } from '@ethersproject/abi'

const useDualFarms = () => {
    const [farms, setFarms] = useState<any | undefined>()
    const { account } = useActiveWeb3React()
    // const boringHelperContract = useBoringHelperContract()
    const accountArg = useMemo(() => [account ?? undefined], [account]);
    const pools = [
        {
            token0: {
                symbol:"wROSE",
                name:"Wrapped ROSE",
                address:"0xF6Ca785c9a3A5bbdb23FdF5bEEC4F77DB2f4B220"
            },
            token1: {
                symbol:"weUSDT",
                name:"Tether - Wormhole",
                address:"0xdC19A122e268128B5eE20366299fc7b5b199C8e3"
            },
            rewardToken0: {
                symbol:"alice",
                name:"alice",
                address:"0xF6Ca785c9a3A5bbdb23FdF5bEEC4F77DB2f4B220"
            },
            rewardToken1: {
                symbol: "Bob",
                name:"Bob",
                address:"0x659A4775a19837c3C79993df611E7EEcC0b5C200"
            },
            rewardRate0:578703703,
            rewardRate1:1157407407,
            lpAddress:"0xAd08b7d5CDE085718C607f77F4AC54c3c0BE18e4",
            poolAddress:"0xaea9Fd93f86970dbB8946c4e45d0C05B3259fb99",
            id:0
        }
    ]
    const rewardsAddresses = pools.map((pool) => pool.poolAddress)

    const balances = useMultipleContractSingleData(
      rewardsAddresses,
      new Interface(DUAL_ABI),
      'balanceOf',
      accountArg,
    );
    // const earnedAAmounts = useMultipleContractSingleData(
    //   rewardsAddresses,
    //   STAKING_DUAL_REWARDS_INTERFACE,
    //   'earnedA',
    //   accountArg,
    // );
    // const earnedBAmounts = useMultipleContractSingleData(
    //   rewardsAddresses,
    //   STAKING_DUAL_REWARDS_INTERFACE,
    //   'earnedB',
    //   accountArg,
    // );

    const fetchAllFarms = useCallback(async () => {
        // let prices = await bnbFetcher()
        let chainPrice
        let bnbPrice
        let ethPrice
        // [bnbPrice, chainPrice, ethPrice] = prices

        const averageBlockTime = 7.4
        const sushiPrice = 0.3


        const farms = pools.map((pool: any) => {
            const blocksPerHour = 3600 / averageBlockTime

            // const balance = Number(pool.balance / 1e18) > 0 ? Number(pool.balance / 1e18) : 0.1
            // const totalSupply = 0.1
            // const reserveUSD = 0.1
            // const balanceUSD = (balance / Number(totalSupply)) * Number(reserveUSD)

            const roiPerBlock = 1
            const roiPerHour = roiPerBlock * blocksPerHour
            const roiPerDay = roiPerHour * 24
            const roiPerMonth = roiPerDay * 30
            const roiPerYear = roiPerMonth * 12

            return {
                ...pool,
                type: 'DLP',
                symbol: pool.token0.symbol + '-' + pool.token1.symbol,
                symbolReward: pool.rewardToken0.symbol + '-' + pool.rewardToken1.symbol,
                name: pool.token0.name + ' ' + pool.token1.name,
                nameReward: pool.rewardToken0.name + ' ' + pool.rewardToken1.name,
                pid: Number(pool.id),
                pairAddress: pool.lpAddress,
                poolAddress: pool.poolAddress,
                slpBalance: pool.balance,
                liquidityPair: pool.lpAddress,
                rewardRate1: pool.rewardRate1,
                rewardRate0: pool.rewardRate0,
                rewardName0: pool.rewardToken0.name,
                rewardName1: pool.rewardToken1.name,
                roiPerBlock,
                roiPerHour,
                roiPerDay,
                roiPerMonth,
                roiPerYear,
                rewardPerThousand: 1 * roiPerDay * (1000 / sushiPrice),
                tvl: 1
            }
        })

        // console.log('farms:', farms)
        const sorted = _.orderBy(farms, ['pid'], ['desc'])
        const pids = [0]

        // const userFarmDetails = await boringHelperContract?.pollPools(account??"0x35d43B3B122D6d112801B391B375d9377f0Ff7a6",
        //   [pids])
        // console.log(balances)
        //
        // for (let i = 0; i < balances.length; i++) {
        //     let totalSupply = Fraction.from(userFarmDetails[i].totalSupply,
        //       BigNumber.from(10).pow(18)).toString(18)
        //
        //     farms[i].balance = balances[i];
        //     let address0 = farms[i].token0.address
        //     let address1 = farms[i].token1.address
        //     if(!sortedBefore(address0,address1)){
        //         [address0, address1] = [address1,address0]
        //     }
        //     let reserveUSD :any = 0
        //     if (address0 === "0xdC19A122e268128B5eE20366299fc7b5b199C8e3" || address0 === "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844")
        //         reserveUSD = userFarmDetails[i].reserve0 * 2 / 1e6
        //     else if (address1 === "0xdC19A122e268128B5eE20366299fc7b5b199C8e3" || address1 === "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844")
        //         reserveUSD = userFarmDetails[i].reserve1 * 2 / 1e6
        //     else if (address0 === "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C")
        //         reserveUSD = userFarmDetails[i].reserve0 * 2 / 1e18
        //     else if (address1 === "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C")
        //         reserveUSD = userFarmDetails[i].reserve1 * 2 / 1e18
        //     else if (address0 === "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D")
        //         reserveUSD = userFarmDetails[i].reserve0 * bnbPrice * 2 / 1e18
        //     else if (address1 === "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D")
        //         reserveUSD = userFarmDetails[i].reserve1 * bnbPrice * 2 / 1e18
        //     else if (address0 === "0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055")
        //         reserveUSD = userFarmDetails[i].reserve0 * chainPrice * 2 / 1e18
        //     else if (address1 === "0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055")
        //         reserveUSD = userFarmDetails[i].reserve1 * chainPrice * 2 / 1e18
        //     else if (address0 === "0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F")
        //         reserveUSD = userFarmDetails[i].reserve0 * ethPrice * 2 / 1e18
        //     else if (address1 === "0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F")
        //         reserveUSD = userFarmDetails[i].reserve1 * ethPrice * 2 / 1e18
        //     const balanceUSD = (Number(totalSupply) /
        //       userFarmDetails[i].lpTotalSupply) * Number(reserveUSD)
        //
        //     //todo
        //     const rewardPerBlock = farms[i].rewardRate0
        //     const roiPerBlock = (rewardPerBlock * sushiPrice) / balanceUSD
        //     farms[i].tvl = (reserveUSD / userFarmDetails[i].lpTotalSupply) * userFarmDetails[i].totalSupply
        //     farms[i].roiPerYear = roiPerBlock * 3600 / averageBlockTime * 24 * 30 * 12
        //
        // }
        if (account) {
            // console.log(account, pids)
            // console.log('userFarmDetails:', userFarmDetails)
            // const userFarms = userFarmDetails
            //     .filter((farm: any, index: number) => {
            //         return balances[index].result?.[0] > 0 || earnedAAmounts[index].result?.[0] > 0 || earnedBAmounts[index].result?.[0] > 0
            //     })
            //     .map((farm: any, index: number) => {
            //         //console.log('userFarm:', farm.pid.toNumber(), farm)
            //
            //         const farmDetails = sorted.find((pair: any) => pair.pid === index)
            //
            //         // console.log('farmDetails:', farmDetails)
            //         // console.log('farmDetails:', farm)
            //         const deposited = Fraction.from(balances[index].result?.[0], BigNumber.from(10).pow(18)).toString(18)
            //         const depositedUSD = (Number(deposited) * Number(farmDetails.tvl)) / (farm.lpTotalSupply / 1e18)
            //
            //         const pending = [
            //           [Fraction.from(earnedAAmounts[index].result?.[0], BigNumber.from(10).pow(18)).toString(18),farmDetails.rewardName0],
            //           [Fraction.from(earnedBAmounts[index].result?.[0], BigNumber.from(10).pow(18)).toString(18),farmDetails.rewardName1],
            //         ]
            //         // console.log(farms[pid])
            //
            //         return {
            //             ...farmDetails,
            //             type: farmDetails.type, // KMP or SLP
            //             depositedLP: deposited,
            //             depositedUSD: depositedUSD,
            //             pendingBling: pending,
            //         }
            //     })

            setFarms({ farms: sorted, userFarms: [] })
            // console.log('userFarms:', userFarms)
        } else {

            setFarms({ farms: sorted, userFarms: [] })
        }
    }, [account])

    useEffect(() => {
        fetchAllFarms()
    }, [fetchAllFarms])

    async function bnbFetcher() {
        let response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,chainlink,ethereum&vs_currencies=usd", {
            method: 'GET',
            redirect: 'follow'
        })
        let result = await response.text()
        return [JSON.parse(result).binancecoin.usd, JSON.parse(result).chainlink.usd, JSON.parse(result).ethereum.usd]
    }

    return farms
}

function sortedBefore(address0:string, address1:string){
    return address0.toLowerCase() < address1.toLowerCase()
}




export default useDualFarms
