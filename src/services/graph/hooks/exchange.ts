import { ChainId } from '@sushiswap/sdk'
import { useActiveWeb3React } from '../../../hooks'
import stringify from 'fast-json-stable-stringify'
import useSWR, { SWRConfiguration } from 'swr'

import {
    getBundle,
    getDayData,
    getFactory,
    getLiquidityPositions,
    getNativePrice,
    getPairDayData,
    getPairs,
    getSushiPrice,
    getTokenDayData,
    getTokenPairs,
    getTokens
} from '../fetchers/exchange'
import { GraphProps } from '../interfaces/graphProps'
import { ethPriceQuery } from '../queries/exchange'

export function useFactory({
    chainId = ChainId.MAINNET,
    variables,
    shouldFetch = true,
    swrConfig = undefined
}: GraphProps) {
    const { data } = useSWR(
        shouldFetch ? ['factory', chainId, stringify(variables)] : null,
        // @ts-ignore TYPE NEEDS FIXING
        () => getFactory(chainId, variables),
        swrConfig
    )
    return data
}

export function useNativePrice({
    chainId = ChainId.MAINNET,
    variables,
    shouldFetch = true,
    swrConfig = undefined
}: GraphProps) {
    const { data } = useSWR(
        shouldFetch ? ['nativePrice', chainId, stringify(variables)] : null,
        // @ts-ignore TYPE NEEDS FIXING
        () => getNativePrice(chainId, variables),
        swrConfig
    )

    return data
}

// @ts-ignore TYPE NEEDS FIXING
export function useEthPrice(variables = undefined, swrConfig: SWRConfiguration = undefined) {
    const { data } = useSWR(['ethPrice'], () => getNativePrice(variables), swrConfig)
    return data
}

// @ts-ignore TYPE NEEDS FIXING
export function useSushiPrice(swrConfig: SWRConfiguration = undefined) {
    const { data } = useSWR(['sushiPrice'], () => getSushiPrice(), swrConfig)
    return data
}

// @ts-ignore TYPE NEEDS FIXING
export function useBundle(variables = undefined, swrConfig: SWRConfiguration = undefined) {
    const { chainId } = useActiveWeb3React()
    const { data } = useSWR(
        chainId ? [chainId, ethPriceQuery, stringify(variables)] : null,
        () => getBundle(),
        swrConfig
    )
    return data
}

export function useLiquidityPositions({
    chainId = ChainId.MAINNET,
    variables,
    shouldFetch = true,
    swrConfig = undefined
}: GraphProps) {
    const { data } = useSWR(
        shouldFetch ? ['liquidityPositions', chainId, stringify(variables)] : null,
        (_, chainId) => getLiquidityPositions(chainId, variables),
        swrConfig
    )
    return data
}

export function useSushiPairs({
    chainId = ChainId.MAINNET,
    variables,
    shouldFetch = true,
    swrConfig = undefined
}: GraphProps) {
    const { data } = useSWR(
        shouldFetch ? ['sushiPairs', chainId, stringify(variables)] : null,
        // @ts-ignore TYPE NEEDS FIXING
        (_, chainId) => getPairs(chainId, variables),
        swrConfig
    )
    return data
}

export function useTokens({
    chainId = ChainId.MAINNET,
    variables,
    shouldFetch = true,
    swrConfig = undefined
}: GraphProps) {
    const { data } = useSWR(
        shouldFetch ? ['tokens', chainId, stringify(variables)] : null,
        (_, chainId) => getTokens(chainId, variables),
        swrConfig
    )
    return data
}

export function usePairDayData({
    chainId = ChainId.MAINNET,
    variables,
    shouldFetch = true,
    swrConfig = undefined
}: GraphProps) {
    const { data } = useSWR(
        shouldFetch && !!chainId ? ['pairDayData', chainId, stringify(variables)] : null,
        (_, chainId) => getPairDayData(chainId, variables),
        swrConfig
    )
    return data
}

export function useTokenDayData(
    { chainId, variables, shouldFetch = true }: GraphProps,
    // @ts-ignore TYPE NEEDS FIXING
    swrConfig: SWRConfiguration = undefined
) {
    const { data } = useSWR(
        shouldFetch && !!chainId ? ['tokenDayData', chainId, stringify(variables)] : null,
        (_, chainId) => getTokenDayData(chainId, variables),
        swrConfig
    )
    return data
}

export function useDayData({ chainId, variables, shouldFetch = true, swrConfig = undefined }: GraphProps) {
    const { data } = useSWR(
        shouldFetch && !!chainId ? ['dayData', chainId, stringify(variables)] : null,
        // @ts-ignore TYPE NEEDS FIXING
        (_, chainId) => getDayData(chainId, variables),
        swrConfig
    )
    return data
}

export function useTokenPairs({
    chainId = ChainId.MAINNET,
    variables,
    shouldFetch = true,
    swrConfig = undefined
}: GraphProps) {
    const { data } = useSWR(
        shouldFetch ? ['tokenPairs', chainId, stringify(variables)] : null,
        // @ts-ignore TYPE NEEDS FIXING
        (_, chainId) => getTokenPairs(chainId, variables),
        swrConfig
    )
    return data
}
