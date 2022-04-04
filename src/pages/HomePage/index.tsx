import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { setInterval } from 'timers'
import mainImage from '../../assets/images/homePageImage.jpg'
import LogoRing from '../../assets/images/logoRing.png'
import LogoRingLogo from '../../assets/images/logoRing-logo.png'
import mainImageMobile from '../../assets/images/homePageImageMobile.jpg'

const HomePage = styled.section`
    width: 100%;
    position: relative;
`

const TitleWrapper = styled.div`
    height: 100vh;
    padding-left: 6vw;
    display: flex;
    flex-direction: column;
    justify-content: center;

    h2 {
        font-size: 3.1vw;
        font-weight: 700;
    }

    h3 {
        font-size: 6.5vw;
        color: #59fe7f;
        font-weight: 700;
    }

    p {
        font-size: 1vw;
    }

    ${({ theme }) => theme.mediaWidth.upToMedium`
        text-align: center;
        align-items: center;
        justify-content: flex-start;
        padding: 0;
        padding-top: 20vh;
        width: 100%;
        h2 {
            font-size: 6.4vw;
            font-weight: 500;
        }

        h3 {
            font-size: 12.8vw;
        }

        p {
            font-size: 2.4vw;
        }
  `}
`

const LaunchButton = styled.button`
    border: none;
    outline: none;
    background-color: #2ab0fc;
    padding: 19px 47px;
    border-radius: 50px;
    width: fit-content;
    margin-top: 76px;
    cursor: pointer;
    z-index: 10;
    font-size: 20px;

    ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 52px;
    font-size: 20px;
        
  `}
`
const hueRotate = keyframes`
        from {
            filter: hue-rotate(0);
        }
        to {
            filter: hue-rotate(360deg);
        }
`

const HomeImage = styled.div`
    background-repeat: no-repeat;
    width: 104vw;
    height: 90%;
    background-size: cover;
    opacity: 0.6;
    position: absolute;
    top: 0;
    right: -4vw;
    bottom: 0;
    margin: auto;

    & > img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        mix-blend-mode: color-dodge;
        background-position: right;
        object-position: right;
        animation: ${hueRotate} 10s linear infinite;
        z-index: 10;
    }
    &::before {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        background-image: url(${LogoRingLogo});
        background-size: contain;
        background-position: right;
        background-repeat: no-repeat;
    }

    ${({ theme }) => theme.mediaWidth.upToMedium`
        width: 100vw;
        height: 100%;
        right: unset;
        left: -3vw;
        object-position: bottom;
        & > img {
            object-position: bottom;
            animation: ${hueRotate} 10s linear infinite;
            z-index: 10;
        }
        &::before {
            background-position: bottom;
        }
  `}
`

export default function Home() {
    const [liquidity, setLiquidity] = useState(0)
    const [mode, setMode] = useState(1)

    function getLiquidity() {
        fetch('https://subgraph.gemkeeper.finance/subgraphs/name/generated/sample', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `query{
                    dayDatas(first: 1000, orderBy: date, orderDirection: desc) {
                        id
                        date
                        volumeETH
                        volumeUSD
                        untrackedVolume
                        liquidityETH
                        liquidityUSD
                        txCount
                      }
                }`
            })
        })
            .then(res => res.json())
            .then(result => {
                console.log(result.data.dayDatas[0].liquidityUSD)
                setLiquidity(parseInt(result.data.dayDatas[0].liquidityUSD))
            })
    }
    useEffect(() => {
        getLiquidity()
        const interval = setInterval(getLiquidity, 10000)
        return clearInterval(interval)
    }, [])
    function numberWithCommas(x: number) {
        return x.toLocaleString()
    }

    return (
        <HomePage>
            <HomeImage>
                <img src={LogoRing} />
            </HomeImage>

            <TitleWrapper>
                <h2>Total Value Locked</h2>
                <h3>$ {numberWithCommas(liquidity)}</h3>
                <p>DeFi made Easy! The One-Stop Shop for All Your DeFi Needs.</p>
                <LaunchButton
                    onClick={() => {
                        window.open('https://app.gemkeeper.finance', '_self')
                    }}
                >
                    Launch App
                </LaunchButton>
            </TitleWrapper>
            {/* <HomeImage /> */}
        </HomePage>
    )
}
