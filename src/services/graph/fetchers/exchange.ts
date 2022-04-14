import { ChainId } from '@sushiswap/sdk'
import { GRAPH_HOST } from '../constants'
import {
    dayDatasQuery,
    ethPriceQuery,
    factoryQuery,
    liquidityPositionsQuery,
    pairDayDatasQuery,
    pairsQuery,
    tokenDayDatasQuery,
    tokenPairsQuery,
    tokenPriceQuery,
    tokenQuery,
    tokensQuery,
    tokenSubsetQuery,
    transactionsQuery
} from '../queries/exchange'

import { pager } from './pager'

export const EXCHANGE = {
    [ChainId.MAINNET]: 'generated/sample'
}

// @ts-ignore TYPE NEEDS FIXING
export const exchange = async (chainId = ChainId.MAINNET, query, variables = {}) =>
    // @ts-ignore TYPE NEEDS FIXING
    pager(`${GRAPH_HOST[chainId]}/subgraphs/name/${EXCHANGE[chainId]}`, query, variables)

export const getPairs = async (chainId = ChainId.MAINNET, variables = undefined, query = pairsQuery) => {
    const { pairs } = await exchange(chainId, query, variables)
    return pairs
}

// @ts-ignore TYPE NEEDS FIXING
export const getPairDayData = async (chainId = ChainId.MAINNET, variables) => {
    // console.log('getTokens')
    const { pairDayDatas } = await exchange(chainId, pairDayDatasQuery, variables)
    return pairDayDatas
}

// @ts-ignore TYPE NEEDS FIXING
export const getTokenSubset = async (chainId = ChainId.MAINNET, variables) => {
    // console.log('getTokenSubset')
    const { tokens } = await exchange(chainId, tokenSubsetQuery, variables)
    return tokens
}

// @ts-ignore TYPE NEEDS FIXING
export const getTokens = async (chainId = ChainId.MAINNET, variables) => {
    // console.log('getTokens')
    const { tokens } = await exchange(chainId, tokensQuery, variables)
    return tokens
}

// @ts-ignore TYPE NEEDS FIXING
export const getToken = async (chainId = ChainId.MAINNET, query = tokenQuery, variables) => {
    // console.log('getTokens')
    const { token } = await exchange(chainId, query, variables)
    return token
}

// @ts-ignore TYPE NEEDS FIXING
export const getTokenDayData = async (chainId = ChainId.MAINNET, variables) => {
    // console.log('getTokens')
    const { tokenDayDatas } = await exchange(chainId, tokenDayDatasQuery, variables)
    return tokenDayDatas
}

// @ts-ignore TYPE NEEDS FIXING
export const getTokenPrices = async (chainId = ChainId.MAINNET, variables) => {
    // console.log('getTokenPrice')
    const { tokens } = await exchange(chainId, tokensQuery, variables)
    // @ts-ignore TYPE NEEDS FIXING
    return tokens.map(token => token?.derivedETH)
}

// @ts-ignore TYPE NEEDS FIXING
export const getTokenPrice = async (chainId = ChainId.MAINNET, query, variables) => {
    // console.log('getTokenPrice')
    const nativePrice = await getNativePrice(chainId)

    const { token } = await exchange(chainId, query, variables)
    return token?.derivedETH * nativePrice
}

export const getNativePrice = async (chainId = ChainId.MAINNET, variables = undefined) => {
    // console.log('getEthPrice')
    const data = await getBundle(chainId, undefined, variables)
    return data?.bundles[0]?.ethPrice
}

export const getEthPrice = async (variables = undefined) => {
    return getNativePrice(ChainId.MAINNET, variables)
}

export const getSushiPrice = async (variables = {}) => {
    // console.log('getSushiPrice')
    return getTokenPrice(ChainId.MAINNET, tokenPriceQuery, {
        id: '0x72Ad551af3c884d02e864B182aD9A34EE414C36C',
        ...variables
    })
}

export const getBundle = async (
    chainId = ChainId.MAINNET,
    query = ethPriceQuery,
    variables = {
        id: 1
    }
) => {
    return exchange(chainId, query, variables)
}

// @ts-ignore TYPE NEEDS FIXING
export const getLiquidityPositions = async (chainId = ChainId.MAINNET, variables) => {
    const { liquidityPositions } = await exchange(chainId, liquidityPositionsQuery, variables)
    return liquidityPositions
}

export const getDayData = async (chainId = ChainId.MAINNET, variables = undefined) => {
    const { dayDatas } = await exchange(chainId, dayDatasQuery, variables)
    return dayDatas
}

export const getFactory = async (chainId = ChainId.MAINNET, variables = undefined) => {
    const { factories } = await exchange(chainId, factoryQuery, variables)
    return factories[0]
}

export const getTransactions = async (chainId = ChainId.MAINNET, variables = undefined) => {
    const { swaps } = await exchange(chainId, transactionsQuery, variables)
    return swaps
}

export const getTokenPairs = async (chainId = ChainId.MAINNET, variables = undefined) => {
    const { pairs0, pairs1 } = await exchange(chainId, tokenPairsQuery, variables)
    return pairs0 || pairs1 ? [...(pairs0 ? pairs0 : []), ...(pairs1 ? pairs1 : [])] : undefined
}
