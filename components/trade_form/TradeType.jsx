import { Listbox } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'
import { useTranslation } from 'next-i18next'

const TradeType = ({
  value,
  onChange,
  offerTriggers = false,
  className = '',
}) => {
  const { t } = useTranslation('common')
  const TRADE_TYPES = ['Limit', 'Market']
  if (offerTriggers)
    TRADE_TYPES.push(
      'Stop Loss',
      'Stop Limit',
      'Take Profit',
      'Take Profit Limit'
    )

  return (
    <div className={`relative ${className}`}>
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <>
            <Listbox.Button
              className={`font-normal w-full bg-th-bkg-1 border border-th-bkg-3 px-2 h-10 hover:border-th-bkg-4 rounded-md focus:outline-none focus:border-th-primary`}
            >
              <div className={`flex items-center justify-between space-x-4`}>
                <span>{t(value?.toLowerCase()?.replace(/\s/g, '-'))}</span>
                {open ? (
                  <ChevronUpIcon className={`h-5 w-5 mr-1 text-th-primary`} />
                ) : (
                  <ChevronDownIcon className={`h-5 w-5 mr-1 text-th-primary`} />
                )}
              </div>
            </Listbox.Button>
            {open ? (
              <Listbox.Options
                static
                className={`z-20 w-full p-1 absolute left-0 mt-1 bg-th-bkg-1 origin-top-left divide-y divide-th-bkg-3 shadow-lg outline-none rounded-md text-left`}
              >
                {TRADE_TYPES.map((type) => (
                  <Listbox.Option key={type} value={type}>
                    {({ selected }) => (
                      <div
                        className={`p-2 hover:bg-th-bkg-2 hover:cursor-pointer tracking-wider ${
                          selected && `text-th-primary`
                        }`}
                      >
                        {t(type?.toLowerCase()?.replace(/\s/g, '-'))}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            ) : null}
          </>
        )}
      </Listbox>
    </div>
  )
}

export default TradeType
