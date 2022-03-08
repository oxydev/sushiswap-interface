import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'

import styled from 'styled-components'

import LogoHover from '../../assets/images/main_logo.png'

import Row, { RowFixed } from '../Row'

const HeaderFrame = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    top: 0;
    position: fixed;
    padding: 2rem 6vw;
    z-index: 2;

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderRow = styled(RowFixed)`
    ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem 0;
    position: absolute;
    right: 0;
    left: 0;
    margin: auto;
  `}
`

const HeaderLinks = styled(Row)`
    justify-content: center;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        display: none;
  `}
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
    activeClassName
})`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: left;
    border-radius: 3rem;
    outline: none;
    cursor: pointer;
    text-decoration: none;
    color: ${({ theme }) => theme.text2};
    font-size: 1rem;
    width: fit-content;
    margin: 0 32px;
    font-weight: 500;

    &.${activeClassName} {
        border-radius: ${({ theme }) => theme.borderRadius};
        font-weight: 600;
        color: ${({ theme }) => theme.text1};
    }

    :hover,
    :focus {
        color: ${({ theme }) => darken(0.1, theme.text1)};
    }
`

const Title = styled.a`
    display: flex;
    align-items: center;
    pointer-events: auto;
    justify-self: flex-start;
    margin-right: 12px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
    :hover {
        cursor: pointer;
    }
`
const HoverIcon = styled.div`
    position: relative;
    display: flex;
    align-items: center;

    img {
        width: 78px;
    }

    ${({ theme }) => theme.mediaWidth.upToSmall`
        & > img {
            width: 45px;
        }    
      `};
`

const LaunchButton = styled.button`
    background-color: #2655c2;
    border-radius: 12px;
    border: none;
    outline: none;
    color: #fff;
    font-size: 20px;
    padding: 14px 54px;
    margin-left: auto;
    margin-right: 0;
    flex-shrink: 0;
    cursor: pointer;
    font-weight: normal;
    z-index: 10;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        font-size: 14px;
  `};
`

const HeaderLinksIcon = styled.div`
    display: none;
    width: 26px;
    height: 20px;
    flex-direction: column;
    justify-content: space-between;

    & > div {
        width: 100%;
        background-color: #fff;
        height: 2px;
    }

    ${({ theme }) => theme.mediaWidth.upToSmall`
        display: flex;
  `};
`

const MobileHeaderLinks = styled.div<{ show: boolean }>`
    display: ${props => (props.show ? 'flex' : 'none')};
    padding: 117px 20px 43px;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    flex-direction: column;
    background-color: #010326;
    border-radius: 0 0 25px 25px;

    & > a {
        display: block;
        width: 100%;
        line-height: 53px;
        padding-left: 31px;
        border-bottom: 1px solid #98cdff;
        border-radius: 0;
        margin: 0;
        font-size: 16px;

        &.ACTIVE {
            border-radius: 0;
            background-color: rgba(152, 205, 255, 0.1);
        }

        &:nth-child(2) {
            border-top: 2px solid #2b318f;
        }
    }
`

const CloseHeader = styled.div`
    width: 23px;
    height: 23px;
    position: absolute;
    top: 46px;
    left: 25px;
    &::after,
    &::before {
        content: '';
        display: block;
        width: 25px;
        height: 3px;
        background-color: #fff;
        transform-origin: center;
        transform: rotate(45deg);
        position: absolute;
        right: 0;
        top: 0;
        left: 0;
        bottom: 0;
        margin: auto;
    }

    &::before {
        transform: rotate(-45deg);
    }
`

export default function HomeHeader() {
    const { t } = useTranslation()
    const [show, setShow] = useState(false)

    // console.log(chainId)

    return (
        <HeaderFrame>
            <HeaderLinksIcon
                onClick={() => {
                    setShow(true)
                }}
            >
                <div></div>
                <div></div>
                <div></div>
            </HeaderLinksIcon>
            <MobileHeaderLinks show={show}>
                <CloseHeader
                    onClick={() => {
                        setShow(false)
                    }}
                ></CloseHeader>
                <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
                    {t('swap')}
                </StyledNavLink>
                <StyledNavLink
                    id={`pool-nav-link`}
                    to={'/pool'}
                    isActive={(match, { pathname }) =>
                        Boolean(match) ||
                        pathname.startsWith('/add') ||
                        pathname.startsWith('/remove') ||
                        pathname.startsWith('/create') ||
                        pathname.startsWith('/find')
                    }
                >
                    Home
                </StyledNavLink>
            </MobileHeaderLinks>
            <HeaderRow>
                <Title href=".">
                    <HoverIcon>
                        <img width={'78px'} src={LogoHover} alt="logo" />
                    </HoverIcon>
                    {/*<StaticIcon>*/}
                    {/*    <img width={'40px'} src={Logo} alt="logo" />*/}
                    {/*</StaticIcon>*/}
                </Title>
                <HeaderLinks>
                    <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
                        {t('swap')}
                    </StyledNavLink>
                    <StyledNavLink
                        id={`pool-nav-link`}
                        to={'/pool'}
                        isActive={(match, { pathname }) =>
                            Boolean(match) ||
                            pathname.startsWith('/add') ||
                            pathname.startsWith('/remove') ||
                            pathname.startsWith('/create') ||
                            pathname.startsWith('/find')
                        }
                    >
                        Home
                    </StyledNavLink>
                </HeaderLinks>
            </HeaderRow>
            <LaunchButton>Launch App</LaunchButton>
        </HeaderFrame>
    )
}
