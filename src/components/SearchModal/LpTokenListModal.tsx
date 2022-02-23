import { Token, StakePool, WETH, JSBI, AttenuationReward } from '@sushiswap/sdk'
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import Modal from '../Modal'
import Column from '../Column'
import styled from 'styled-components'
import LpTokenList from './LpTokenList'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useAllTokens, useToken, useIsUserAddedToken, useFoundOnInactiveList } from '../../hooks/Tokens'
import { filterTokens, useSortedTokensByQuery } from './filtering'
import { useTokenComparator } from './sorting'
import useToggle from 'hooks/useToggle'
import { FixedSizeList } from 'react-window'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import Row, { RowBetween, RowFixed } from '../Row'
import { CloseIcon, TYPE, ButtonText, IconWrapper } from '../../theme'
import { Text } from 'rebass'
import { useTranslation } from 'react-i18next'
import { useActiveWeb3React } from '../../hooks'
import { DefaultChainId } from '../../constants'
import { useMultipleContractSingleData } from '../../state/multicall/hooks'
import ERC20_INTERFACE from '../../constants/abis/erc20'

const ContentWrapper = styled(Column)`
    width: 100%;
    flex: 1 1;
    position: relative;
`

function useMyLpBalanceListInPark(address: any, lpaddrs:string[]): JSBI[] {
    const { account } = useActiveWeb3React()
    const accountArg = useMemo(() => [account ?? undefined], [account])
    // get all the info from the staking rewards contracts
    const balances = useMultipleContractSingleData(lpaddrs, ERC20_INTERFACE, 'balanceOf', accountArg)

    return balances.map((p, i) => {
        const amount = balances[i]?.result?.[0] ?? "0"
        return JSBI.BigInt(amount)
    })
}

interface LpTokenListModalProps {
    isOpen: boolean
    onDismiss: () => void
    selectedPool?: StakePool | null
    onPoolSelect: (pool: StakePool) => void
    showCommonBases?: boolean
}

