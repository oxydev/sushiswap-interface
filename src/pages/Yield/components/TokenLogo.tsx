import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import PlaceHolder from 'assets/images/placeholder.png'
import KashiLogo from 'assets/kashi/kashi-neon.png'
import Tether from '../../../assets/images/tether.png'
import Tulip from '../../../assets/images/tulip.png'
import Tulip2 from '../../../assets/images/Tulip2.png'
import Dune from '../../../assets/images/dune.png'
import Yuzu from '../../../assets/images/yuzu.png'
import Bitcoin from '../../../assets/images/bitcoin.png'
import Bling from '../../../assets/images/main_logo.png'
import Binance from '../../../assets/images/binance.png'
import OasisApe from '../../../assets/images/oasis-apes.png'

//import EthereumLogo from "../../assets/img/eth.png";

const isAddress = (value: any) => {
    try {
        return ethers.utils.getAddress(value.toLowerCase())
    } catch {
        return false
    }
}

//const BAD_IMAGES = {}

const Inline = styled.div`
    display: flex;
    align-items: center;
    align-self: center;
`

const Image = styled.img<{ size: number }>`
    width: ${({ size }) => size};
    height: ${({ size }) => size};
    max-width: 100px;
    border-radius: 50%;
`
// background-color: white;
// box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);

export default function TokenLogo({ address, header = false, size, ...rest }: any) {
    const [error, setError] = useState(false)

    useEffect(() => {
        setError(false)
    }, [address])

    //if (error || BAD_IMAGES[address]) {
    if (error) {
        return (
            <Inline>
                <Image {...rest} alt={''} src={PlaceHolder} size={size} />
            </Inline>
        )
    }

    if (address === 'kashiLogo') {
        return (
            <Inline>
                <Image {...rest} alt={''} src={KashiLogo} size={size} />
            </Inline>
        )
    }
    // hard coded fixes for trust wallet api issues
    if (address?.toLowerCase() === '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb') {
        address = '0x42456d7084eacf4083f1140d3229471bba2949a8'
    }
    if (address?.toLowerCase() === '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f') {
        address = '0xc011a72400e58ecd99ee497cf89e3775d4bd732f'
    }
    //console.log('address:', isAddress(address))
    const tokenLogos: Record<string, string> = {
        '0xdC19A122e268128B5eE20366299fc7b5b199C8e3': Tether,
        '0x2736643C7fFFe186984f60a2d34b91b1b7398bF1': Tulip,
        '0x9e832CaE5d19e7ff2f0D62881D1E33bb16Ac9bdc': Tulip2,
        '0xaC5487bFE2502eCc06e057912b6F4946471093b9': Dune,
        '0xf02b3e437304892105992512539F769423a515Cb': Yuzu,
        '0xd43ce0aa2a29DCb75bDb83085703dc589DE6C7eb': Bitcoin,
        '0x72Ad551af3c884d02e864B182aD9A34EE414C36C': Bling,
        '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D': Binance,
        '0xf4dEAd672d2E3e16A3dCAeF4C2bA7Cb1b4D304Ff': OasisApe,
        '0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055': "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png",
        '0xB44a9B6905aF7c801311e8F4E76932ee959c663C': "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
        '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C': "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/BUSD-BD1/logo.png",
        '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c': "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/DAI-D75/logo.png",
        '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844': "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/USDC-CD2/logo.png",
        '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8': Tether,
        '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818': Bitcoin,
        '0x21C718C22D52d0F3a789b752D4c2fD5908a8A733': "https://raw.githubusercontent.com/trustwallet/assets/ad3cfa2e1c8e4b295cd81d64ecc5ab2a9514f79e/blockchains/oasis/info/logo.png",
        '0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F':
          'https://raw.githubusercontent.com/trustwallet/assets/ec4f6c94a95bcddda22fe25659cf02d1d5d67bfc/blockchains/ethereum/info/logo.png'
    }
    const getTokenLogoURL = (address: string | false) => {
        if (address && (address in tokenLogos || address.toLowerCase() in tokenLogos || address.toUpperCase() in tokenLogos)) {
            return tokenLogos[address]
        }
        return 'https://raw.githubusercontent.com/trustwallet/assets/ad3cfa2e1c8e4b295cd81d64ecc5ab2a9514f79e/blockchains/oasis/info/logo.png'
    }

    const path = getTokenLogoURL(isAddress(address))

    return (
        <Inline>
            <Image
                {...rest}
                alt={''}
                src={path}
                size={size}
                onError={event => {
                    //   BAD_IMAGES[address] = true
                    setError(true)
                    event.preventDefault()
                }}
            />
        </Inline>
    )
}
