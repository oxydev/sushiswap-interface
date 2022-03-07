import React from 'react'
import styled from 'styled-components'
import mainImage from '../../assets/images/homePageImage.jpg'

const HomePage = styled.section``

const TitleWrapper = styled.div`
    height: 100vh;
    padding-left: 6vw;
    display: flex;
    flex-direction: column;
    justify-content: center;

    h2 {
        font-size: 60px;
        font-weight: 700;
    }

    h3 {
        font-size: 125px;
        color: #59fe7f;
        font-weight: 700;
    }

    p {
        font-size: 24px;
    }
`

const HomeImage = styled.div`
    background-image: url(${mainImage});
    background-color: blue;
    background-repeat: no-repeat;
    width: 92vw;
    height: 92vh;
    background-size: cover;
    opacity: 0.6;
    position: fixed;
    top: 0;
    right: -4vw;
    mix-blend-mode: color-dodge;
`

const LaunchButton = styled.button`
    border: none;
    outline: none;
    background-color: #2ab0fc;
    padding: 19px 47px;
    border-radius: 50px;
    width: fit-content;
    margin-top: 76px;
    cursour: pointer;
`

export default function Home() {
    return (
        <HomePage>
            <TitleWrapper>
                <h2>Total Value Locked</h2>
                <h3>$ 17,121,951,72</h3>
                <p>Supply, borrow, and earn. More than a DeFi lending protocol.</p>
                <LaunchButton>Launch App</LaunchButton>
            </TitleWrapper>
            <HomeImage />
        </HomePage>
    )
}
