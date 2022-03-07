import React from 'react'
import { NavLink } from 'react-router-dom'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'

import styled from 'styled-components'

import LogoHover from '../../assets/images/main_logo.png'

import Row, { RowFixed } from '../Row'

const HeaderFrame = styled.div`
    display: grid;
    grid-template-columns: 1fr 120px;
    align-items: center;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    top: 0;
    position: fixed;
    padding: 1rem;
    z-index: 2;
    padding-left: 6vw;
    ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
  `};

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderRow = styled(RowFixed)`
    ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};

    @media (max-width: 720px) {
        padding: 0.5rem 0;
    }
`

const HeaderLinks = styled(Row)`
    justify-content: center;
    ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem 0 1rem 1rem;
    justify-content: flex-end;

    @media (max-width: 720px) {
        display: none;
    }
`};
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
    margin: 0 12px;
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
`

export default function HomeHeader() {
    const { t } = useTranslation()

    // console.log(chainId)

    return (
        <HeaderFrame>
            <HeaderRow>
                <Title href=".">
                    <HoverIcon>
                        <img width={'48px'} src={LogoHover} alt="logo" />
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
        </HeaderFrame>
    )
}
