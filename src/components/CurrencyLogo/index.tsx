import { Currency, ETHER, Token, ChainId } from '@sushiswap/sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import EthereumLogo from '../../assets/images/ethereum-logo.png'
import BinanceCoinLogo from '../../assets/images/binance-coin-logo.png'
import FantomLogo from '../../assets/images/fantom-logo.png'
import MaticLogo from '../../assets/images/matic-logo.png'
import xDaiLogo from '../../assets/images/xdai-logo.png'
import MoonbeamLogo from '../../assets/images/moonbeam-logo.png'
import AvalancheLogo from '../../assets/images/avalanche-logo.png'
import HecoLogo from '../../assets/images/heco-logo.png'
import Tether from '../../assets/images/tether.png'
import Tulip from '../../assets/images/tulip.png'
import Tulip2 from '../../assets/images/Tulip2.png'
import Dune from '../../assets/images/dune.png'
import Yuzu from '../../assets/images/yuzu.png'
import Bitcoin from '../../assets/images/bitcoin.png'
import Bling from '../../assets/images/main_logo.png'
import OKTLogo from '../../assets/images/logo-rose.png'
import OasisRoseToken from '../../assets/images/logo-rose.png'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'
import { useActiveWeb3React } from '../../hooks'

const tokenLogos: Record<string, string> = {
    '0xdC19A122e268128B5eE20366299fc7b5b199C8e3': Tether,
    '0x2736643C7fFFe186984f60a2d34b91b1b7398bF1': Tulip,
    '0x9e832CaE5d19e7ff2f0D62881D1E33bb16Ac9bdc': Tulip2,
    '0xaC5487bFE2502eCc06e057912b6F4946471093b9': Dune,
    '0xf02b3e437304892105992512539F769423a515Cb': Yuzu,
    '0xd43ce0aa2a29DCb75bDb83085703dc589DE6C7eb': Bitcoin,
    '0xc9273cac55e68407d11477a44dB3d269af1cee12': Bling,
    '0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F':
        'https://raw.githubusercontent.com/trustwallet/assets/ec4f6c94a95bcddda22fe25659cf02d1d5d67bfc/blockchains/ethereum/info/logo.png'
}
const getTokenLogoURL = (address: string) => {
    if (address in tokenLogos) return tokenLogos[address]
    return 'https://raw.githubusercontent.com/trustwallet/assets/ad3cfa2e1c8e4b295cd81d64ecc5ab2a9514f79e/blockchains/oasis/info/logo.png'
}

const StyledNativeCurrencyLogo = styled.img<{ size: string }>`
    width: ${({ size }) => size};
    height: ${({ size }) => size};
    box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
    border-radius: 24px;
`

const StyledLogo = styled(Logo)<{ size: string }>`
    width: ${({ size }) => size};
    height: ${({ size }) => size};
    border-radius: ${({ size }) => size};
    box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
    background-color: ${({ theme }) => theme.white};
`

const logo: { readonly [chainId in ChainId]?: string } = {
    [ChainId.MAINNET]: EthereumLogo,
    [ChainId.FANTOM]: FantomLogo,
    [ChainId.FANTOM_TESTNET]: FantomLogo,
    [ChainId.MATIC]: MaticLogo,
    [ChainId.MATIC_TESTNET]: MaticLogo,
    [ChainId.XDAI]: xDaiLogo,
    [ChainId.BSC]: BinanceCoinLogo,
    [ChainId.BSC_TESTNET]: BinanceCoinLogo,
    [ChainId.MOONBASE]: MoonbeamLogo,
    [ChainId.AVALANCHE]: AvalancheLogo,
    [ChainId.FUJI]: AvalancheLogo,
    [ChainId.HECO]: HecoLogo,
    [ChainId.HECO_TESTNET]: HecoLogo,
    [ChainId.OKCHAIN]: OKTLogo,
    [ChainId.OKCHAIN_TEST]: OKTLogo,
    [ChainId.OASISETH_TEST]: OasisRoseToken,
    [ChainId.OASISETH_MAIN]: OasisRoseToken
}

export default function CurrencyLogo({
    currency,
    size = '24px',
    style
}: {
    currency?: Currency
    size?: string
    style?: React.CSSProperties
}) {
    const { chainId } = useActiveWeb3React()
    const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

    const srcs: string[] = useMemo(() => {
        if (currency === ETHER) return []

        if (currency instanceof Token) {
            if (currency instanceof WrappedTokenInfo) {
                return [...uriLocations, getTokenLogoURL(currency.address)]
            }

            return [getTokenLogoURL(currency.address)]
        }
        return []
    }, [currency, uriLocations])

    if (currency === ETHER && chainId) {
        return <StyledNativeCurrencyLogo src={logo[chainId]} size={size} style={style} />
    }

    return <StyledLogo size={size} srcs={srcs} alt={`${currency?.getSymbol(chainId) ?? 'token'} logo`} style={style} />
}
