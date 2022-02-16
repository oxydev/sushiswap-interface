import { CurrencyAmount, TokenAmount, ROUTER_ADDRESS, ZOO_ZAP_ADDRESS, Pair, WETH } from '@sushiswap/sdk'
import { useZooZapExtContract } from './useContract'
import { useSingleCallResult } from '../state/multicall/hooks'
import { useActiveWeb3React } from '../hooks'
import { DefaultChainId } from '../constants'
import { usePairContract } from 'hooks/useContract'
import { useCallback, useMemo } from 'react'
import { calculateGasMargin } from 'utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from 'state/transactions/hooks'
import { tokenAmountForshow } from 'utils/BlingSwap'

// query how much lp amount can zap
export function useEstimateZapInTokenLpAmount(inToken: CurrencyAmount | null, pair: Pair | null): TokenAmount | null {
    const { chainId } = useActiveWeb3React()
    const toLpAddress = pair?.liquidityToken.address
    // console.log(ZOO_ZAP_ADDRESS[chainId ?? DefaultChainId])
    const contract = useZooZapExtContract(ZOO_ZAP_ADDRESS[chainId ?? DefaultChainId], false)
    const wToken = WETH[chainId || DefaultChainId]
    const tokenAddr = inToken instanceof TokenAmount ? inToken?.token.address || '' : wToken.address
    const tokenAmount = inToken?.raw.toString() || ''

    const argsValide = tokenAddr != '' && toLpAddress != '' && tokenAmount != ''

    const [token0Amount, token1Amount] =
        useSingleCallResult(argsValide ? contract : undefined, 'estimateZapInToken', [
            tokenAddr,
            toLpAddress,
            tokenAmount
        ]).result || []
    //    console.log("token0Amount ",token0Amount ," token1Amount ",token1Amount)
    const pairContract = usePairContract(toLpAddress)
    const totalSupply =
        useSingleCallResult(argsValide && token0Amount && token1Amount ? pairContract : undefined, 'totalSupply', [])
            .result?.[0] || 0

    const [token0, token1] =
        pair && token0Amount && token1Amount
            ? [new TokenAmount(pair?.token0, token0Amount), new TokenAmount(pair?.token1, token1Amount)]
            : []
    const tokenSupplyToken = totalSupply && pair ? new TokenAmount(pair.liquidityToken, totalSupply) : null

    const expectLiquidityMinted = useMemo(() => {
        if (pair && tokenSupplyToken && token0 && token1) {
            return pair.getLiquidityMinted(tokenSupplyToken, token0, token1)
        } else {
            return null
        }
    }, [token0, token1, chainId, pair, tokenSupplyToken])

    return expectLiquidityMinted
}

// zap from token -> lp
export function useZapInTokenLpAmount(
    inToken: CurrencyAmount | null,
    pair: Pair | null
): (callback: any, failedCallback: any) => Promise<void> {
    //  nAddr: string, tokenAmount: string
    const toLpAddress = pair?.liquidityToken.address
    const { chainId, account } = useActiveWeb3React()
    const zapContract = useZooZapExtContract(ZOO_ZAP_ADDRESS[chainId ?? DefaultChainId], true)
    const routerAddr = ROUTER_ADDRESS[chainId ?? DefaultChainId]
    const addTransaction = useTransactionAdder()
    const isNative = inToken instanceof TokenAmount ? false : true
    const tokenAddr = inToken instanceof TokenAmount ? inToken?.token.address : ''
    const tokenAmount = inToken?.raw.toString() || ''

    return useCallback(
        async (callback: any, failedCallback: any): Promise<void> => {
            if (!zapContract) {
                return
            }
            const estimatedGas = isNative
                ? await zapContract.estimateGas
                      .zapIn(toLpAddress, routerAddr, account, { value: tokenAmount })
                      .catch(() => {
                          return zapContract?.estimateGas.zapIn(toLpAddress, account, {
                              value: tokenAmount
                          })
                      })
                : await zapContract.estimateGas
                      .zapInToken(tokenAddr, tokenAmount, toLpAddress, account)
                      .catch(() => {
                          return zapContract?.estimateGas.zapInToken(
                              tokenAddr,
                              tokenAmount,
                              toLpAddress,
                              routerAddr,
                              account
                          )
                      })
            if (!(inToken instanceof TokenAmount)) {
                return zapContract
                    .zapIn(toLpAddress, account, {
                        gasLimit: calculateGasMargin(estimatedGas),
                        value: tokenAmount
                    })
                    .then((response: TransactionResponse) => {
                        addTransaction(response, {
                            summary: `zapIn:   ${tokenAmountForshow(inToken?.raw, inToken?.currency.decimals)} ${
                                inToken?.currency.name
                            }  to ${pair?.token0.name}-${pair?.token1.name} LP`
                        })
                    })
                    .then(callback)
                    .catch((error: Error) => {
                        console.debug('Failed to zapIn token', error)
                        if (failedCallback) {
                            failedCallback(error)
                        }
                    })
            } else {
                return zapContract
                    .zapInToken(tokenAddr, tokenAmount, toLpAddress, account, {
                        gasLimit: calculateGasMargin(estimatedGas)
                    })
                    .then((response: TransactionResponse) => {
                        addTransaction(response, {
                            summary: `zapInToken:   ${tokenAmountForshow(inToken?.raw, inToken?.token.decimals)} ${
                                inToken?.token.name
                            }  to ${pair?.token0.name}-${pair?.token1.name} LP`
                        })
                    })
                    .then(callback)
                    .catch((error: Error) => {
                        console.debug('Failed to zapInToken token', error)
                        if (failedCallback) {
                            failedCallback(error)
                        }
                    })
            }
        },
        [tokenAddr, tokenAmount, toLpAddress, zapContract]
    )
}
