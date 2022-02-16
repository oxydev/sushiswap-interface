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
    const myBalances = useMyLpBalanceListInPark(account ,["0x63B99848A1714A8b04D21B3a1511B4957001cA10"])
    // menu ui
    const [open, toggle] = useToggle(false)
    const node = useRef<HTMLDivElement>()
    useOnClickOutside(node, open ? toggle : undefined)
    // const [poolList, statics] = useMyAllStakePoolList()
    const pools: StakePool[] = [new StakePool({
        token0: WETH[chainId ?? DefaultChainId],
        token1: new Token((chainId ?? DefaultChainId), "0x007906a1f7f34865d6bAc41eeD4Ea3ffF4eE7cf4", 18, "A", "AAA"),
        // token0Balance: JSBI.BigInt(park.token0Balance),
        token0Balance: JSBI.BigInt(0),
        // token1Balance: JSBI.BigInt(park.token1Balance),
        token1Balance: JSBI.BigInt(0),
        // lpAddress: park.lpAddress,
        lpAddress: "0x63B99848A1714A8b04D21B3a1511B4957001cA10",
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
    })]

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
