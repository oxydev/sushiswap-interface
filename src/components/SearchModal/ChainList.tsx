import { Currency, CurrencyAmount, currencyEquals, ETHER, Token, StakePool, JSBI, ChainId } from '@sushiswap/sdk'
import React, { CSSProperties, MutableRefObject, useCallback, useMemo } from 'react'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { WrappedTokenInfo, useCombinedActiveList } from '../../state/lists/hooks'
import Column from '../Column'
import { MouseoverTooltip } from '../Tooltip'
import { LPMenuItem } from './styleds'
import Loader from '../Loader'
import useTheme from 'hooks/useTheme'
import { fixFloatFloor } from 'utils/fixFloat'
import chainData from '../../data/statics/bridgeChain.json'

function currencyKey(currency: Currency): string {
    return currency instanceof Token ? currency.address : currency === ETHER ? 'ETHER' : ''
}

const StyledBalanceText = styled(Text)`
    white-space: nowrap;
    overflow: hidden;
    max-width: 5rem;
    text-overflow: ellipsis;
`

const Tag = styled.div`
    background-color: ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text2};
    font-size: 14px;
    border-radius: 4px;
    padding: 0.25rem 0.3rem 0.25rem 0.3rem;
    max-width: 6rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    justify-self: flex-end;
    margin-right: 4px;
`

const FixedContentRow = styled.div`
    padding: 4px 20px;
    height: 56px;
    display: grid;
    grid-gap: 16px;
    align-items: center;
`

const TagContainer = styled.div`
    display: flex;
    justify-content: flex-end;
`

const TokenListLogoWrapper = styled.img`
    height: 20px;
`

function TokenTags({ currency }: { currency: Currency }) {
    if (!(currency instanceof WrappedTokenInfo)) {
        return <span />
    }

    const tags = currency.tags
    if (!tags || tags.length === 0) return <span />

    const tag = tags[0]

    return (
        <TagContainer>
            <MouseoverTooltip text={tag.description}>
                <Tag key={tag.id}>{tag.name}</Tag>
            </MouseoverTooltip>
            {tags.length > 1 ? (
                <MouseoverTooltip
                    text={tags
                        .slice(1)
                        .map(({ name, description }) => `${name}: ${description}`)
                        .join('; \n')}
                >
                    <Tag>...</Tag>
                </MouseoverTooltip>
            ) : null}
        </TagContainer>
    )
}

function ChainRow({
    chain,
    onSelect,
    isSelected,
    style
}: {
    chain: ChainId
    onSelect: () => void
    isSelected: boolean
    style: CSSProperties
}) {
    const { account, chainId } = useActiveWeb3React()
    const balance = chain

    // only show add or remove buttons if not on selected list
    return (
        <LPMenuItem style={style} onClick={() => (isSelected ? null : onSelect())} disabled={isSelected}>
            <span>Chain</span>
            <Column>
                <Text fontWeight={500}>{chainData.bridgeChain[chain].name}</Text>
            </Column>
            <p style={{ justifySelf: 'flex-end' }}>{chain ? <Text>--</Text> : account ? <Loader /> : null}</p>
        </LPMenuItem>
    )
}

export default function ChainList({
    height,
    chains,
    selectedChain,
    onChainSelect,
    fixedListRef
}: {
    height: number
    chains: number[]
    selectedChain?: number | null
    onChainSelect: (chain: ChainId) => void
    fixedListRef?: MutableRefObject<FixedSizeList | undefined>
}) {
    const { chainId } = useActiveWeb3React()
    const itemData: (number | undefined)[] = useMemo(() => {
        const formatted: (number | undefined)[] = chains
        return formatted
    }, [chains])

    const theme = useTheme()

    const Row = useCallback(
        ({ data, index, style }) => {
            const chain: number = data[index]
            const isSelected = Boolean(selectedChain)
            const handleSelect = () => onChainSelect(chain)
            return <ChainRow style={style} chain={chain} isSelected={false} onSelect={handleSelect} />
        },
        [chainId, chains, theme.text1]
    )

    return (
        <FixedSizeList
            height={height}
            ref={fixedListRef as any}
            width="100%"
            itemData={itemData}
            itemCount={itemData.length}
            itemSize={56}
        >
            {Row}
        </FixedSizeList>
    )
}
