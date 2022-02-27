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
import { transparentize } from 'polished'

const FooterFrame = styled.div`
    width: 100%;
    padding: 52px 6vw 28px;
    margin-top: 182px;
    position: relative;

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
`

const FooterContent = styled.div`
    display: flex;
    width: 100%;
    padding-bottom: 51px;
    border-bottom: 1px solid #305a5d;
    justify-content: space-between;
`
const FooterLogoPart = styled.div`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
`

const FooterLogo = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 38px;

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
    padding-bottom: 12px;
    border-bottom: 1px solid #62ba89;
    margin-bottom: 16px;
`

const FooterSocialLink = styled.a<{ icon: any }>`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #305a5d;
    margin: 0 6px;
    background-image: url(${props => props.icon});
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
`

const FooterMenuPart = styled.div`
    display: flex;
    justify-content: center;
`

const FooterMenu = styled.div`
    margin: 0 60px;
`

const FooterList = styled.div`
    display: flex;
    flex-direction: column;

    & > a {
        color: #fff;
        font-size: 16px;
        color: #62ba89;
        margin: 8px 0;
        font-weight: 400;
    }
`

const Audited = styled.div`
    height: 48px;
    padding: 8px 26px;
    border-radius: 24px;
    text-aling: center;
    background-color: #305a5d;
    width: fit-content;
    margin: 25px auto 0;
`

export default function Footer() {
    const menuElements = MenuData.footerMenu.map(item => (
        <FooterMenu key={item.title}>
            <Text fontSize={20} style={{ marginBottom: '24px' }}>
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
                            gemkeeper
                        </Text>
                    </FooterLogo>
                    <FooterSocial>
                        <FooterSocialLink icon={Twitter}></FooterSocialLink>
                        <FooterSocialLink icon={Facebook}></FooterSocialLink>
                        <FooterSocialLink icon={Instagram}></FooterSocialLink>
                        <FooterSocialLink icon={Linkedin}></FooterSocialLink>
                    </FooterSocial>
                    <Text fontSize={14} fontWeight={400} color={'#40787C'}>
                        Copyright © 2022 SpookySwap
                    </Text>
                </FooterLogoPart>
                <FooterMenuPart>{menuElements}</FooterMenuPart>
            </FooterContent>
            <Audited>
                <Text fontSize={20} fontWeight={400} color={'#fff'}>
                    Audited by Gemkeeper
                </Text>
            </Audited>
        </FooterFrame>
    )
}
