import React, { useEffect, useState } from 'react'
import Modal from 'components/Modal'
import styled from 'styled-components'
import { useCloseModals, useModalOpen, useToggleFaucetModal, useWalletModalToggle } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/actions'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { Text } from 'rebass'
import { useActiveWeb3React } from 'hooks'
import { shortenAddress } from 'utils'
import axios from 'axios'
import SuccessIcon from '../../assets/images/faucet-success.png'
import ErrorIcon from '../../assets/images/faucet-error.png'
import WarningIcon from '../../assets/images/faucet-warning.png'
import InfoIcon from '../../assets/images/faucet-info.png'

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

const HeaderRow = styled.div<{ status: number }>`
    ${({ theme }) => theme.flexRowNoWrap};
    padding: 1rem 1rem;
    font-weight: 500;
    display: flex;
    justify-content: center;
    ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};

    & > span {
        display: block;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;

        background: ${props =>
            props.status === 1
                ? 'linear-gradient(180deg, #FFAEAE 0%, #FF0000 100%)'
                : props.status === 2
                ? '#0195FF'
                : props.status === 3
                ? 'linear-gradient(181.64deg, rgba(255, 253, 249, 0.9) 3.67%, #FFB703 101.55%)'
                : props.status === 4
                ? 'linear-gradient(360deg, #3BCA74 5.23%, rgba(195, 255, 219, 0.94) 99.49%)'
                : '#0195FF'};

        box-shadow: ${props =>
            props.status === 1
                ? '5px 5px 5px rgba(255, 0, 0, 0.25)'
                : props.status === 2
                ? 'none'
                : props.status === 3
                ? '5px 5px 5px rgba(254, 195, 48, 0.25)'
                : props.status === 4
                ? 'none'
                : 'none'};

        &::after {
            content: '';
            display: inline-block;
            width: 18px;
            height: 18px;
            margin: auto;
            background-image: ${props =>
                props.status === 1
                    ? `url(${ErrorIcon})`
                    : props.status === 2
                    ? `url(${InfoIcon})`
                    : props.status === 3
                    ? `url(${WarningIcon})`
                    : props.status === 4
                    ? `url(${SuccessIcon})`
                    : `url(${InfoIcon})`};
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
        }
    }
`

const CloseColor = styled(Close)`
    path {
        stroke: ${({ theme }) => theme.text4};
    }
`

const ContentWrapper = styled.div<{ status: number }>`
    background: ${props =>
        props.status === 1
            ? 'linear-gradient(176.4deg, rgba(255, 0, 0, 0.5) -51.24%, rgba(39, 81, 124, 0.77) 96.32%)'
            : props.status === 2
            ? 'linear-gradient(176.59deg, rgba(41, 101, 255, 0.5) -52.78%, rgba(39, 81, 124, 0.77) 76.35%)'
            : props.status === 3
            ? 'linear-gradient(176.59deg, rgba(247, 252, 30, 0.5) -52.78%, rgba(39, 81, 124, 0.77) 76.35%)'
            : props.status === 4
            ? 'linear-gradient(176.4deg, rgba(6, 231, 15, 0.5) -51.24%, rgba(39, 81, 124, 0.77) 96.32%)'
            : 'linear-gradient(176.59deg, rgba(41, 101, 255, 0.5) -52.78%, rgba(39, 81, 124, 0.77) 76.35%)'};
    padding: 2rem;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    display: flex;
    flex-direction: column;

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

const FaucetButton = styled.button<{ status: number }>`
    width: 187px;
    height: 45px;
    line-height: 45px;
    color: #fff;
    border-radius: 10px;
    text-align: center;
    margin: auto;
    background-color: ${props =>
        props.status === 1
            ? '#FF0000'
            : props.status === 2
            ? '#2965FF'
            : props.status === 3
            ? '#EDD140'
            : props.status === 4
            ? '#07D00F'
            : '#2965FF'};

    &:disabled {
        opacity: 0.6;
        cursor: default;
    }
`

export default function FaucetModal() {
    const faucetModalOpen = useModalOpen(ApplicationModal.FAUCET)
    const toggleFaucetModal = useToggleFaucetModal()
    const { account } = useActiveWeb3React()
    const [status, setStatus] = useState(0)
    const [result, setResult] = useState(0)
    const [localLoading, setLocalLoading] = useState(false)

    const toggleWalletModal = useWalletModalToggle()

    function Faucet() {
        setLocalLoading(true)
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
                    setLocalLoading(false)
                    console.log(res)
                    setResult(res.data.status)
                })
                .catch(() => {
                    setLocalLoading(false)
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
                    <HeaderRow status={status}>
                        <span />
                    </HeaderRow>
                    <ContentWrapper status={status}>
                        {result === 0 ? (
                            <>
                                {account ? (
                                    <>
                                        <Text
                                            color={
                                                status === 1
                                                    ? '#FF6161'
                                                    : status === 2
                                                    ? '#8BABFF'
                                                    : status === 3
                                                    ? '#EDD140'
                                                    : status === 4
                                                    ? '#91FF95'
                                                    : '#fff'
                                            }
                                            fontSize={13}
                                            style={{ marginBottom: '32px', textAlign: 'center' }}
                                        >
                                            {status === 0
                                                ? 'Please wait!'
                                                : status === 1
                                                ? 'Your wallet address is not qualified!'
                                                : status === 2
                                                ? `Your wallet should not have any ROSE and you need a minimum amount of bridged token in your wallet!`
                                                : status === 3
                                                ? `You can only use GemKeeper Faucet Once!`
                                                : status === 4
                                                ? 'Your wallet address is eligible!'
                                                : 'Something went wrong!'}
                                        </Text>
                                        <Text fontSize={14} color={'#98CDFF'} style={{ marginBottom: '8px' }}>
                                            Address:
                                        </Text>
                                        <Text fontSize={14} color={'#fff'} style={{ marginBottom: '48px' }}>
                                            {account}
                                        </Text>

                                        <FaucetButton
                                            onClick={
                                                status === 4
                                                    ? () => {
                                                          Faucet()
                                                      }
                                                    : () => {
                                                          toggleFaucetModal()
                                                      }
                                            }
                                            status={status}
                                            disabled={status === 0}
                                        >
                                            {status === 4 ? 'Faucet' : 'Ok'}
                                        </FaucetButton>
                                    </>
                                ) : (
                                    <>
                                        <InfoBar>
                                            <Text color={'#fff'} fontSize={18}>
                                                If you want to access faucet, you need to connect wallet
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
                                        ? 'You can only use GemKeeper Faucet Once!'
                                        : result === 3
                                        ? 'There is a problem in Faucet, please contact support!'
                                        : result === 4
                                        ? 'Sent 0.5 Rose Successfully, please wait to receive it!'
                                        : result === 5
                                        ? 'Your wallet should not have any ROSE and you need a minimum amount of bridged token in your wallet!'
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
