import Head from 'next/head';
import { useState, useEffect, useCallback, useRef } from 'react';
import { RadioGroup } from '@headlessui/react';
import dynamic from 'next/dynamic';
import {
  formatDateHours,
  formateNumberDecimals,
  formateNumberPriceDecimals,
  formaterNumber,
} from '../util/helpers';

const PriceChart = dynamic(() => import('../components/charts/price'), {
  ssr: false,
});

const lengthOptions = [
  { name: '3d', duration: '72h' },
  { name: '4d', duration: '96h' },
  { name: '5d', duration: '120h' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

interface Weight {
  stars: number;
  osmo: number;
}
interface Fees {
  swap: number;
  exit: number;
}
interface RunSettings {
  initialWeight: Weight;
  endWeight: Weight;
  deposit: Weight;
  duration: string;
  volume: number;
  fees: Fees;
}
interface FormProps {
  onRun?: (settings: RunSettings) => void;
}

const Form: React.FC<FormProps> = ({ onRun }) => {
  const [length, setLength] = useState(lengthOptions[0]);
  const [ready, setReady] = useState(false);
  const [initialWeight, setInitialweight] = useState<Weight>({
    stars: 36,
    osmo: 4,
  });
  const [initialDeposit, setInitialDeposit] = useState<Weight>({
    stars: 50000000,
    osmo: 135000,
  });
  const [endWeight, setEndweight] = useState<Weight>({ stars: 20, osmo: 20 });
  const [dailyVolume, setDailyVolume] = useState(1000000);
  const [osmoPrice, setOsmoPrice] = useState(0.0);
  const [fees, setFees] = useState({ swap: 0.02, exit: 0.001 });
  // initial price fetch
  useEffect(() => {
    fetch('https://api-osmosis.imperator.co/tokens/v1/price/OSMO')
      .then((resp) => resp.json())
      .then((data) => {
        setReady(true);
        setOsmoPrice(data.price);
      });
  }, []);

  const handleClick = useCallback(() => {
    if (onRun) {
      onRun({
        duration: length.duration,
        initialWeight: initialWeight,
        endWeight: endWeight,
        volume: Math.round(dailyVolume / osmoPrice),
        deposit: initialDeposit,
        fees: fees,
      });
    }
  }, [length, initialWeight, endWeight, dailyVolume, onRun, osmoPrice]);
  const initialWeightTotal = initialWeight.stars + initialWeight.osmo;
  const endWeightTotal = endWeight.stars + endWeight.osmo;
  return (
    <form className="space-y-8 divide-y divide-gray-200">
      <div className="max-w-md">
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6">
          <div className="col-span-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Initial Weight
            </h3>
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="initial-stars-weight"
              className="block text-sm font-medium text-gray-700"
            >
              STARS{' '}
              <span className="text-xs">
                (
                {formaterNumber(
                  (initialWeight.stars / initialWeightTotal) * 100
                )}
                %)
              </span>
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="initial-stars-weight"
                id="initial-stars-weight"
                value={initialWeight.stars}
                onChange={(e) => {
                  setInitialweight((prevWeight) => {
                    return {
                      stars: Number(e.target.value),
                      osmo: prevWeight.osmo,
                    };
                  });
                }}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-40  sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="initial-osmo-weight"
              className="block text-sm font-medium text-gray-700"
            >
              OSMO{' '}
              <span className="text-xs">
                (
                {formaterNumber(
                  (initialWeight.osmo / initialWeightTotal) * 100
                )}
                %)
              </span>
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="initial-osmo-weight"
                id="initial-osmo-weight"
                value={initialWeight.osmo}
                onChange={(e) => {
                  setInitialweight((prevWeight) => {
                    return {
                      stars: prevWeight.stars,
                      osmo: Number(e.target.value),
                    };
                  });
                }}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-40 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="col-span-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              End Weight
            </h3>
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="end-stars-weight"
              className="block text-sm font-medium text-gray-700"
            >
              STARS{' '}
              <span className="text-xs">
                ({formaterNumber((endWeight.stars / endWeightTotal) * 100)}
                %)
              </span>
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="end-stars-weight"
                id="end-stars-weight"
                value={endWeight.stars}
                onChange={(e) => {
                  setEndweight((prevWeight) => {
                    return {
                      stars: Number(e.target.value),
                      osmo: prevWeight.osmo,
                    };
                  });
                }}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-40  sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="end-osmo-weight"
              className="block text-sm font-medium text-gray-700"
            >
              OSMO{' '}
              <span className="text-xs">
                ({formaterNumber((endWeight.osmo / endWeightTotal) * 100)}
                %)
              </span>
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="end-osmo-weight"
                id="end-osmo-weight"
                value={endWeight.osmo}
                onChange={(e) => {
                  setEndweight((prevWeight) => {
                    return {
                      stars: prevWeight.stars,
                      osmo: Number(e.target.value),
                    };
                  });
                }}
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
              Daily Volume (in $USD)
            </label>
            <div className="mt-1">
              <input
                id="volume"
                name="volume"
                type="number"
                value={dailyVolume}
                onChange={(e) => {
                  setDailyVolume(Number(e.target.value));
                }}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="col-span-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Initial Deposit
            </h3>
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="initial-stars-deposit"
              className="block text-sm font-medium text-gray-700"
            >
              STARS
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="initial-stars-deposit"
                id="initial-stars-deposit"
                value={initialDeposit.stars}
                onChange={(e) => {
                  setInitialDeposit((prevWeight) => {
                    return {
                      stars: Number(e.target.value),
                      osmo: prevWeight.osmo,
                    };
                  });
                }}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-40  sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="initial-osmo-deposit"
              className="block text-sm font-medium text-gray-700"
            >
              OSMO
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="initial-osmo-deposit"
                id="initial-osmo-deposit"
                value={initialDeposit.osmo}
                onChange={(e) => {
                  setInitialDeposit((prevWeight) => {
                    return {
                      osmo: Number(e.target.value),
                      stars: prevWeight.stars,
                    };
                  });
                }}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-40  sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="col-span-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Fees
            </h3>
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="swap-fee"
              className="block text-sm font-medium text-gray-700"
            >
              Swap
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="swap-fee"
                id="swap-fee"
                value={fees.swap}
                min={0}
                max={1}
                step={0.001}
                onChange={(e) => {
                  setFees((prevFees) => {
                    return {
                      swap: Number(e.target.value),
                      exit: prevFees.exit,
                    };
                  });
                }}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-40  sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="exit"
              className="block text-sm font-medium text-gray-700"
            >
              Exit
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="exit"
                id="exit"
                value={fees.exit}
                min={0}
                max={1}
                step={0.001}
                onChange={(e) => {
                  setFees((prevFees) => {
                    return {
                      exit: Number(e.target.value),
                      swap: prevFees.swap,
                    };
                  });
                }}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-40  sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="pt-5">
          {ready ? (
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                handleClick();
              }}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Run
            </button>
          ) : null}
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

interface ChartOptions {
  simulation: SimulationResponse;
}
const Chart: React.FC<ChartOptions> = ({ simulation }) => {
  const [dataHover, setDataHover] = useState({
    price: '0',
    date: '-',
    value: 0.0,
  });
  const [selectTypeChart, setSelectTypeChart] = useState('price');
  const [osmoPrice, setOsmoPrice] = useState(0.0);
  const [price, setPrice] = useState(0);
  const fetchOsmoPrice = () => {
    fetch('https://api-osmosis.imperator.co/tokens/v1/price/OSMO')
      .then((resp) => resp.json())
      .then((data) => {
        setOsmoPrice(data.price);
      });
  };
  // initial price fetch
  useEffect(() => {
    fetchOsmoPrice();
  }, []);
  useEffect(() => {
    if (simulation.data.length > 0) {
      const first = simulation.data[0];
      const price = formateNumberDecimals(first.value, 6);
      const currentDate = new Date(first.time * 1000);
      setDataHover({
        price,
        value: first.value,
        date: formatDateHours(currentDate),
      });
    }
  }, [simulation]);
  useInterval(() => {
    fetchOsmoPrice();
  }, 10000);

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
    setPrice(dataHover.value * osmoPrice);
  }, [dataHover, osmoPrice]);

  const startPrice =
    simulation.data.length > 0 ? simulation.data[0].value * osmoPrice : 0.0;
  const endPrice =
    simulation.data.length > 0
      ? simulation.data[simulation.data.length - 1].value * osmoPrice
      : 0.0;
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <SimulationInfo
        initial_assets={simulation.initial_assets}
        end_assets={simulation.end_assets}
        daily_volume={simulation.daily_volume}
        total_volume={simulation.total_volume}
        total_buys={simulation.total_buys}
        startPrice={startPrice}
        endPrice={endPrice}
        osmoPrice={osmoPrice}
        price={price}
        date={dataHover.date}
        exchangeRate={dataHover.price}
      />
      {/* <p>DailyVolume: {formaterNumber(simulation.daily_volume)}OSMO</p>
      <p>TotalVolume: {formaterNumber(simulation.total_volume)}OSMO</p>
      <p>Total Buys: {simulation.total_buys} </p>
      <p>Start Price: {formateNumberPriceDecimals(startPrice)} </p>
      <p>End Price: {formateNumberPriceDecimals(endPrice)} </p>
      <br />
      <p>Exchange Rate: 1STARS={dataHover.price}OSMO</p>
      <p>OSMO Price: {formateNumberPriceDecimals(osmoPrice)}</p>
      <p>STARS Price: {formateNumberPriceDecimals(price, 6)}</p>
      <p>DateTime: {dataHover.date}</p> */}
      <PriceChart data={simulation.data} crossMove={crossMove} />
    </div>
  );
};

