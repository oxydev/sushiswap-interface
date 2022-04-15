import gql from 'graphql-tag'

export const barQuery = gql`
    query barQuery($id: String! = "0x25070fa2244b41ea39b964dbfa9e0ab70a886e72", $block: Block_height) {
        bar(id: $id, block: $block) {
            id
            totalSupply
            ratio
            xSushiMinted
            xSushiBurned
            sushiStaked
            sushiStakedUSD
            sushiHarvested
            sushiHarvestedUSD
            xSushiAge
            xSushiAgeDestroyed
            # histories(first: 1000) {
            #   id
            #   date
            #   timeframe
            #   sushiStaked
            #   sushiStakedUSD
            #   sushiHarvested
            #   sushiHarvestedUSD
            #   xSushiAge
            #   xSushiAgeDestroyed
            #   xSushiMinted
            #   xSushiBurned
            #   xSushiSupply
            #   ratio
            # }
        }
    }
`

export const barHistoriesQuery = gql`
    query barHistoriesQuery {
        histories(first: 1000) {
            id
            date
            timeframe
            sushiStaked
            sushiStakedUSD
            sushiHarvested
            sushiHarvestedUSD
            xSushiAge
            xSushiAgeDestroyed
            xSushiMinted
            xSushiBurned
            xSushiSupply
            ratio
        }
    }
`

export const barUserQuery = gql`
    query barUserQuery($id: String!) {
        user(id: $id) {
            id
            bar {
                totalSupply
                sushiStaked
            }
            xSushi
            sushiStaked
            sushiStakedUSD
            sushiHarvested
            sushiHarvestedUSD
            xSushiIn
            xSushiOut
            xSushiOffset
            xSushiMinted
            xSushiBurned
            sushiIn
            sushiOut
            usdIn
            usdOut
            createdAt
            createdAtBlock
        }
    }
`
