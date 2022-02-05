import React from 'react'
import styled from 'styled-components'
import { transparentize } from 'polished'

export const BodyWrapper = styled.div`
    position: relative;
    max-width: 420px;
    width: 100%;
    // background: ${({ theme }) => transparentize(0.25, theme.bg1)};
    background: rgba(61,63,90,0.76);
    box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.33), 0px 4px 8px rgba(0, 0, 0, 0.33), 0px 16px 24px rgba(0, 0, 0, 0.33),
        0px 24px 32px rgba(0, 0, 0, 0.33);
    border-radius: 0 20px 0 40px;
    border: 1px solid #75818f;
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
    return <BodyWrapper>{children}</BodyWrapper>
}
