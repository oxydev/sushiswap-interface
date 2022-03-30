import { ChainId } from '@sushiswap/sdk'
import { GRAPH_HOST } from '../constants'
import { barHistoriesQuery, barQuery } from '../queries/bar'
import { request } from 'graphql-request'

const BAR = {
  [ChainId.MAINNET]: 'matthewlilley/bar',
}

// @ts-ignore TYPE NEEDS FIXING
const fetcher = async (query, variables = undefined) =>
  request(`${GRAPH_HOST[ChainId.MAINNET]}/subgraphs/name/${BAR[ChainId.MAINNET]}`, query, variables)

export const getBar = async (variables = undefined) => {
  const { bar } = await fetcher(barQuery, variables)
  return bar
}

export const getBarHistory = async (variables = undefined) => {
  const { histories } = await fetcher(barHistoriesQuery, variables)
  return histories
}
