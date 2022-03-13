import React, { useState, useCallback } from 'react'
import styled from 'styled-components'

const ToolTipContainer = styled.div`
    position: relative;
`

const ToolTipBox = styled.div<{ show: boolean }>`
    display: ${props => (props.show ? 'block' : 'none')};
    position: absolute;
    padding: 0 12px;
    line-height: 41px;
    color: #000;
    border-radius: 5px;
    background-color: #fff;
    font-size: 14px;
    top: 50px;
    left: 30%;
    z-index: 10;
    width: fit-content;

    &::after {
        content: '';
        display: block;
        width: 16px;
        height: 16px;
        transform: rotate(45deg);
        position: absolute;
        top: -8px;
        left: 20px;
        z-index: 20;
        background-color: #fff;
    }
`

export default function NameToolTip({ children, text }: { children: JSX.Element; text: string | boolean }) {
    const [show, setShow] = useState(false)
    const open = useCallback(() => setShow(true), [setShow])
    const close = useCallback(() => setShow(false), [setShow])

    return (
        <ToolTipContainer onMouseEnter={open} onMouseLeave={close}>
            {children}
            {text && <ToolTipBox show={show}>{text}</ToolTipBox>}
        </ToolTipContainer>
    )
}
