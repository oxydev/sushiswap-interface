import { ChainId } from '@sushiswap/sdk'
import Button from '../../components/MisoButton'
import Typography from '../../components/Typography'
import { Feature } from '../../enums'
import AuctionCard from '../../features/miso/AuctionCard'
import { useAuctions } from '../../features/miso/context/hooks/useAuction'
import { AuctionStatus } from '../../features/miso/context/types'
import { classNames } from '../../functions/styling'
import NetworkGuard from '../../guards/Network'
import MisoLayout, { MisoBody, MisoHeader } from '../../layouts/Miso'
import { useActiveWeb3React } from 'hooks'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import React from 'react'
import { useTranslation } from 'react-i18next'
const queryToAuctionStatus = {
    live: AuctionStatus.LIVE,
    upcoming: AuctionStatus.UPCOMING,
    finished: AuctionStatus.FINISHED
}

const Miso = () => {
    const { t } = useTranslation()
    const query = useSearchParams()
    console.log(query)
    const { chainId } = useActiveWeb3React()
    // @ts-ignore TYPE NEEDS FIXING
    const auctions = useAuctions(queryToAuctionStatus[query?.status as string] ?? AuctionStatus.LIVE)

    const tabs = [
        { key: AuctionStatus.LIVE, value: t('Live'), link: 'live' },
        { key: AuctionStatus.UPCOMING, value: t('Upcoming'), link: 'upcoming' },
        { key: AuctionStatus.FINISHED, value: t('Finished'), link: 'finished' }
    ]

    return (
        <>
            <MisoHeader>
                <div className="flex flex-col justify-between gap-8 lg:flex-row">
                    <div className="flex flex-col">
                        <Typography variant="hero" weight={700} className="text-white">
                            {t('Miso')}
                        </Typography>
                        <Typography weight={700}>
                            {t(
                                'Use with caution, this is experimental and permissionless. Due dilligence is required.'
                            )}
                        </Typography>
                    </div>
                    {(chainId === ChainId.HARMONY || chainId === ChainId.KOVAN || chainId === ChainId.MOONBEAM) && (
                        <div className="flex items-center gap-4">
                            <div>
                                <Link to="/miso/auction">
                                    <Button color="blue" className="rounded-full">
                                        {t('Create Auction')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </MisoHeader>
            <MisoBody>
                <section className="flex flex-col gap-10">
                    <div className="flex flex-col">
                        <div
                            className="flex flex-row space-x-8 overflow-x-auto overflow-y-hidden whitespace-nowrap"
                            aria-label="Tabs"
                        >
                            {tabs.map(tab => (
                                <Link to={`/miso?status=${tab.link}`} key={tab.key}>
                                    <div className="h-full space-y-2 cursor-pointer">
                                        <Typography
                                            weight={700}
                                            className={classNames(
                                                // @ts-ignore TYPE NEEDS FIXING
                                                tab.key === queryToAuctionStatus[query?.status as string] ||
                                                    tab.key === AuctionStatus.LIVE
                                                    ? 'bg-gradient-to-r from-red to-pink bg-clip-text text-transparent'
                                                    : '',
                                                'font-bold text-sm text-high-emphesis'
                                            )}
                                        >
                                            {tab.value}
                                        </Typography>
                                        <div
                                            className={classNames(
                                                // @ts-ignore TYPE NEEDS FIXING
                                                tab.key === queryToAuctionStatus[query?.status as string]
                                                    ? 'relative bg-gradient-to-r from-red to-pink h-[3px] w-full'
                                                    : ''
                                            )}
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Typography variant="lg" weight={700} className="text-high-emphesis">
                            {auctions?.length} Results
                        </Typography>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {auctions?.map((auction, index) => {
                                return <AuctionCard auction={auction} key={index} />
                            })}
                        </div>
                    </div>
                </section>
            </MisoBody>
        </>
    )
}

Miso.Layout = MisoLayout
Miso.Guard = NetworkGuard(Feature.MISO)

export default Miso
