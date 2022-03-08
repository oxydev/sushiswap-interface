import React, { useState } from 'react'
import Modal from 'components/Modal'
import styled from 'styled-components'
import { useModalOpen, useToggleFaucetModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/actions'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { ButtonPrimary } from 'components/Button'
import { Text } from 'rebass'
import { useActiveWeb3React } from 'hooks'
import { shortenAddress } from 'utils'

const Wrapper = styled.div`
    ${({ theme }) => theme.flexColumnNoWrap}
    margin: 0;
    padding: 0;
    width: 100%;
`
const UpperSection = styled.div`
    position: relative;

    h5 {
        margin: 0;
        margin-bottom: 0.5rem;
        font-size: 1rem;
        font-weight: 400;
    }

    h5:last-child {
        margin-bottom: 0px;
    }

    h4 {
        margin-top: 0;
        font-weight: 500;
    }
`

const CloseIcon = styled.div`
    position: absolute;
    right: 1rem;
    top: 14px;
    &:hover {
        cursor: pointer;
        opacity: 0.6;
    }
`

const HeaderRow = styled.div`
    ${({ theme }) => theme.flexRowNoWrap};
    padding: 1rem 1rem;
    font-weight: 500;
    color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
    ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const CloseColor = styled(Close)`
    path {
        stroke: ${({ theme }) => theme.text4};
    }
`

const ContentWrapper = styled.div`
    background-color: ${({ theme }) => theme.bg2};
    padding: 2rem;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;

    ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`

const WalletInput = styled.input`
    position: relative;
    display: flex;
    padding: 16px;
    align-items: center;
    width: 100%;
    white-space: nowrap;
    background: none;
    border: none;
    outline: none;
    border-radius: 10px;
    color: ${({ theme }) => theme.text1};
    border-style: solid;
    border: 1px solid ${({ theme }) => theme.bg3};
    margin-bottom: 20px;
    -webkit-appearance: none;

    font-size: 18px;

    ::placeholder {
        color: ${({ theme }) => theme.text3};
    }
    transition: border 100ms;
    :focus {
        border: 1px solid ${({ theme }) => theme.primary1};
        outline: none;
    }
`

const InfoBar = styled.div`
    background-color: rgba(94, 151, 204, 0.2);
    border-radius: 10px;
    border: 1px solid #4476a9;
    display: flex;
    align-items: center;
    margin-bottom: 32px;
    padding: 18px;
`

export default function FaucetModal() {
    const faucetModalOpen = useModalOpen(ApplicationModal.FAUCET)
    const toggleFaucetModal = useToggleFaucetModal()
    const { account } = useActiveWeb3React()

    function Faucet() {
        console.log('faucet')
    }

    return (
        <Modal isOpen={faucetModalOpen} onDismiss={toggleFaucetModal} minHeight={false} maxHeight={90}>
            <Wrapper>
                <UpperSection>
                    <CloseIcon onClick={toggleFaucetModal}>
                        <CloseColor />
                    </CloseIcon>
                    <HeaderRow>Enter Your Wallet Address to Earn some Token</HeaderRow>
                    <ContentWrapper>
                        {account && (
                            <InfoBar>
                                <Text color={'#fff'} fontSize={18}>
                                    {shortenAddress(account)}
                                </Text>
                            </InfoBar>
                        )}

                        <ButtonPrimary
                            padding="8px"
                            borderRadius="8px"
                            width="100%"
                            height="60px"
                            onClick={() => {
                                Faucet()
                            }}
                        >
                            Faucet
                        </ButtonPrimary>
                    </ContentWrapper>
                </UpperSection>
            </Wrapper>
        </Modal>
    )
}