export default function LpTokenListModal({
    isOpen,
    onDismiss,
    onPoolSelect,
    selectedPool,
    showCommonBases = false
}: LpTokenListModalProps) {
    const { chainId, account} = useActiveWeb3React()

    const handlePoolSelect = useCallback(
        (pool: StakePool) => {
            onPoolSelect(pool)
            onDismiss()
        },
        [onDismiss, onPoolSelect]
    )

    // change min height if not searching
    const minHeight = 80

    const { t } = useTranslation()
    const myBalances = useMyLpBalanceListInPark(account ,[
      "0xD9F3Be6497B26EFBEd163A95912FB5e2F235Fd53",
        "0x7Bf986f1373B5554634aF98A9772BaA2085fc84F",
        "0xe593c42780ccbe7723B67b3E5FD3e0cdd2E25017",
        "0x89f5e345b7837E950136811b94af6CcBa199eFa8",
        "0x41953bAca0A634732365093f848CcFc968EF0C69",
        "0xbf6ABe88a1A780d17786A82c93b56941a281DB66"])
    // menu ui
    const [open, toggle] = useToggle(false)
    const node = useRef<HTMLDivElement>()
    useOnClickOutside(node, open ? toggle : undefined)
    // const [poolList, statics] = useMyAllStakePoolList()
    const pools: StakePool[] = useMemo(() => {
        return [
        new StakePool({
        token0: WETH[chainId ?? DefaultChainId],
        token1: new Token((chainId ?? DefaultChainId), "0xdC19A122e268128B5eE20366299fc7b5b199C8e3", 6, "weUSDT", "Tether USD (Wormhole)"),
        // token0Balance: JSBI.BigInt(park.token0Balance),
        token0Balance: JSBI.BigInt(0),
        // token1Balance: JSBI.BigInt(park.token1Balance),
        token1Balance: JSBI.BigInt(0),
        // lpAddress: park.lpAddress,
        lpAddress: "0xD9F3Be6497B26EFBEd163A95912FB5e2F235Fd53",
        // totalLp: JSBI.BigInt(park.totalLp),
        totalLp: JSBI.BigInt(0),
        // totalLpInPark: JSBI.BigInt(park.totalLpInPark),
        totalLpInPark: JSBI.BigInt(0),
        // rewardEffect: park.rewardEffect,
        rewardEffect: 0,
        // lastRewardBlock: park.lastRewardBlock,
        lastRewardBlock: 0,
        rewardConfig: new AttenuationReward({ startBlock: 0, zooPerBlock: JSBI.BigInt(0), halfAttenuationCycle: 0 }),
        myLpBalance: myBalances[0]||JSBI.BigInt(0),
        myCurrentLp: JSBI.BigInt(0),
        myReward: JSBI.BigInt(0),
        pid: 0,
    }),
        new StakePool({
            token0: new Token((chainId ?? DefaultChainId), "0xdC19A122e268128B5eE20366299fc7b5b199C8e3", 6, "weUSDT", "Tether USD (Wormhole)"),
            token1: new Token((chainId ?? DefaultChainId), "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844", 6, "USDC", "Multichain - USD Coin"),
            // token0Balance: JSBI.BigInt(park.token0Balance),
            token0Balance: JSBI.BigInt(0),
            // token1Balance: JSBI.BigInt(park.token1Balance),
            token1Balance: JSBI.BigInt(0),
            // lpAddress: park.lpAddress,
            lpAddress: "0x7Bf986f1373B5554634aF98A9772BaA2085fc84F",
            // totalLp: JSBI.BigInt(park.totalLp),
            totalLp: JSBI.BigInt(0),
            // totalLpInPark: JSBI.BigInt(park.totalLpInPark),
            totalLpInPark: JSBI.BigInt(0),
            // rewardEffect: park.rewardEffect,
            rewardEffect: 0,
            // lastRewardBlock: park.lastRewardBlock,
            lastRewardBlock: 0,
            rewardConfig: new AttenuationReward({ startBlock: 0, zooPerBlock: JSBI.BigInt(0), halfAttenuationCycle: 0 }),
            myLpBalance: myBalances[1]||JSBI.BigInt(0),
            myCurrentLp: JSBI.BigInt(0),
            myReward: JSBI.BigInt(0),
            pid: 1,
        }),
        new StakePool({
            token0: WETH[chainId ?? DefaultChainId],
            token1: new Token((chainId ?? DefaultChainId), "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C", 18, "BUSD", "Multichain - Binance-Peg BUSD Token"),
            // token0Balance: JSBI.BigInt(park.token0Balance),
            token0Balance: JSBI.BigInt(0),
            // token1Balance: JSBI.BigInt(park.token1Balance),
            token1Balance: JSBI.BigInt(0),
            // lpAddress: park.lpAddress,
            lpAddress: "0xe593c42780ccbe7723B67b3E5FD3e0cdd2E25017",
            // totalLp: JSBI.BigInt(park.totalLp),
            totalLp: JSBI.BigInt(0),
            // totalLpInPark: JSBI.BigInt(park.totalLpInPark),
            totalLpInPark: JSBI.BigInt(0),
            // rewardEffect: park.rewardEffect,
            rewardEffect: 0,
            // lastRewardBlock: park.lastRewardBlock,
            lastRewardBlock: 0,
            rewardConfig: new AttenuationReward({ startBlock: 0, zooPerBlock: JSBI.BigInt(0), halfAttenuationCycle: 0 }),
            myLpBalance: myBalances[2]||JSBI.BigInt(0),
            myCurrentLp: JSBI.BigInt(0),
            myReward: JSBI.BigInt(0),
            pid: 2,
        }),
        new StakePool({
            token0: WETH[chainId ?? DefaultChainId],
            token1: new Token((chainId ?? DefaultChainId), "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844", 6, "USDC", "Multichain - USD Coin"),
            // token0Balance: JSBI.BigInt(park.token0Balance),
            token0Balance: JSBI.BigInt(0),
            // token1Balance: JSBI.BigInt(park.token1Balance),
            token1Balance: JSBI.BigInt(0),
            // lpAddress: park.lpAddress,
            lpAddress: "0x89f5e345b7837E950136811b94af6CcBa199eFa8",
            // totalLp: JSBI.BigInt(park.totalLp),
            totalLp: JSBI.BigInt(0),
            // totalLpInPark: JSBI.BigInt(park.totalLpInPark),
            totalLpInPark: JSBI.BigInt(0),
            // rewardEffect: park.rewardEffect,
            rewardEffect: 0,
            // lastRewardBlock: park.lastRewardBlock,
            lastRewardBlock: 0,
            rewardConfig: new AttenuationReward({ startBlock: 0, zooPerBlock: JSBI.BigInt(0), halfAttenuationCycle: 0 }),
            myLpBalance: myBalances[3]||JSBI.BigInt(0),
            myCurrentLp: JSBI.BigInt(0),
            myReward: JSBI.BigInt(0),
            pid: 3,
        }),
        new StakePool({
            token0: WETH[chainId ?? DefaultChainId],
            token1: new Token((chainId ?? DefaultChainId), "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D", 18, "BNB", "Multichain - Binance"),
            // token0Balance: JSBI.BigInt(park.token0Balance),
            token0Balance: JSBI.BigInt(0),
            // token1Balance: JSBI.BigInt(park.token1Balance),
            token1Balance: JSBI.BigInt(0),
            // lpAddress: park.lpAddress,
            lpAddress: "0x41953bAca0A634732365093f848CcFc968EF0C69",
            // totalLp: JSBI.BigInt(park.totalLp),
            totalLp: JSBI.BigInt(0),
            // totalLpInPark: JSBI.BigInt(park.totalLpInPark),
            totalLpInPark: JSBI.BigInt(0),
            // rewardEffect: park.rewardEffect,
            rewardEffect: 0,
            // lastRewardBlock: park.lastRewardBlock,
            lastRewardBlock: 0,
            rewardConfig: new AttenuationReward({ startBlock: 0, zooPerBlock: JSBI.BigInt(0), halfAttenuationCycle: 0 }),
            myLpBalance: myBalances[4]||JSBI.BigInt(0),
            myCurrentLp: JSBI.BigInt(0),
            myReward: JSBI.BigInt(0),
            pid: 4,
        }),
        new StakePool({
            token0: WETH[chainId ?? DefaultChainId],
            token1: new Token((chainId ?? DefaultChainId), "0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055", 18, "LINK", "ChainLink Token"),
            // token0Balance: JSBI.BigInt(park.token0Balance),
            token0Balance: JSBI.BigInt(0),
            // token1Balance: JSBI.BigInt(park.token1Balance),
            token1Balance: JSBI.BigInt(0),
            // lpAddress: park.lpAddress,
            lpAddress: "0xbf6ABe88a1A780d17786A82c93b56941a281DB66",
            // totalLp: JSBI.BigInt(park.totalLp),
            totalLp: JSBI.BigInt(0),
            // totalLpInPark: JSBI.BigInt(park.totalLpInPark),
            totalLpInPark: JSBI.BigInt(0),
            // rewardEffect: park.rewardEffect,
            rewardEffect: 0,
            // lastRewardBlock: park.lastRewardBlock,
            lastRewardBlock: 0,
            rewardConfig: new AttenuationReward({ startBlock: 0, zooPerBlock: JSBI.BigInt(0), halfAttenuationCycle: 0 }),
            myLpBalance: myBalances[5]||JSBI.BigInt(0),
            myCurrentLp: JSBI.BigInt(0),
            myReward: JSBI.BigInt(0),
            pid: 5,
        })
    ]
    },[myBalances])

    const allTokens = useAllTokens()
    const [invertSearchOrder] = useState<boolean>(false)
    const tokenComparator = useTokenComparator(invertSearchOrder)

    const allArrayTokens: Token[] = useMemo(() => {
        return filterTokens(Object.values(allTokens), '')
    }, [allTokens])

    const sortedTokens: Token[] = useMemo(() => {
        return allArrayTokens.sort(tokenComparator)
    }, [allArrayTokens, tokenComparator])

    const fixedList = useRef<FixedSizeList>()

    return (
        <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={80} minHeight={minHeight}>
            <ContentWrapper>
                <RowBetween style={{ padding: '10px 20px' }}>
                    <Text fontWeight={500} fontSize={16}>
                        Select A LP Token
                    </Text>
                    <CloseIcon onClick={onDismiss} />
                </RowBetween>
                <div style={{ flex: '1' }}>
                    <AutoSizer disableWidth>
                        {({ height }) => (
                            <LpTokenList
                                height={height}
                                pools={pools}
                                onPoolSelect={handlePoolSelect}
                                selectedpool={selectedPool}
                                fixedListRef={fixedList}
                            />
                        )}
                    </AutoSizer>
                </div>
            </ContentWrapper>
        </Modal>
    )
}
