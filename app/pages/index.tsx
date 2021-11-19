import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  formatDate,
  formatDateHours,
  formateNumberPrice,
  formateNumberPriceDecimals,
  formaterNumber,
  getInclude,
  twoNumber,
} from './util/helpers';

const PriceChart = dynamic(import('./components/charts/price'), {
  ssr: false,
});

function Chart() {
  const [data, setData] = useState([]);
  const [dataHover, setDataHover] = useState({ price: '0', date: '-' });
  const [selectTypeChart, setSelectTypeChart] = useState('price');
  useEffect(() => {
    fetch('/api/simulate')
      .then((resp) => resp.json())
      .then((data) => {
        setData(data.data);
      });
  }, []);

  const crossMove = useCallback(
    (event, serie) => {
      if (event.time) {
        const price = formateNumberPriceDecimals(
          event.seriesPrices.get(serie),
          6
        );
        const currentDate = new Date(event.time * 1000);
        setDataHover({ price, date: formatDateHours(currentDate) });
      }
    },
    [selectTypeChart]
  );

  return (
    <div style={{ width: '100%', height: 600 }}>
      <p>{dataHover.price}</p>
      <p>{dataHover.date}</p>
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

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <h1 className="text-6xl font-bold text-blue-600">LBP Simulator</h1>
        <Chart />
      </div>
    </div>
  );
}
