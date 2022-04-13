import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Input as NumericalInput } from 'components/NumericalInput'
import { Dots } from '../Pool/styleds'
import { useActiveWeb3React } from 'hooks'

import useTokenBalance from 'sushi-hooks/useTokenBalance'
import { useStakedBalanceDual } from 'sushi-hooks/useStakedBalance'
import { usePendingDual } from 'sushi-hooks/usePendingSushi'
import { useMasterChefDual } from 'sushi-hooks/useMasterChef'

import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { Token, TokenAmount, MASTERCHEF_ADDRESS } from '@sushiswap/sdk'

import { ethers } from 'ethers'
import { Button } from './components'
import { isAddressString, formattedNum, isWETH } from 'utils'
import Fraction from 'constants/Fraction'
import { BigNumber } from '@ethersproject/bignumber'
import styled from 'styled-components'

const fixedFormatting = (value: BigNumber, decimals?: number) => {
    return Fraction.from(value, BigNumber.from(10).pow(BigNumber.from(decimals))).toString(decimals)
}

export default function InputGroup({
    pairAddress,
    pid,
    poolAddress,
    rewardA,
    rewardB,
    pairSymbol,
    token0Address,
    token1Address,
    type,
    assetSymbol,
    assetDecimals = 18
}: {
    pairAddress: string
    pid: number
    poolAddress: string
    rewardA: string
    rewardB: string
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
    const staked = useStakedBalanceDual(poolAddress, assetDecimals) // kMP depends on decimals of asset, SLP is always 18
    const [pendingA, pendingB] = usePendingDual(poolAddress)
    //console.log('pending:', pending, pid)
    const [approvalState, approve] = useApproveCallback(
        new TokenAmount(
            new Token(chainId || 1, pairAddressChecksum, balance.decimals, pairSymbol, ''),
            ethers.constants.MaxUint256.toString()
        ),
        poolAddress
    )

    const { deposit, withdraw, harvest } = useMasterChefDual(poolAddress)

    return (
        <>
            <div className="flex flex-col py-6 space-y-4" style={{ padding: '0 15%' }}>
                <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2">
                    {/* {(type === 'LP' || type === 'DLP') && (
                        <>
                            <LiquidityButton
                                color="default"
                                onClick={() => history.push(`/add/${isWETH(token0Address)}/${isWETH(token1Address)}`)}
                            >
                                Add Liquidity
                            </LiquidityButton>
                            <LiquidityButton
                                color="default"
                                onClick={() =>
                                    history.push(`/remove/${isWETH(token0Address)}/${isWETH(token1Address)}`)
                                }
                            >
                                Remove Liquidity
                            </LiquidityButton>
                        </>
                    )} */}
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
                                    className="w-full p-3 text-white bg-black rounded"
                                    value={depositValue}
                                    onUserInput={value => {
                                        setDepositValue(value)
                                    }}
                                />
                                {account && (
                                    <DepositMaxButton
                                        variant="outlined"
                                        color="blue"
                                        onClick={() => {
                                            setDepositValue(fixedFormatting(balance.value, balance.decimals))
                                        }}
                                        className="absolute border-0 right-4 focus:ring focus:ring-blue"
                                    >
                                        MAX
                                    </DepositMaxButton>
                                )}
                            </div>
                            <DepositButton
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
                            </DepositButton>
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
                                    className="w-full p-3 text-white bg-black rounded"
                                    value={withdrawValue}
                                    onUserInput={value => {
                                        setWithdrawValue(value)
                                    }}
                                />
                                {account && (
                                    <WithdrawMaxButton
                                        variant="outlined"
                                        color="pink"
                                        onClick={() => {
                                            setWithdrawValue(fixedFormatting(staked.value, staked.decimals))
                                        }}
                                        className="absolute border-0 right-4 focus:ring focus:ring-pink"
                                    >
                                        MAX
                                    </WithdrawMaxButton>
                                )}
                            </div>
                            <WithdrawButton
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
                            </WithdrawButton>
                        </div>
                    </div>
                )}
                {pendingA && Number(pendingA) > 0 && (
                    <HarvestContainer className="px-4">
                        <Button
                            color="default"
                            onClick={async () => {
                                setPendingTx(true)
                                await harvest(pid, pairSymbol)
                                setPendingTx(false)
                            }}
                        >
                            Harvest{'  '}
                            {formattedNum(pendingA)} {rewardA} -{formattedNum(pendingB)} {rewardB}
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

    button {
        background: linear-gradient(91.29deg, #39a894 -4.84%, #3e8ed7 97.49%);
        border: 0 !important;
        box-sizing: border-box;
        border: 1px solid transparent !important;

        &:hover {
            background: #000;
            border: 1px solid #fff !important;
        }
    }
`

const LiquidityButton = styled(Button)`
    border: 1px solid #fff !important;
    color: #fff !important;
`
const DepositButton = styled(Button)`
    background-color: #3e8ed7 !important;
    transition: box-shadow 0.3s

    &:hover {
        box-shadow: 0 0 3px 2px rgba(0, 97, 165, 0.8);
    }
`

const DepositMaxButton = styled(Button)`
    background-color: rgba(0, 97, 165, 0.8) !important;
    color: #000 !important;
    height: 27px !important;
    border-radius: 14px !important;
`

const WithdrawButton = styled(Button)`
    background-color: #b276d9 !important;
    transition: box-shadow 0.3s

    &:hover {
        box-shadow: 0 0 3px 2px rgba(129, 72, 167, 0.8);
    }
`

const WithdrawMaxButton = styled(Button)`
    background-color: rgba(129, 72, 167, 0.8) !important;
    color: #000 !important;
    height: 27px !important;
    border-radius: 14px !important;
`
