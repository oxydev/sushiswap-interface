import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { useActiveWeb3React } from 'hooks'
import { useDualContract, useMasterChefContract } from './useContract'
import { useBlockNumber } from 'state/application/hooks'

import Fraction from 'constants/Fraction'

const usePending = (pid: number) => {
    const [balance, setBalance] = useState<string>('0')
    const { account } = useActiveWeb3React()

    const masterChefContract = useMasterChefContract()
    const currentBlockNumber = useBlockNumber()

    const fetchPending = useCallback(async () => {
        const pending = await masterChefContract?.pendingBling(pid, account)
        const userInfo = await masterChefContract?.userInfo(pid, account)
        const formatted = Fraction.from(
            BigNumber.from(pending.add(userInfo.unclaimedReward)),
            BigNumber.from(10).pow(18)
        ).toString()
        setBalance(formatted)
    }, [account, masterChefContract, pid])

    useEffect(() => {
        if (account && masterChefContract && String(pid)) {
            // pid = 0 is evaluated as false
            fetchPending()
        }
    }, [account, currentBlockNumber, fetchPending, masterChefContract, pid])

    return balance
}

export const usePendingDual = (poolAddress: string) => {
    const [balanceA, setBalanceA] = useState<string>('0')
    const [balanceB, setBalanceB] = useState<string>('0')
    const { account } = useActiveWeb3React()

    const dualContract = useDualContract(poolAddress)
    const currentBlockNumber = useBlockNumber()

    const fetchPending = useCallback(async () => {
        const earnedA = await dualContract?.earnedA(account)
        const earnedB = await dualContract?.earnedB(account)
        const formattedA = Fraction.from(
          BigNumber.from(earnedA),
          BigNumber.from(10).pow(18)
        ).toString()
        setBalanceA(formattedA)
        const formattedB = Fraction.from(
          BigNumber.from(earnedB),
          BigNumber.from(10).pow(18)
        ).toString()
        setBalanceB(formattedB)
    }, [account, dualContract, poolAddress])

    useEffect(() => {
        if (account && dualContract && poolAddress) {
            // pid = 0 is evaluated as false
            fetchPending()
        }
    }, [account, currentBlockNumber, fetchPending, poolAddress, dualContract])

    return [balanceA,balanceB]
}

export default usePending
