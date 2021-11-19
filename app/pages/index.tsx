import Head from 'next/head';
import { useState, useEffect, useCallback, useRef } from 'react';
import { RadioGroup } from '@headlessui/react';
import dynamic from 'next/dynamic';
import {
  formatDateHours,
  formateNumberDecimals,
  formateNumberPriceDecimals,
} from '../util/helpers';

const PriceChart = dynamic(() => import('../components/charts/price'), {
  ssr: false,
});

const lengthOptions = [
  { name: '3d', duration: '72h' },
  { name: '5d', duration: '120h' },
  { name: '7d', duration: '168h' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

interface Weight {
  stars: number;
  osmo: number;
}
interface RunSettings {
  initialWeight: Weight;
  endWeight: Weight;
  deposit: Weight;
  duration: string;
  volume: number;
}
interface FormProps {
  onRun?: (settings: RunSettings) => void;
}

const Form: React.FC<FormProps> = ({ onRun }) => {
  const [length, setLength] = useState(lengthOptions[1]);
  const [initialWeight, setInitialweight] = useState<Weight>({
    stars: 90,
    osmo: 10,
  });
  const [initialDeposit, setInitialDeposit] = useState<Weight>({
    stars: 50000000,
    osmo: 100000,
  });
  const [endWeight, setEndweight] = useState<Weight>({ stars: 1, osmo: 1 });
  const [dailyVolume, setDailyVolume] = useState(1000000);
  const handleClick = useCallback(() => {
    if (onRun) {
      onRun({
        duration: length.duration,
        initialWeight: initialWeight,
        endWeight: endWeight,
        volume: dailyVolume,
        deposit: initialDeposit,
      });
    }
  }, [length, initialWeight, endWeight, dailyVolume, onRun]);
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
              OSMO
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
              End Weigth
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
              OSMO
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
              Daily Volume
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
        </div>

        <div className="pt-5">
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
  data: Array<any>;
}
const Chart: React.FC<ChartOptions> = ({ data }) => {
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
  // initial price fetch
  useEffect(() => {
    fetchOsmoPrice();
  }, []);
  useEffect(() => {
    if (data.length > 0) {
      const first = data[0];
      const price = formateNumberDecimals(first.value, 6);
      const currentDate = new Date(first.time * 1000);
      setDataHover({
        price,
        value: first.value,
        date: formatDateHours(currentDate),
      });
    }
  }, [data]);
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
};
export default function Home() {
  const [data, setData] = useState([]);
  const handleOnRun = (settings: RunSettings) => {
    fetch('/api/simulate')
      .then((resp) => resp.json())
      .then((data) => {
        setData(data.data);
      });
  };

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
            <Chart data={data} />
          </main>
          <aside className="hidden relative xl:order-first xl:flex xl:flex-col flex-shrink-0 w-96 border-r border-gray-200 overflow-y-auto p-3">
            <Form onRun={handleOnRun} />
          </aside>
        </div>
      </div>
    </div>
  );
}
