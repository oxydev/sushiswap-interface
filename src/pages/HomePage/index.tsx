import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { setInterval } from 'timers'
import mainImage from '../../assets/images/homePageImage.jpg'
import LogoRing from '../../assets/images/logoRing.png'
import LogoRing2 from '../../assets/images/logoRing2.png'
import LogoRing2Back from '../../assets/images/logoRing2-back.png'
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

const HomeImage = styled.div`
    // background-image: url(${mainImage});
    // background-color: blue;
    background-repeat: no-repeat;
    width: 104vw;
    height: 100%;
    background-size: cover;
    opacity: 0.6;
    position: fixed;
    top: 0;
    right: -4vw;
    mix-blend-mode: color-dodge;
    background-position: right;

    ${({ theme }) => theme.mediaWidth.upToMedium`
        background-image: url(${mainImageMobile});
        background-position: bottom;
        width:100vw;
        right:0;
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

const LogoRingImage = styled.img`
    background-repeat: no-repeat;
    width: 104vw;
    height: 100%;
    background-size: cover;
    opacity: 0.6;
    position: fixed;
    top: 0;
    right: -4vw;
    mix-blend-mode: color-dodge;
    background-position: right;
    object-fit: contain;
    object-position: right;
    animation: ${hueRotate} 10s linear infinite;
    ${({ theme }) => theme.mediaWidth.upToMedium`
        width: 100vw;
        right: unset;
        left: -3vw;
        object-position: bottom;
  `}
`

const LogoRingImage2 = styled.div`
    background-repeat: no-repeat;
    width: 104vw;
    height: 100%;
    background-size: cover;
    opacity: 0.6;
    position: absolute;
    top: 0;
    right: -4vw;
    ${({ theme }) => theme.mediaWidth.upToMedium`
        width: 100vw;
        right: unset;
        left: -3vw;
        object-position: bottom;
  `}

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

  &::after {
      content: "";
      display: block;
      position absolute;
      top:0;
      right: 0;
      left: 0;
      bottom: 0;
      background-image: url(${LogoRing2Back});
      background-size: contain;
      background-position: right;
      background-repeat: no-repeat;
      z-index: -1;
      
  }
`

const LogoRingImage3 = styled(LogoRingImage2)`
&::before {
    content: "";
    display: block;
    position absolute;
    top:0;
    right: 0;
    left: 0;
    bottom: 0;
    background-image: url(${LogoRingLogo});
    background-size: contain;
    background-position: right;
    background-repeat: no-repeat;
    
    
}
`

const ModeButton = styled.button`
    margin-left: 0;
    width: 100px;
    background-color: red;
    margin-top: 30px;
    border-radius: 10px;
    padding: 15px;
    cursou: pointer;
    z-index: 20;
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
        return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
    }

    return (
        <HomePage>
            {mode === 1 && <LogoRingImage src={LogoRing} />}
            {mode === 2 && (
                <LogoRingImage2>
                    <img src={LogoRing2} />
                </LogoRingImage2>
            )}
            {mode === 3 && (
                <LogoRingImage3>
                    <img src={LogoRing2} />
                </LogoRingImage3>
            )}

            <TitleWrapper>
                <h2>Total Value Locked</h2>
                <h3>$ {numberWithCommas(liquidity)}</h3>
                <p>GemKeeper is a community focused AMM & DeFi Platform built on Oasis.</p>
                <LaunchButton
                    onClick={() => {
                        window.open('https://app.gemkeeper.finance', '_self')
                    }}
                >
                    Launch App
                </LaunchButton>
                <ModeButton
                    onClick={() => {
                        setMode(1)
                    }}
                >
                    Mode 1
                </ModeButton>
                <ModeButton
                    onClick={() => {
                        setMode(2)
                    }}
                >
                    Mode 2
                </ModeButton>
                <ModeButton
                    onClick={() => {
                        setMode(3)
                    }}
                >
                    Mode 3
                </ModeButton>
            </TitleWrapper>
            {/* <HomeImage /> */}
        </HomePage>
    )
}
