import { useCallback, useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from 'hooks'

import _ from 'lodash'

import { useBoringHelperContract, useMulticallContract } from 'hooks/useContract'
import { BigNumber } from '@ethersproject/bignumber'
import Fraction from '../constants/Fraction'
import { NEVER_RELOAD, useSingleContractMultipleData } from '../state/multicall/hooks'
import { useMasterChefContract } from './useContract'
import { useNativePrice, useTokens } from '../services/graph/hooks/exchange'
import { ChainId } from '@sushiswap/sdk'

const useFarms = () => {
    const [farms, setFarms] = useState<any | undefined>()
    const [rewardDebt, setRewardDebt] = useState<any | undefined>()
    const { account } = useActiveWeb3React()
    const boringHelperContract = useBoringHelperContract()
    const masterChefContract = useMasterChefContract()


    const fetchRewardDebts = useCallback(async () => {
        if (account) {
            const dataPending = []

            for (let i = 0; i < 8; i++) {
                dataPending.push(masterChefContract?.userInfo(i, account))
            }
            for (let i = 0; i < 8; i++) {
                dataPending[i] = await dataPending[i]
            }
            setRewardDebt(dataPending)
        }

    },[masterChefContract, account])
    const ethPrice = useNativePrice({ chainId: ChainId.MAINNET })
    const xSushi = useTokens({
        chainId: ChainId.MAINNET,
        variables: { where: { id: "0x72Ad551af3c884d02e864B182aD9A34EE414C36C".toLowerCase() } },
    })?.[0]
    const sushiPrice = xSushi?.derivedETH * ethPrice

    const fetchAllFarms = useCallback(async () => {
        let prices = await bnbFetcher()
        let chainPrice
        let bnbPrice
        let ethPrice
        let rosePrice
        [bnbPrice, chainPrice, ethPrice, rosePrice] = prices
        // console.log(bnbPrice,chainPrice)
        const pools = [{
            balance:1,
            allocPoint:150,
            owner:{
                totalAllocPoint: 1125,
                sushiPerBlock: 11.152637748
            },
            token0: {
                symbol:"wROSE",
                name:"Wrapped ROSE",
                address:"0x21C718C22D52d0F3a789b752D4c2fD5908a8A733"
            },
            token1: {
                symbol:"weUSDT",
                name:"Tether - Wormhole",
                address:"0xdC19A122e268128B5eE20366299fc7b5b199C8e3"
            },
            id:0,
            lpAddress:"0xD9F3Be6497B26EFBEd163A95912FB5e2F235Fd53"
        },
            {
                balance:1,
                allocPoint:100,
                owner:{
                    totalAllocPoint: 875,
                    sushiPerBlock: 11.152637748
                },
                token0  : {
                    symbol:"USDC",
                    name:"USDC - Multichain",
                    address:"0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844"
                },
                token1: {
                    symbol:"weUSDT",
                    name:"Tether - Wormhole",
                    address:"0xdC19A122e268128B5eE20366299fc7b5b199C8e3"
                },
                id:1,
                lpAddress:"0x7Bf986f1373B5554634aF98A9772BaA2085fc84F"
            },
            {
                balance:1,
                allocPoint:125,
                owner:{
                    totalAllocPoint: 1125,
                    sushiPerBlock: 11.152637748
                },
                token0: {
                    symbol:"wROSE",
                    name:"Wrapped ROSE",
                    address:"0x21C718C22D52d0F3a789b752D4c2fD5908a8A733"
                },
                token1: {
                    symbol:"BUSD",
                    name:"BUSD - Multichain",
                    address:"0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C"
                },
                id:2,
                lpAddress:"0xe593c42780ccbe7723B67b3E5FD3e0cdd2E25017"
            },
            {
                balance:1,
                allocPoint:150,
                owner:{
                    totalAllocPoint: 1125,
                    sushiPerBlock: 11.152637748
                },
                token1: {
                    symbol:"USDC",
                    name:"USDC - Multichain",
                    address:"0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844"
                },
                token0: {
                    symbol:"wROSE",
                    name:"Wrapped ROSE",
                    address:"0x21C718C22D52d0F3a789b752D4c2fD5908a8A733"
                },
                id:3,
                lpAddress:"0x89f5e345b7837E950136811b94af6CcBa199eFa8"
            },
            {
                balance:1,
                allocPoint:100,
                owner:{
                    totalAllocPoint: 1125,
                    sushiPerBlock: 11.152637748
                },
                token1: {
                    symbol:"BNB",
                    name:"Binance - Multichain",
                    address:"0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D"
                },
                token0: {
                    symbol:"wROSE",
                    name:"Wrapped ROSE",
                    address:"0x21C718C22D52d0F3a789b752D4c2fD5908a8A733"
                },
                id:4,
                lpAddress:"0x41953bAca0A634732365093f848CcFc968EF0C69"
            },
            {
                balance:1,
                allocPoint:150,
                owner:{
                    totalAllocPoint: 1125,
                    sushiPerBlock: 11.152637748
                },
                token1: {
                    symbol:"LINK",
                    name:"ChainLink - Multichain",
                    address:"0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055"
                },
                token0: {
                    symbol:"wROSE",
                    name:"Wrapped ROSE",
                    address:"0x21C718C22D52d0F3a789b752D4c2fD5908a8A733"
                },
                id:5,
                lpAddress:"0xbf6ABe88a1A780d17786A82c93b56941a281DB66"
            },
            {
                balance:1,
                allocPoint:100,
                owner:{
                    totalAllocPoint: 1125,
                    sushiPerBlock: 11.152637748
                },
                token1: {
                    symbol:"WETH",
                    name: "Wrapped Ether (Wormhole)",
                    address:"0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F"
                },
                token0: {
                    symbol:"wROSE",
                    name:"Wrapped ROSE",
                    address:"0x21C718C22D52d0F3a789b752D4c2fD5908a8A733"
                },
                id:6,
                lpAddress:"0xc1AB2878d289d5c402837600c6Abc03a8a92D890"
            },
            {
                balance:1,
                allocPoint:250,
                owner:{
                    totalAllocPoint: 1125,
                    sushiPerBlock: 11.152637748
                },
                token1: {
                    symbol:"BLING",
                    name: "GemKeeper Finance",
                    address:"0x72Ad551af3c884d02e864B182aD9A34EE414C36C"
                },
                token0: {
                    symbol:"wROSE",
                    name:"Wrapped ROSE",
                    address:"0x21C718C22D52d0F3a789b752D4c2fD5908a8A733"
                },
                id:7,
                lpAddress:"0xB29553FAf847BA5B79B6ae13fa82d0B216fAf626"
            }
        ]

        const averageBlockTime = 7.4


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
                tvl: 1
            }
        })

        // console.log('farms:', farms)
        const sorted = _.orderBy(farms, ['pid'], ['asc'])

        const pids = sorted.map(pool => {
            return pool.pid
        })
        const userFarmDetails = await boringHelperContract?.pollPools(account??"0x35d43B3B122D6d112801B391B375d9377f0Ff7a6", pids)
        for (let userFarmDetailsKey in userFarmDetails) {
            let totalSupply = Fraction.from(userFarmDetails[userFarmDetailsKey].totalSupply, BigNumber.from(10).pow(18)).toString(18)
            farms[userFarmDetails[userFarmDetailsKey].pid.toNumber()].balance = totalSupply;
            let address0 = farms[userFarmDetails[userFarmDetailsKey].pid.toNumber()].token0.address
            let address1 = farms[userFarmDetails[userFarmDetailsKey].pid.toNumber()].token1.address
            if(!sortedBefore(address0,address1)){
                [address0, address1] = [address1,address0]
            }
            let reserveUSD :any = 0
            if (address0 === "0xdC19A122e268128B5eE20366299fc7b5b199C8e3" || address0 === "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844")
                reserveUSD = userFarmDetails[userFarmDetailsKey].reserve0 * 2 / 1e6
            else if (address1 === "0xdC19A122e268128B5eE20366299fc7b5b199C8e3" || address1 === "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844")
                reserveUSD = userFarmDetails[userFarmDetailsKey].reserve1 * 2 / 1e6
            else if (address0 === "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C")
                reserveUSD = userFarmDetails[userFarmDetailsKey].reserve0 * 2 / 1e18
            else if (address1 === "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C")
                reserveUSD = userFarmDetails[userFarmDetailsKey].reserve1 * 2 / 1e18
            else if (address0 === "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D")
                reserveUSD = userFarmDetails[userFarmDetailsKey].reserve0 * bnbPrice * 2 / 1e18
            else if (address1 === "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D")
                reserveUSD = userFarmDetails[userFarmDetailsKey].reserve1 * bnbPrice * 2 / 1e18
            else if (address0 === "0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055")
                reserveUSD = userFarmDetails[userFarmDetailsKey].reserve0 * chainPrice * 2 / 1e18
            else if (address1 === "0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055")
                reserveUSD = userFarmDetails[userFarmDetailsKey].reserve1 * chainPrice * 2 / 1e18
            else if (address0 === "0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F")
                reserveUSD = userFarmDetails[userFarmDetailsKey].reserve0 * ethPrice * 2 / 1e18
            else if (address1 === "0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F")
                reserveUSD = userFarmDetails[userFarmDetailsKey].reserve1 * ethPrice * 2 / 1e18
            else if (address0 === "0x21C718C22D52d0F3a789b752D4c2fD5908a8A733")
                reserveUSD = userFarmDetails[userFarmDetailsKey].reserve0 * rosePrice * 2 / 1e18
            else if (address1 === "0x21C718C22D52d0F3a789b752D4c2fD5908a8A733")
                reserveUSD = userFarmDetails[userFarmDetailsKey].reserve1 * rosePrice * 2 / 1e18
            const balanceUSD = (Number(totalSupply) / userFarmDetails[userFarmDetailsKey].lpTotalSupply) * Number(reserveUSD)

            const rewardPerBlock = ((farms[userFarmDetails[userFarmDetailsKey].pid.toNumber()].allocPoint
              / farms[userFarmDetails[userFarmDetailsKey].pid.toNumber()].owner.totalAllocPoint)
              * farms[userFarmDetails[userFarmDetailsKey].pid.toNumber()].owner.sushiPerBlock) / 1e18
            const roiPerBlock = (rewardPerBlock * sushiPrice) / balanceUSD
            farms[userFarmDetails[userFarmDetailsKey].pid.toNumber()].tvl = (reserveUSD / userFarmDetails[userFarmDetailsKey].lpTotalSupply) * userFarmDetails[userFarmDetailsKey].totalSupply
            farms[userFarmDetails[userFarmDetailsKey].pid.toNumber()].roiPerYear = roiPerBlock * 3600 / averageBlockTime * 24 * 30 * 12

        }
        if (account && rewardDebt) {

            // console.log('userFarmDetails:', userFarmDetails)
            const userFarms = userFarmDetails
                .filter((farm: any, index: number) => {
                    // @ts-ignore
                    return farm.balance.gt(BigNumber.from(0)) || farm.pending.gt(BigNumber.from(0)) || rewardDebt[index].unclaimedReward > 0
                })
                .map((farm: any) => {
                    //console.log('userFarm:', farm.pid.toNumber(), farm)

                    const pid = farm.pid.toNumber()
                    const farmDetails = sorted.find((pair: any) => pair.pid === pid)

                    // console.log('farmDetails:', farmDetails)
                    // console.log('farmDetails:', farm)
                    let deposited
                    let depositedUSD
                    deposited = Fraction.from(farm.balance, BigNumber.from(10).pow(18)).toString(18)
                    depositedUSD = (Number(deposited) * Number(farmDetails.tvl)) / (farm.lpTotalSupply / 1e18)

                    const pending = Fraction.from(farm.pending, BigNumber.from(10).pow(18)).toString(18)
                    // console.log(farms[pid])

                    return {
                        ...farmDetails,
                        type: farmDetails.type, // KMP or SLP
                        depositedLP: deposited,
                        depositedUSD: depositedUSD,
                        pendingBling: pending,
                    }
                })
            if(farms[0].pid === 0)
                [sorted[0],sorted[7]] = [sorted[7],sorted[0]]

            setFarms({ farms: sorted, userFarms: userFarms })
            // console.log('userFarms:', userFarms)
        } else {
            if(farms[0].pid === 0)
                [sorted[0],sorted[7]] = [sorted[7],sorted[0]]
            setFarms({ farms: sorted, userFarms: [] })
        }
    }, [account, boringHelperContract, rewardDebt, sushiPrice])


    useEffect(() => {
        fetchAllFarms()
        // fetchRewardDebts()
    }, [fetchAllFarms])
    useEffect(() => {
        fetchRewardDebts()
    }, [fetchRewardDebts])
    async function bnbFetcher() {
        let response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,chainlink,ethereum&vs_currencies=usd", {
            method: 'GET',
            redirect: 'follow'
        })
        let result = await response.text()
        return [JSON.parse(result).binancecoin.usd, JSON.parse(result).chainlink.usd, JSON.parse(result).ethereum.usd, 0.3]


    }

    return farms
}

function sortedBefore(address0:string, address1:string){
    return address0.toLowerCase() < address1.toLowerCase()
}


export default useFarms
