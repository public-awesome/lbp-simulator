// @ts-nocheck
import React, { useEffect } from 'react';
import { useRef, memo } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { ResizeObserver } from 'resize-observer';
// import { useMediaQuery, useMediaQueries } from '@react-hook/media-query';

import { float2Numbers } from '../../util/helpers';

const TokenChartPrice = ({ data, crossMove }) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const serieRef = useRef(null);
  // const resizeObserver: any = useRef(null);
  // const { matches } = useMediaQueries({
  //   width: '(max-width: 400px)',
  // });
  // useEffect(() => {
  //   // resizeObserver.current = new ResizeObserver((entries, b) => {
  //   //   const { width, height } = entries[0].contentRect;
  //   //   chartRef.current.applyOptions({ width, height });
  //   //   setTimeout(() => {
  //   //     chartRef.current.timeScale().fitContent();
  //   //   }, 0);
  //   // });
  //   // resizeObserver.current.observe(containerRef.current, {
  //   //   box: 'content-box',
  //   // });
  //   // return () => {
  //   //   resizeObserver.current.disconnect();
  //   // };
  // }, [matches.width]);

  useEffect(() => {
    // Initialization
    if (chartRef.current === null) {
      let chart = createChart(containerRef.current, {
        layout: {
          backgroundColor: 'rgba(31, 33, 40,0)',
          textColor: '#000',
          // fontFamily: "'Inter'",
        },
        localization: {
          priceFormatter: (price) => {
            return float2Numbers(price);
          },
        },
        grid: {
          vertLines: {
            visible: false,
          },
          horzLines: {
            color: 'rgba(42, 46, 57, 0.5)',
            visible: false,
          },
        },
        crosshair: {
          mode: CrosshairMode?.Normal,
        },
        timeScale: {
          rightOffset: 1,
          barSpacing: 28,
          lockVisibleTimeRangeOnResize: true,
        },
      });
      serieRef.current = chart.addLineSeries();
      chartRef.current = chart;
    }
    chartRef.current.subscribeCrosshairMove((event) => {
      crossMove(event, serieRef.current);
    });
    return () => {
      chartRef.current.unsubscribeCrosshairMove();
    };
  }, [crossMove]);

  useEffect(() => {
    // When data is updated
    serieRef.current.setData(data);
    chartRef.current.timeScale().fitContent();
  }, [data]);

  return (
    <div
      style={{
        position: 'relative',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: '95%',
          width: '100%',
        }}
        ref={containerRef}
      ></div>
    </div>
  );
};

export default TokenChartPrice;