interface Token {
  amount: string;
  denom: string;
}
interface PoolAsset {
  token: Token;
  weight: string;
}
interface SimulationResponse {
  daily_volume: number;
  total_volume: number;
  total_buys: number;
  data: Array<any>;
  initial_assets: Array<PoolAsset>;
  end_assets: Array<PoolAsset>;
}

interface SimulationInfoProps {
  daily_volume: number;
  total_volume: number;
  total_buys: number;
  initial_assets: Array<PoolAsset>;
  end_assets: Array<PoolAsset>;
  startPrice: number;
  endPrice: number;
  osmoPrice: number;
  price: number;
  date: string;
  exchangeRate: string;
}
const SimulationInfo: React.FC<SimulationInfoProps> = (simulation) => {
  // <p>DailyVolume: {formaterNumber(simulation.daily_volume)}OSMO</p>
  // <p>TotalVolume: {formaterNumber(simulation.total_volume)}OSMO</p>
  // <p>Total Buys: {simulation.total_buys} </p>
  // <p>Start Price: {formateNumberPriceDecimals(startPrice)} </p>
  // <p>End Price: {formateNumberPriceDecimals(endPrice)} </p>
  // <br />
  // <p>Exchange Rate: 1STARS={dataHover.price}OSMO</p>
  // <p>OSMO Price: {formateNumberPriceDecimals(osmoPrice)}</p>
  // <p>STARS Price: {formateNumberPriceDecimals(price, 6)}</p>
  // <p>DateTime: {dataHover.date}</p>

  return (
    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
      <dl className="grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-4">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">DailyVolume</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {formaterNumber(simulation.daily_volume)}OSMO
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">TotalVolume</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {formaterNumber(simulation.total_volume)}OSMO
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm font-medium text-gray-500">TotalBuys</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {simulation.total_buys}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">OSMO Price</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {formateNumberPriceDecimals(simulation.osmoPrice)}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Start Price</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {formateNumberPriceDecimals(simulation.startPrice)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm font-medium text-gray-500">End Price</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {formateNumberPriceDecimals(simulation.endPrice)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm font-medium text-gray-500">Initial Assets</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {simulation.initial_assets.length > 1
              ? `${simulation.initial_assets[0].token.amount}${simulation.initial_assets[0].token.denom}`
              : null}
            ,
            {simulation.initial_assets.length > 1
              ? `${simulation.initial_assets[1].token.amount}${simulation.initial_assets[1].token.denom}`
              : null}
          </dd>
        </div>{' '}
        <div className="sm:col-span-2">
          <dt className="text-sm font-medium text-gray-500">End Assets</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {simulation.end_assets.length > 1
              ? `${simulation.end_assets[0].token.amount}${simulation.end_assets[0].token.denom}`
              : null}
            ,
            {simulation.end_assets.length > 1
              ? `${simulation.end_assets[1].token.amount}${simulation.end_assets[1].token.denom}`
              : null}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">DateTime</dt>
          <dd className="mt-1 text-sm text-gray-900">{simulation.date}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Exchange Rate</dt>
          <dd className="mt-1 text-sm text-gray-900">
            1STARS={simulation.exchangeRate}OSMO
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">STARS Price</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {formateNumberPriceDecimals(simulation.price, 6)}
          </dd>
        </div>
      </dl>
    </div>
  );
};
export default function Home() {
  const [data, setData] = useState<SimulationResponse>({
    data: [],
    daily_volume: 0,
    total_buys: 0,
    total_volume: 0,
    initial_assets: [],
    end_assets: [],
  });
  const handleOnRun = (settings: RunSettings) => {
    const options = {
      method: 'POST',
      body: JSON.stringify({
        ...settings,
        fees: {
          swap: settings.fees.swap.toString(),
          exit: settings.fees.exit.toString(),
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    fetch('/api/simulate', options)
      .then((resp) => resp.json())
      .then((data) => {
        setData(data);
      });
  };

  return (
    <div>
      <Head>
        <title>LBP Simulator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-full mx-auto sm:px-6 lg:px-8 min-h-screen">
        <h1 className="text-4xl font-bold text-blue-600">
          OSMOSIS LBP Simulator
        </h1>
        <div className="flex-1 relative z-0 flex overflow-hidden h-5/6 ">
          <main className="flex-1 relative z-0  focus:outline-none xl:order-last p-2">
            <Chart simulation={data} />
          </main>
          <aside className="hidden relative xl:order-first xl:flex xl:flex-col flex-shrink-0 w-96 border-r border-gray-200 overflow-y-auto p-3">
            <Form onRun={handleOnRun} />
          </aside>
        </div>
      </div>
    </div>
  );
}
