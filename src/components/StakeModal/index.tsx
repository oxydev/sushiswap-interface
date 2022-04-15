import React, { useEffect, useState } from 'react'
import Modal from 'components/Modal'
import styled from 'styled-components'
import {
    useCloseModals,
    useModalOpen,
    useToggleFaucetModal,
    useToggleStakeModal,
    useWalletModalToggle
} from 'state/application/hooks'
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
import { ExternalLink } from '../../theme'

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

        background: '#0195FF';
    }
`

const CloseColor = styled(Close)`
    path {
        stroke: ${({ theme }) => theme.text4};
    }
`

const ContentWrapper = styled.div`
    background: linear-gradient(176.59deg, rgba(41, 101, 255, 0.5) -52.78%, rgba(39, 81, 124, 0.77) 76.35%)};
    padding: 2rem;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    display: flex;
    justify-content: center;

    ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
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

const FaucetButton = styled.button`
    width: 187px;
    height: 45px;
    line-height: 45px;
    color: #fff;
    border-radius: 10px;
    text-align: center;
    margin: auto 20px;
    background-color: #2965ff;

    &:disabled {
        opacity: 0.6;
        cursor: default;
    }
`

const EndButton = styled(FaucetButton)`
    background-color: transparent;
    border: 2px solid #2965ff;
`

export default function StakeModal() {
    const stakeModalOpen = useModalOpen(ApplicationModal.STAKE)
    const toggleStakeModal = useToggleStakeModal()
    const [localLoading, setLocalLoading] = useState(false)

    console.log(stakeModalOpen)

    return (
        <Modal isOpen={stakeModalOpen} onDismiss={toggleStakeModal} minHeight={false} maxHeight={90}>
            <Wrapper>
                <UpperSection>
                    <CloseIcon onClick={toggleStakeModal}>
                        <CloseColor />
                    </CloseIcon>
                    <HeaderRow>Stake Your BLING</HeaderRow>
                    <ContentWrapper>
                        <ExternalLink href={"/#/stake"}><FaucetButton>Earn xBLING</FaucetButton></ExternalLink>
                        <ExternalLink href={"/#/add/0x21C718C22D52d0F3a789b752D4c2fD5908a8A733/0x72Ad551af3c884d02e864B182aD9A34EE414C36C"}><EndButton>Add Liquidity</EndButton></ExternalLink>
                    </ContentWrapper>
                </UpperSection>
            </Wrapper>
        </Modal>
    )
}
