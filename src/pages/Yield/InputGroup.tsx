import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Input as NumericalInput } from 'components/NumericalInput'
import { Dots } from '../Pool/styleds'
import { useActiveWeb3React } from 'hooks'

import useTokenBalance from 'sushi-hooks/useTokenBalance'
import useStakedBalance from 'sushi-hooks/useStakedBalance'
import usePendingSushi from 'sushi-hooks/usePendingSushi'
import useMasterChef from 'sushi-hooks/useMasterChef'

import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { Token, TokenAmount, MASTERCHEF_ADDRESS } from '@sushiswap/sdk'

import { ethers } from 'ethers'
import { Button } from './components'
import { isAddressString, formattedNum, isWETH } from 'utils'
import Fraction from 'constants/Fraction'
import { BigNumber } from '@ethersproject/bignumber'
import Tooltip, { MouseoverTooltip } from 'components/Tooltip'
import styled from 'styled-components'
import { useToggleStakeModal } from 'state/application/hooks'

const fixedFormatting = (value: BigNumber, decimals?: number) => {
    return Fraction.from(value, BigNumber.from(10).pow(BigNumber.from(decimals))).toString(decimals)
}
const spanStyles = {
    zIndex : 100
};

export default function InputGroup({
    pairAddress,
    pid,
    pairSymbol,
    token0Address,
    token1Address,
    type,
    assetSymbol,
    assetDecimals = 18
}: {
    pairAddress: string
    pid: number
    pairSymbol: string
    token0Address: string
    token1Address: string
    type?: string
    assetSymbol?: string
    assetDecimals?: number
}): JSX.Element {
    const history = useHistory()
    const { account, chainId } = useActiveWeb3React()
    const [pendingTx, setPendingTx] = useState(false)
    const [depositValue, setDepositValue] = useState('')
    const [withdrawValue, setWithdrawValue] = useState('')

    const pairAddressChecksum = isAddressString(pairAddress)

    //const { deposit } = useBentoBox()
    const balance = useTokenBalance(pairAddressChecksum)
    const staked = useStakedBalance(pid, assetDecimals) // kMP depends on decimals of asset, SLP is always 18
    const pending = usePendingSushi(pid)

    //console.log('pending:', pending, pid)
    const [approvalState, approve] = useApproveCallback(
        new TokenAmount(
            new Token(chainId || 1, pairAddressChecksum, balance.decimals, pairSymbol, ''),
            ethers.constants.MaxUint256.toString()
        ),
        MASTERCHEF_ADDRESS[42262]
    )

    const { deposit, withdraw, harvest } = useMasterChef()

    //console.log('depositValue:', depositValue)

    // console.log(toolTipShow)

    const toggleStakeModal = useToggleStakeModal()

    return (
        <>
            <div className="flex flex-col py-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2">
                    {type === 'LP' && (
                        <>
                            <Button
                                color="default"
                                onClick={() => history.push(`/add/${isWETH(token0Address)}/${isWETH(token1Address)}`)}
                            >
                                Add Liquidity

                            </Button>
                            <Button
                                color="default"
                                onClick={() =>
                                    history.push(`/remove/${isWETH(token0Address)}/${isWETH(token1Address)}`)
                                }
                            >
                                Remove Liquidity
                            </Button>
                        </>
                    )}
                </div>

                {(approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING) && (
                    <div className="px-4">
                        <Button color="blue" disabled={approvalState === ApprovalState.PENDING} onClick={approve}>
                            {approvalState === ApprovalState.PENDING ? <Dots>Approving </Dots> : 'Approve'}
                        </Button>
                    </div>
                )}
                {approvalState === ApprovalState.APPROVED && (
                    <div className="grid grid-cols-2 gap-4 px-4">
                        {/* Deposit */}
                        <div className="col-span-2 text-center md:col-span-1">
                            {account && (
                                <div className="pr-4 mb-2 text-sm text-right cursor-pointer text-secondary">
                                    Wallet Balance: {formattedNum(fixedFormatting(balance.value, balance.decimals))}{' '}
                                    {type}
                                </div>
                            )}
                            <div className="relative flex items-center w-full mb-4">
                                <NumericalInput
                                    className="w-full p-3 rounded bg-input focus:ring focus:ring-blue"
                                    value={depositValue}
                                    onUserInput={value => {
                                        setDepositValue(value)
                                    }}
                                />
                                {account && (
                                  <Button
                                    variant="outlined"
                                    color="blue"
                                    onClick={() => {
                                        setDepositValue(fixedFormatting(balance.value, balance.decimals))
                                    }}
                                    style={spanStyles}
                                    className="absolute border-0 right-4 focus:ring focus:ring-blue"
                                  >
                                      MAX
                                  </Button>
                                )}
                            </div>

                            <Button
                                color="blue"
                                disabled={
                                    pendingTx ||
                                    !balance ||
                                    Number(depositValue) === 0 ||
                                    Number(depositValue) > Number(fixedFormatting(balance.value, balance.decimals))
                                }
                                onClick={async () => {
                                    setPendingTx(true)
                                    await deposit(pid, depositValue, pairSymbol, balance.decimals)
                                    setPendingTx(false)
                                }}
                            >
                                Deposit
                            </Button>
                        </div>
                        {/* Withdraw */}
                        <div className="col-span-2 text-center md:col-span-1">
                            {account && (
                                <div className="pr-4 mb-2 text-sm text-right cursor-pointer text-secondary">
                                    Deposited: {formattedNum(fixedFormatting(staked.value, staked.decimals))} {type}
                                </div>
                            )}
                            <div className="relative flex items-center w-full mb-4">
                                <NumericalInput
                                    className="w-full p-3 rounded bg-input focus:ring focus:ring-pink"
                                    value={withdrawValue}
                                    onUserInput={value => {
                                        setWithdrawValue(value)
                                    }}
                                />
                                
                                {account && (
                                    <Button
                                        variant="outlined"
                                        color="pink"
                                        onClick={() => {
                                            setWithdrawValue(fixedFormatting(staked.value, staked.decimals))
                                        }}
                                        style={spanStyles}
                                        className="absolute border-0 right-4 focus:ring focus:ring-pink"
                                    >
                                        MAX
                                    </Button>
                                )}
                            </div>
                            <Button
                                color="pink"
                                className="border-0"
                                disabled={
                                    pendingTx ||
                                    Number(withdrawValue) === 0 ||
                                    Number(withdrawValue) > Number(fixedFormatting(staked.value, staked.decimals))
                                }
                                onClick={async () => {
                                    setPendingTx(true)
                                    await withdraw(pid, withdrawValue, pairSymbol, balance.decimals)
                                    setPendingTx(false)
                                }}
                            >
                                Withdraw
                            </Button>
                        </div>
                    </div>
                )}
                {pending && Number(pending) > 0 && (
                    <HarvestContainer
                        className="px-4"

                    >
                        <Button
                            color="default"
                            onClick={async () => {
                                setPendingTx(true)
                                await harvest(pid, pairSymbol)
                                setPendingTx(false)
                                toggleStakeModal()

                            }}
                        >
                            Harvest{'  '}
                            {formattedNum(pending)} BLING
                        </Button>
                    </HarvestContainer>
                )}
            </div>
        </>
    )
}

const HarvestContainer = styled.div`
    & > div {
        width: 100%;
    }
`
