import { bottom } from '@popperjs/core'
import React from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import Logo from '../../assets/images/main_logo.png'
import MenuData from './footerMenu.json'
import Twitter from '../../assets/images/twitter.svg'
import Facebook from '../../assets/images/facebook.svg'
import Instagram from '../../assets/images/instagram.svg'
import Linkedin from '../../assets/images/linkedin.svg'
import PeckShieldLogo from '../../assets/images/PeckShieldLogo.svg'
import { ExternalLink } from 'theme'

const FooterFrame = styled.div`
    width: 100%;
    padding: 42px 3vw;
    margin-top: 182px;
    position: relative;
    backdrop-filter: blur(10px);

    &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: linear-gradient(180deg, #1d4941 0%, #1c383e 100%);
        opacity: 0.7;
        z-index: -1;
    }

    ${({ theme }) => theme.mediaWidth.upToLarge`
        padding-bottom: 120px;
    `};

    ${({ theme }) => theme.mediaWidth.upToSmall`
        padding: 52px 7vw 28px;
    `};
`

const FooterContent = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
    ${({ theme }) => theme.mediaWidth.upToLarge`
        flex-direction: column;
    `};
`
const FooterLogoPart = styled.div`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 2vw;

    ${({ theme }) => theme.mediaWidth.upToSmall`
            align-items: center;
        `};

    & > .CopyRight {
        text-align: center;
        ${({ theme }) => theme.mediaWidth.upToLarge`
            display: none;
        `};
    }
`

const FooterLogo = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;

    & > img {
        width: 50px;
        height: 50px;
        object-fit: contain;
        margin-right: 12px;
    }
`

const FooterSocial = styled.div`
    display: flex;
    justify-content: center;
    padding: 10px 0;
    border-bottom: 1px solid #62ba89;
    border-top: 1px solid #62ba89;
    margin-bottom: 16px;

    ${({ theme }) => theme.mediaWidth.upToLarge`
        width: fit-content;
        border-bottom: none;
    `};
`

const FooterSocialLink = styled.a<{ icon: any }>`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #2a685b;
    margin: 0 6px;
    background-image: url(${props => props.icon});
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
`

const FooterMenuPart = styled.div`
    display: flex;
    justify-content: center;
    border-left: 1px solid #2a685b;
    border-right: 1px solid #2a685b;
    padding: 0 2vw;
    ${({ theme }) => theme.mediaWidth.upToLarge`
        flex-wrap: wrap;
        justify-content: center;
        margin-bottom:24px;
        padding-top: 35px;
        border-left: none;
        border-right: none;
        border-top: 1px solid #2a685b;
        border-bottom: 1px solid #2a685b;
    `}

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        justify-content: flex-start;
    `}
`

const FooterMenu = styled.div`
    margin: 0 2vw;
    & > .MenuTitle {
        font-size: 16px;
    }

    ${({ theme }) => theme.mediaWidth.upToLarge`
        margin: 0 30px 0 0;
        & > .MenuTitle {
            font-size: 16px;
        }
    `}
`

const FooterList = styled.div`
    display: flex;
    flex-direction: column;

    & > a {
        color: #fff;
        font-size: 14px;
        color: #62ba89;
        margin: 8px 0;
        font-weight: 400;
    }

    ${({ theme }) => theme.mediaWidth.upToLarge`
    margin-bottom: 35px;
    & > a {
        font-size: 14px;
    }
    `}
`

const Audited = styled.div`
    padding: 8px 15px;
    border-radius: 24px;
    text-align: center;
    background-color: #2a685b;
    width: fit-content;
    margin: 25px auto 16px;
    border: 1px solid #327466;

    & img {
        height: 30px;
        display: inline;
    }
`
const FooterBadge = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    padding: 0 2vw;

    .CopyRight {
        border-top: 1px solid #327466;
        padding-top: 16px;
        margin-top: 16px;

        ${({ theme }) => theme.mediaWidth.upToLarge`
            border-top: none;
            padding-top: 0;
            margin-top: 0;
        `}
    }
`

export default function Footer() {
    const menuElements = MenuData.footerMenu.map(item => (
        <FooterMenu key={item.title}>
            <Text className="MenuTitle" style={{ marginBottom: '24px' }}>
                {item.title}
            </Text>
            <FooterList>
                {item.items.map(subItem => (
                    <a key={subItem.name} href={subItem.link}>
                        {subItem.name}
                    </a>
                ))}
            </FooterList>
        </FooterMenu>
    ))
    return (
        <FooterFrame>
            <FooterContent>
                <FooterLogoPart>
                    <FooterLogo>
                        <img src={Logo} alt="GemKeeper" />
                        <Text fontSize={24} fontWeight={700} color={'#fff'}>
                            GemKeeper
                        </Text>
                    </FooterLogo>
                    <FooterSocial>
                        <FooterSocialLink href={'https://twitter.com/GemKeeperDeFi'} icon={Twitter}></FooterSocialLink>
                        <FooterSocialLink icon={Facebook}></FooterSocialLink>
                        <FooterSocialLink icon={Instagram}></FooterSocialLink>
                        <FooterSocialLink icon={Linkedin}></FooterSocialLink>
                    </FooterSocial>
                </FooterLogoPart>
                <FooterMenuPart>{menuElements}</FooterMenuPart>
                <FooterBadge>
                    <ExternalLink
                        style={{ textDecoration: 'none' }}
                        href="https://github.com/GemKeeperDEV/GemKeeperFinance/blob/main/PeckShield-Audit-Report-GemKeeper-v1.0.pdf"
                    >
                        <Audited>
                            <Text fontSize={20} fontWeight={400} color={'#fff'}>
                                Audited by <img src={PeckShieldLogo} alt="PeckShieldLogo" />
                            </Text>
                        </Audited>
                    </ExternalLink>

                    <Text className="CopyRight" fontSize={14} fontWeight={400} color={'#29907B'}>
                        Copyright © 2022 GemKeeper Finance
                    </Text>
                </FooterBadge>
            </FooterContent>
        </FooterFrame>
    )
}
