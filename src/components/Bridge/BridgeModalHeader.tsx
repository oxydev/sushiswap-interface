import { Trade, TradeType, ChainId } from '@sushiswap/sdk'
import React, { useContext, useMemo } from 'react'
import { ArrowDown, AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { isAddress, shortenAddress } from '../../utils'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import { TruncatedText, SwapShowAcceptChanges } from '../swap/styleds'
import { useActiveWeb3React } from '../../hooks'
import { networkData } from 'pages/Bridge'

export default function BridgeModalHeader({ trade, recipient }: { trade: any; recipient: string | null }) {
    const { chainId } = useActiveWeb3React()

    const theme = useContext(ThemeContext)

    return (
        <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
            <RowBetween align="flex-end">
                <RowFixed gap={'0px'}>
                    <CurrencyLogo
                        currency={trade.inputAmount.currency}
                        chain={trade.fromChain}
                        size={'24px'}
                        style={{ marginRight: '12px' }}
                    />
                    <TruncatedText fontSize={24} fontWeight={500} color={theme.primary1}>
                        {trade.inputAmount.toSignificant(6)}
                    </TruncatedText>
                </RowFixed>
                <RowFixed gap={'0px'}>
                    <Text fontSize={16} fontWeight={500} style={{ marginLeft: '10px' }}>
                        {trade.inputAmount.currency.getSymbol(chainId)}
                    </Text>
                    <Text fontSize={16} fontWeight={500} style={{ marginLeft: '10px', textOverflow: 'ellipsis' }}>
                        {trade.fromChainID}
                    </Text>
                </RowFixed>
            </RowBetween>
            <RowFixed>
                <ArrowDown size="16" color={theme.text2} style={{ marginLeft: '4px', minWidth: '16px' }} />
            </RowFixed>
            <RowBetween align="flex-end">
                <RowFixed gap={'0px'}>
                    <CurrencyLogo
                        currency={trade.outputAmount?.currency}
                        chain={trade.destChain}
                        size={'24px'}
                        style={{ marginRight: '12px' }}
                    />
                    <TruncatedText fontSize={24} fontWeight={500} color={theme.primary1}>
                        {trade.outputAmount.toSignificant(6)}
                    </TruncatedText>
                </RowFixed>
                <RowFixed gap={'0px'}>
                    <Text fontSize={16} fontWeight={500} style={{ marginLeft: '10px' }}>
                        {trade.outputAmount.currency.getSymbol(trade.destChain)}
                    </Text>
                    <Text fontSize={16} fontWeight={500} style={{ marginLeft: '10px', textOverflow: 'ellipsis' }}>
                        {trade.destChainID}
                    </Text>
                </RowFixed>
            </RowBetween>

            {/*{recipient !== null ? (*/}
            {/*    <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>*/}
            {/*        <TYPE.main>*/}
            {/*            Output will be sent to{' '}*/}
            {/*            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>*/}
            {/*        </TYPE.main>*/}
            {/*    </AutoColumn>*/}
            {/*) : null}*/}
        </AutoColumn>
    )
}
