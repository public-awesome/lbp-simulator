import Head from 'next/head';
import { useState, useEffect, useCallback, useRef } from 'react';
import { RadioGroup } from '@headlessui/react';
import dynamic from 'next/dynamic';
import {
  formatDateHours,
  formateNumberDecimals,
  formateNumberPriceDecimals,
} from './util/helpers';

const PriceChart = dynamic(() => import('./components/charts/price'), {
  ssr: false,
});

const lengthOptions = [{ name: '3d' }, { name: '5d' }, { name: '7d' }];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
interface FormProps {
  onRun?: () => {};
}

const Form: React.FC<FormProps> = ({ onRun }) => {
  const [length, setLength] = useState(lengthOptions[1]);
  return (
    <form className="space-y-8 divide-y divide-gray-200">
      <div className="max-w-md">
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6">
          <div className="col-span-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Initial Weigth
            </h3>
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="initial-stars-weight"
              className="block text-sm font-medium text-gray-700"
            >
              STARS
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="initial-stars-weight"
                id="initial-stars-weight"
                placeholder={'90'}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-40  sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="initial-osmo-weight"
              className="block text-sm font-medium text-gray-700"
            >
              OSMO
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="initial-osmo-weight"
                id="initial-osmo-weight"
                placeholder="10 "
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-40 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="col-span-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Target Weigth
            </h3>
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="end-stars-weight"
              className="block text-sm font-medium text-gray-700"
            >
              STARS
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="end-stars-weight"
                id="end-stars-weight"
                placeholder={'1'}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-40  sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="end-osmo-weight"
              className="block text-sm font-medium text-gray-700"
            >
              OSMO
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="end-osmo-weight"
                id="end-osmo-weight"
                placeholder="1"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-40 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="col-span-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Duration
              </h3>
            </div>
            <RadioGroup value={length} onChange={setLength} className="mt-2">
              <RadioGroup.Label className="sr-only">
                Choose a length
              </RadioGroup.Label>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {lengthOptions.map((option) => (
                  <RadioGroup.Option
                    key={option.name}
                    value={option}
                    className={({ active, checked }) =>
                      classNames(
                        'cursor-pointer focus:outline-none',
                        active ? 'ring-2 ring-offset-2 ring-indigo-500' : '',
                        checked
                          ? 'bg-indigo-600 border-transparent text-white hover:bg-indigo-700'
                          : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50',
                        'border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium uppercase sm:flex-1'
                      )
                    }
                  >
                    <RadioGroup.Label as="p">{option.name}</RadioGroup.Label>
                  </RadioGroup.Option>
                ))}
              </div>
            </RadioGroup>
          </div>
          <div className="col-span-6  ">
            <label
              htmlFor="volume"
              className="block text-sm font-medium text-gray-700"
            >
              Daily Volume
            </label>
            <div className="mt-1">
              <input
                id="volume"
                name="volume"
                type="number"
                placeholder="1000000"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        <div className="pt-5">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Run
          </button>
        </div>
      </div>
    </form>
  );
};
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      // @ts-ignore
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
function Chart() {
  const [data, setData] = useState([]);
  const [dataHover, setDataHover] = useState({
    price: '0',
    date: '-',
    value: 0.0,
  });
  const [selectTypeChart, setSelectTypeChart] = useState('price');
  const [osmoPrice, setOsmoPrice] = useState(0.0);
  const [price, setPrice] = useState(0);
  const fetchOsmoPrice = () => {
    fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=osmosis&vs_currencies=usd'
    )
      .then((resp) => resp.json())
      .then((data) => {
        setOsmoPrice(data.osmosis.usd);
      });
  };
  useEffect(() => {
    fetch('/api/simulate')
      .then((resp) => resp.json())
      .then((data) => {
        setData(data.data);
        const first = data.data[0];
        const price = formateNumberDecimals(first.value, 6);
        const currentDate = new Date(first.time * 1000);
        setDataHover({
          price,
          value: first.value,
          date: formatDateHours(currentDate),
        });
      });
    fetchOsmoPrice();
  }, []);
  useInterval(() => {
    fetchOsmoPrice();
  }, 5000);

  const crossMove = useCallback(
    (event, serie) => {
      if (event.time) {
        const price = formateNumberDecimals(event.seriesPrices.get(serie), 6);
        const currentDate = new Date(event.time * 1000);
        setDataHover({
          price,
          value: event.seriesPrices.get(serie),
          date: formatDateHours(currentDate),
        });
      }
    },
    [selectTypeChart]
  );

  useEffect(() => {
    console.log(dataHover.value * osmoPrice);
    setPrice(dataHover.value * osmoPrice);
  }, [dataHover, osmoPrice]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <p>Exchange Rate: {dataHover.price}</p>
      <p>OSMO Price: {formateNumberPriceDecimals(osmoPrice)}</p>
      <p>STARS Price: {formateNumberPriceDecimals(price, 6)}</p>
      <p>DateTime: {dataHover.date}</p>
      <PriceChart data={data} crossMove={crossMove} />
    </div>
  );
}
export default function Home() {
  return (
    <div>
      <Head>
        <title>LBP Simulator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-full mx-auto sm:px-6 lg:px-8 min-h-screen">
        <h1 className="text-6xl font-bold text-blue-600">LBP Simulator</h1>
        <div className="flex-1 relative z-0 flex overflow-hidden h-5/6 ">
          <main className="flex-1 relative z-0  focus:outline-none xl:order-last p-2">
            <Chart />
          </main>
          <aside className="hidden relative xl:order-first xl:flex xl:flex-col flex-shrink-0 w-96 border-r border-gray-200 overflow-y-auto p-3">
            <Form />
          </aside>
        </div>
      </div>
    </div>
  );
}
