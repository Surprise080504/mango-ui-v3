import { useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { Disclosure } from '@headlessui/react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ChevronDownIcon } from '@heroicons/react/solid'
import ButtonGroup from './ButtonGroup'
import { numberCompacter, numberFormatter } from './SwapTokenInfo'
import Button, { IconButton } from './Button'
import Input from './Input'
import { SearchIcon, XIcon } from '@heroicons/react/outline'
import { useTranslation } from 'next-i18next'

const filterByVals = ['change-percent', '24h-volume']
const timeFrameVals = ['24h', '7d', '30d']
const insightTypeVals = ['best', 'worst']

dayjs.extend(relativeTime)

const SwapTokenInsights = ({ formState, jupiterTokens, setOutputToken }) => {
  const [tokenInsights, setTokenInsights] = useState([])
  const [filteredTokenInsights, setFilteredTokenInsights] = useState([])
  const [insightType, setInsightType] = useState(insightTypeVals[0])
  const [filterBy, setFilterBy] = useState(filterByVals[0])
  const [timeframe, setTimeframe] = useState(timeFrameVals[0])
  const [textFilter, setTextFilter] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation(['common', 'swap'])

  const getTokenInsights = async () => {
    setLoading(true)
    const ids = jupiterTokens
      .filter((token) => token?.extensions?.coingeckoId)
      .map((token) => token.extensions.coingeckoId)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.toString()}&order=market_cap_desc&sparkline=false&price_change_percentage=24h,7d,30d`
    )
    const data = await response.json()
    setLoading(false)
    setTokenInsights(data)
  }

  useEffect(() => {
    if (filterBy === filterByVals[0] && textFilter === '') {
      //filter by 'change %'
      setFilteredTokenInsights(
        tokenInsights
          .sort((a, b) =>
            insightType === insightTypeVals[0] //insight type 'best'
              ? b[`price_change_percentage_${timeframe}_in_currency`] -
                a[`price_change_percentage_${timeframe}_in_currency`]
              : a[`price_change_percentage_${timeframe}_in_currency`] -
                b[`price_change_percentage_${timeframe}_in_currency`]
          )
          .slice(0, 10)
      )
    }
    if (filterBy === filterByVals[1] && textFilter === '') {
      //filter by 24h vol
      setFilteredTokenInsights(
        tokenInsights
          .sort((a, b) =>
            insightType === insightTypeVals[0] //insight type 'best'
              ? b.total_volume - a.total_volume
              : a.total_volume - b.total_volume
          )
          .slice(0, 10)
      )
    }
    if (textFilter !== '') {
      setFilteredTokenInsights(
        tokenInsights.filter(
          (token) =>
            token.name.includes(textFilter) || token.symbol.includes(textFilter)
        )
      )
    }
  }, [filterBy, insightType, textFilter, timeframe, tokenInsights])

  useEffect(() => {
    if (jupiterTokens) {
      getTokenInsights()
    }
  }, [])

  const handleToggleSearch = () => {
    setShowSearch(!showSearch)
    setTextFilter('')
  }

  return filteredTokenInsights ? (
    <div>
      <div className="flex items-end mb-3 space-x-2">
        {!showSearch ? (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full">
            <div className="mb-2 lg:mb-0 w-44">
              <ButtonGroup
                activeValue={filterBy}
                className="h-10"
                onChange={(t) => setFilterBy(t)}
                values={filterByVals}
                names={filterByVals.map((val) => t(`swap:${val}`))}
              />
            </div>
            <div className="flex space-x-2">
              {filterBy === filterByVals[0] ? ( //filter by change %
                <div className="w-36">
                  <ButtonGroup
                    activeValue={timeframe}
                    className="h-10"
                    onChange={(t) => setTimeframe(t)}
                    values={timeFrameVals}
                  />
                </div>
              ) : null}
              <div className="w-28">
                <ButtonGroup
                  activeValue={insightType}
                  className="h-10"
                  onChange={(t) => setInsightType(t)}
                  values={insightTypeVals}
                  names={insightTypeVals.map((val) => t(`swap:${val}`))}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <Input
              type="text"
              placeholder="Search tokens..."
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              prefix={<SearchIcon className="h-4 text-th-fgd-3 w-4" />}
            />
          </div>
        )}
        <IconButton
          className="flex-shrink-0 h-10 w-10"
          onClick={() => handleToggleSearch()}
        >
          {showSearch ? (
            <XIcon className="h-4 w-4" />
          ) : (
            <SearchIcon className="h-4 w-4" />
          )}
        </IconButton>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="animate-pulse bg-th-bkg-3 h-12 rounded-md w-full" />
          <div className="animate-pulse bg-th-bkg-3 h-12 rounded-md w-full" />
          <div className="animate-pulse bg-th-bkg-3 h-12 rounded-md w-full" />
        </div>
      ) : filteredTokenInsights.length > 0 ? (
        filteredTokenInsights.map((insight) => {
          const jupToken = jupiterTokens.find(
            (t) => t?.extensions?.coingeckoId === insight.id
          )
          return (
            <Disclosure key={insight.id}>
              {({ open }) => (
                <>
                  <div
                    className={`border-b default-transition flex items-center p-2 hover:bg-th-bkg-2 ${
                      open
                        ? 'bg-th-bkg-2 border-transparent'
                        : 'border-th-bkg-4'
                    }`}
                  >
                    <Disclosure.Button
                      className="flex font-normal items-center justify-between text-th-fgd-1 w-full"
                      key={insight.symbol}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`min-w-[48px] text-xs ${
                            timeframe === timeFrameVals[0] //timeframe 24h
                              ? insight.price_change_percentage_24h_in_currency >=
                                0
                                ? 'text-th-green'
                                : 'text-th-red'
                              : timeframe === timeFrameVals[1] //timeframe 7d
                              ? insight.price_change_percentage_7d_in_currency >=
                                0
                                ? 'text-th-green'
                                : 'text-th-red'
                              : insight.price_change_percentage_30d_in_currency >=
                                0
                              ? 'text-th-green'
                              : 'text-th-red'
                          }`}
                        >
                          {timeframe === timeFrameVals[0] //timeframe 24h
                            ? insight.price_change_percentage_24h_in_currency
                              ? `${insight.price_change_percentage_24h_in_currency.toFixed(
                                  1
                                )}%`
                              : '?'
                            : timeframe === timeFrameVals[1] //timeframe 7d
                            ? insight.price_change_percentage_7d_in_currency
                              ? `${insight.price_change_percentage_7d_in_currency.toFixed(
                                  1
                                )}%`
                              : '?'
                            : insight.price_change_percentage_30d_in_currency
                            ? `${insight.price_change_percentage_30d_in_currency.toFixed(
                                1
                              )}%`
                            : '?'}
                        </div>
                        {insight.image ? (
                          <img
                            src={insight.image}
                            width="24"
                            height="24"
                            alt={insight.name}
                            className="hidden lg:block rounded-full"
                          />
                        ) : (
                          <div className="bg-th-bkg-3 h-6 inline-flex items-center justify-center rounded-full text-th-fgd-3 text-xs w-6">
                            ?
                          </div>
                        )}
                        <div className="text-left">
                          <div className="font-bold">
                            {insight?.symbol?.toUpperCase()}
                          </div>
                          <div className="text-th-fgd-3 text-xs">
                            {insight.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center pl-2 space-x-3 text-right text-xs">
                        <div>
                          <div className="mb-[4px] text-th-fgd-4">
                            {t('price')}
                          </div>
                          <div className="text-th-fgd-3">
                            $
                            {insight.current_price.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                            })}
                          </div>
                        </div>
                        <div className="border-l border-th-bkg-4" />
                        <div>
                          <div className="mb-[4px] text-th-fgd-4">
                            {t('swap:24h-vol')}
                          </div>
                          <div className="text-th-fgd-3">
                            {insight.total_volume > 0
                              ? `$${numberCompacter.format(
                                  insight.total_volume
                                )}`
                              : '?'}
                          </div>
                        </div>
                        <ChevronDownIcon
                          className={`default-transition h-5 text-th-fgd-3 w-5 ${
                            open
                              ? 'transform rotate-180'
                              : 'transform rotate-360'
                          }`}
                        />
                      </div>
                    </Disclosure.Button>
                    <Button
                      className="hidden lg:block ml-3 pl-3 pr-3 text-xs"
                      onClick={() =>
                        setOutputToken({
                          ...formState,
                          outputMint: new PublicKey(jupToken.address),
                        })
                      }
                    >
                      {t('buy')}
                    </Button>
                  </div>
                  <Disclosure.Panel className="bg-th-bkg-2 border-b border-th-bkg-4 px-2 pb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 grid-flow-row">
                      {insight.market_cap_rank ? (
                        <div className="border border-th-bkg-4 m-1 p-3 rounded-md">
                          <div className="text-th-fgd-3 text-xs">
                            {t('swap:market-cap-rank')}
                          </div>
                          <div className="font-bold text-th-fgd-1">
                            #{insight.market_cap_rank}
                          </div>
                        </div>
                      ) : null}
                      {insight?.market_cap && insight?.market_cap !== 0 ? (
                        <div className="border border-th-bkg-4 m-1 p-3 rounded-md">
                          <div className="text-th-fgd-3 text-xs">
                            {t('swap:market-cap')}
                          </div>
                          <div className="font-bold text-th-fgd-1">
                            ${numberCompacter.format(insight.market_cap)}
                          </div>
                        </div>
                      ) : null}
                      {insight?.circulating_supply ? (
                        <div className="border border-th-bkg-4 m-1 p-3 rounded-md">
                          <div className="text-th-fgd-3 text-xs">
                            {t('swap:token-supply')}
                          </div>
                          <div className="font-bold text-th-fgd-1">
                            {numberCompacter.format(insight.circulating_supply)}
                          </div>
                          {insight?.max_supply ? (
                            <div className="text-th-fgd-2 text-xs">
                              {t('swap:max-supply')}
                              {': '}
                              {numberCompacter.format(insight.max_supply)}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {insight?.ath ? (
                        <div className="border border-th-bkg-4 m-1 p-3 rounded-md">
                          <div className="text-th-fgd-3 text-xs">
                            {t('swap:ath')}
                          </div>
                          <div className="flex">
                            <div className="font-bold text-th-fgd-1">
                              ${numberFormatter.format(insight.ath)}
                            </div>
                            {insight?.ath_change_percentage ? (
                              <div
                                className={`ml-1.5 mt-0.5 text-xs ${
                                  insight?.ath_change_percentage >= 0
                                    ? 'text-th-green'
                                    : 'text-th-red'
                                }`}
                              >
                                {insight.ath_change_percentage.toFixed(2)}%
                              </div>
                            ) : null}
                          </div>
                          {insight?.ath_date ? (
                            <div className="text-th-fgd-2 text-xs">
                              {dayjs(insight.ath_date).fromNow()}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {insight?.atl ? (
                        <div className="border border-th-bkg-4 m-1 p-3 rounded-md">
                          <div className="text-th-fgd-3 text-xs">
                            {t('swap:atl')}
                          </div>
                          <div className="flex">
                            <div className="font-bold text-th-fgd-1">
                              ${numberFormatter.format(insight.atl)}
                            </div>
                            {insight?.atl_change_percentage ? (
                              <div
                                className={`ml-1.5 mt-0.5 text-xs ${
                                  insight?.atl_change_percentage >= 0
                                    ? 'text-th-green'
                                    : 'text-th-red'
                                }`}
                              >
                                {(insight?.atl_change_percentage).toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                                %
                              </div>
                            ) : null}
                          </div>
                          {insight?.atl_date ? (
                            <div className="text-th-fgd-2 text-xs">
                              {dayjs(insight.atl_date).fromNow()}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <Button
                      className="block lg:hidden my-2 text-xs w-full"
                      onClick={() =>
                        setOutputToken({
                          ...formState,
                          outputMint: new PublicKey(jupToken.address),
                        })
                      }
                    >
                      {t('buy')}
                    </Button>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          )
        })
      ) : (
        <div className="bg-th-bkg-3 mt-3 p-4 rounded-md text-center text-th-fgd-3">
          {t('swap:no-tokens-found')}
        </div>
      )}
    </div>
  ) : (
    <div className="bg-th-bkg-3 mt-3 p-4 rounded-md text-center text-th-fgd-3">
      {t('swap:insights-not-available')}
    </div>
  )
}

export default SwapTokenInsights
