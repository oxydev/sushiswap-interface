import { useCallback } from 'react'
import { useDualContract, useMasterChefContract } from './useContract'
import { useTransactionAdder } from '../state/transactions/hooks'
//import { BigNumber } from '@ethersproject/bignumber'
import { ethers } from 'ethers'

const useMasterChef = () => {
    const addTransaction = useTransactionAdder()
    const masterChefContract = useMasterChefContract() // withSigner

    // Deposit
    const deposit = useCallback(
        async (pid: number, amount: string, name: string, decimals = 18) => {
            // KMP decimals depend on asset, SLP is always 18
            // console.log('depositing...', pid, amount)
            try {
                const tx = await masterChefContract?.deposit(pid, ethers.utils.parseUnits(amount, decimals))
                return addTransaction(tx, { summary: `Deposit ${name}` })
            } catch (e) {
                console.error(e)
                return e
            }
        },
        [addTransaction, masterChefContract]
    )

    // Withdraw
    const withdraw = useCallback(
        async (pid: number, amount: string, name: string, decimals = 18) => {
            try {
                const tx = await masterChefContract?.withdraw(pid, ethers.utils.parseUnits(amount, decimals))
                return addTransaction(tx, { summary: `Withdraw ${name}` })
            } catch (e) {
                console.error(e)
                return e
            }
        },
        [addTransaction, masterChefContract]
    )

    const harvest = useCallback(
        async (pid: number, name: string) => {
            try {
                const tx = await masterChefContract?.withdraw(pid, '0')
                return addTransaction(tx, { summary: `Harvest ${name}` })
            } catch (e) {
                console.error(e)
                return e
            }
        },
        [addTransaction, masterChefContract]
    )

    return { deposit, withdraw, harvest }
}

export const useMasterChefDual = (poolAddress: string) => {
  const addTransaction = useTransactionAdder()
  const dualContract = useDualContract(poolAddress) // withSigner

  // Deposit
  const deposit = useCallback(
    async (pid: number, amount: string, name: string, decimals = 18) => {
      // KMP decimals depend on asset, SLP is always 18
      // console.log('depositing...', pid, amount)
      try {
        const tx = await dualContract?.stake(ethers.utils.parseUnits(amount, decimals))
        console.log(dualContract)
        return addTransaction(tx, { summary: `Staked ${name}` })
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [addTransaction, dualContract, poolAddress]
  )

  // Withdraw
  const withdraw = useCallback(
    async (pid: number, amount: string, name: string, decimals = 18) => {
      try {
        const tx = await dualContract?.withdraw(ethers.utils.parseUnits(amount, decimals))
        return addTransaction(tx, { summary: `Withdraw ${name}` })
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [addTransaction, dualContract, poolAddress]
  )

  const harvest = useCallback(
    async (pid: number, name: string) => {
      try {
        const tx = await dualContract?.getReward()
        return addTransaction(tx, { summary: `Harvest ${name}` })
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [addTransaction, dualContract, poolAddress]
  )

  return { deposit, withdraw, harvest }
}

export default useMasterChef