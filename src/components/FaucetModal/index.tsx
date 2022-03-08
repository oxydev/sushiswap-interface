import React, { useEffect, useState } from 'react'
import Modal from 'components/Modal'
import styled from 'styled-components'
import { useModalOpen, useToggleFaucetModal, useWalletModalToggle } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/actions'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { Text } from 'rebass'
import { useActiveWeb3React } from 'hooks'
import { shortenAddress } from 'utils'
import axios from 'axios'

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
    const [status, setStatus] = useState(0)
    const [result, setResult] = useState(0)

    const toggleWalletModal = useWalletModalToggle()

    function Faucet() {
        const formData = new FormData()
        if (account) {
            formData.append('wallet', account)
            axios
                .post('https://api.gemkeeper.finance/faucet/request', formData, {
                    withCredentials: false,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => {
                    console.log(res)
                    setResult(res.data.status)
                })
        }
    }

    function checkStatus() {
        const formData = new FormData()
        if (account) {
            formData.append('wallet', account)
            axios
                .post('https://api.gemkeeper.finance/faucet/status', formData, {
                    withCredentials: false,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => {
                    console.log(res)
                    setStatus(res.data.status)
                })
        }
    }

    useEffect(() => {
        checkStatus()
    }, [faucetModalOpen])

    return (
        <Modal isOpen={faucetModalOpen} onDismiss={toggleFaucetModal} minHeight={false} maxHeight={90}>
            <Wrapper>
                <UpperSection>
                    <CloseIcon onClick={toggleFaucetModal}>
                        <CloseColor />
                    </CloseIcon>
                    <HeaderRow>GemKeeper ROSE Faucet</HeaderRow>
                    <ContentWrapper>
                        {result === 0 ? (
                            <>
                                {account ? (
                                    <>
                                        <InfoBar>
                                            <Text color={'#fff'} fontSize={18}>
                                                {status === 0
                                                    ? 'Loading'
                                                    : status === 1
                                                    ? 'Your wallet address is not qualified!'
                                                    : status === 2
                                                    ? `Faucet can not be accurated because of wrong policy!`
                                                    : status === 3
                                                    ? `You have allready received some tokens!`
                                                    : status === 4
                                                    ? shortenAddress(account)
                                                    : 'Something went wrong!'}
                                            </Text>
                                        </InfoBar>
                                        {status === 4 ? (
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
                                        ) : (
                                            <ButtonError disabled={true} width={'100%'}>
                                                <Text fontSize={20} fontWeight={500}>
                                                    {status === 0
                                                        ? 'Loading'
                                                        : status === 1
                                                        ? 'Address not qualified!'
                                                        : status === 2
                                                        ? `Wrong policy!`
                                                        : status === 3
                                                        ? `Allready received!`
                                                        : 'Something wrong!'}
                                                </Text>
                                            </ButtonError>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <InfoBar>
                                            <Text color={'#fff'} fontSize={18}>
                                                If you want to access foucet, you need to connect wallet
                                            </Text>
                                        </InfoBar>

                                        <ButtonLight onClick={toggleWalletModal} disabled={false} width={'100%'}>
                                            <Text fontSize={20} fontWeight={500}>
                                                Connect to a wallet
                                            </Text>
                                        </ButtonLight>
                                    </>
                                )}
                            </>
                        ) : (
                            <InfoBar>
                                <Text color={'#fff'} fontSize={18}>
                                    {result === 1
                                        ? 'Your wallet address is not qualified!'
                                        : result === 2
                                        ? 'You have allready received some tokens!'
                                        : result === 3
                                        ? 'Something went wrong suring faucet!'
                                        : result === 4
                                        ? 'Faucet Successful!'
                                        : result === 5
                                        ? 'Faucet can not be accurated because of wrong policy!'
                                        : 'Something went wrong!'}
                                </Text>
                            </InfoBar>
                        )}
                    </ContentWrapper>
                </UpperSection>
            </Wrapper>
        </Modal>
    )
}
